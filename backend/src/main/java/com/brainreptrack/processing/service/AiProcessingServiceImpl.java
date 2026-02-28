package com.brainreptrack.processing.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.domain.NoteTag;
import com.brainreptrack.note.domain.Tag;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.TagRepository;
import com.brainreptrack.processing.dto.AiAnalysisResult;
import com.brainreptrack.processing.dto.ClasificacionItem;
import com.brainreptrack.processing.dto.OllamaResponse;
import com.brainreptrack.processing.dto.PathProposal;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiProcessingServiceImpl implements AiProcessingService {

    private final InboxItemRepository inboxItemRepository;
    private final NoteRepository noteRepository;
    private final TagRepository tagRepository;
    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    @Async("aiTaskExecutor")
    @Transactional
    public void processAsync(UUID inboxItemId) {
        log.info("[AI] Async processing started for InboxItem {}", inboxItemId);
        doProcess(inboxItemId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void process(UUID inboxItemId) {
        log.info("[AI] Sync processing started for InboxItem {}", inboxItemId);
        doProcess(inboxItemId);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /**
     * Core processing logic shared by both sync and async paths.
     *
     * Status flow: PENDING → PROCESSING → PROCESSED
     * ↘ PENDING (on error)
     *
     * NOTE: called from within the proxy-managed methods above,
     * so it participates in their transaction.
     */
    private void doProcess(UUID inboxItemId) {
        InboxItem item = inboxItemRepository.findById(inboxItemId)
                .orElseThrow(() -> new ResourceNotFoundException("InboxItem", inboxItemId));

        // ── 1. Mark as processing ────────────────────────────────────────────
        item.setStatus("PROCESSING");
        inboxItemRepository.save(item);

        try {
            // ── 2. Load existing tag tree ───────────────────────────────────
            List<Tag> allTags = tagRepository.findAll();

            // ── 3. Build prompt (dynamic) ───────────────────────────────
            String prompt = buildPrompt(item.getRawText(), allTags);

            // ── 3. Call AI ───────────────────────────────────────────────────
            OllamaResponse ollamaResponse = ollamaClient.generate(prompt);
            String rawJson = ollamaResponse.getResponse();

            log.debug("[AI] Raw response for {}: {}", inboxItemId, rawJson);

            // ── 4. Parse result ──────────────────────────────────────────────
            AiAnalysisResult result = parseResult(rawJson);

            // ── 4b. Fallback: if classification returned no valid match,
            // the text belongs to a brand-new topic — retry in creation mode.
            if (!allTags.isEmpty() && !result.isClasificacionFinalValida()) {
                log.info("[AI] Classification yielded no match for InboxItem {}, falling back to creation mode",
                        inboxItemId);
                String creationPrompt = buildCreationPrompt(item.getRawText());
                OllamaResponse fallbackResponse = ollamaClient.generate(creationPrompt);
                result = parseResult(fallbackResponse.getResponse());
                log.debug("[AI] Fallback creation result for {}: {}", inboxItemId, fallbackResponse.getResponse());
            }

            // ── 5. Store result as JSON ──────────────────────────────────────
            String proposalsJson = objectMapper.writeValueAsString(result);
            item.setProposalsJson(proposalsJson);

            // ── 6. Mark as awaiting user approval ────────────────────────────────
            item.setStatus("AWAITING_APPROVAL");
            item.setProcessedAt(LocalDateTime.now());
            inboxItemRepository.save(item);

            log.info("[AI] Processing finished for InboxItem {} – awaiting user approval (mode={})",
                    inboxItemId, allTags.isEmpty() ? "creation" : "classification");

        } catch (Exception e) {
            log.error("[AI] Processing failed for InboxItem {}: {}", inboxItemId, e.getMessage(), e);
            // Reset to PENDING so the user can retry
            item.setStatus("PENDING");
            inboxItemRepository.save(item);
        }
    }

    // -------------------------------------------------------------------------
    // User approval
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void approve(UUID inboxItemId) {
        log.info("[AI] User approved InboxItem {}", inboxItemId);
        InboxItem item = inboxItemRepository.findById(inboxItemId)
                .orElseThrow(() -> new ResourceNotFoundException("InboxItem", inboxItemId));

        AiAnalysisResult result;
        try {
            result = parseResult(item.getProposalsJson());
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse proposals for InboxItem " + inboxItemId, e);
        }

        autoCreateNote(item, result);

        item.setStatus("PROCESSED");
        inboxItemRepository.save(item);
        log.info("[AI] Note created and InboxItem {} marked PROCESSED", inboxItemId);
    }

    // -------------------------------------------------------------------------
    // Note auto-creation
    // -------------------------------------------------------------------------

    private static final int MAX_PATH_DEPTH = 3;
    private static final double OVERLAP_CONFIDENCE_THRESHOLD = 0.60;

    /**
     * Creates a Note from the AI result, supporting both creation and
     * classification modes.
     * Idempotent: skips if a Note already exists for this InboxItem.
     */
    private void autoCreateNote(InboxItem item, AiAnalysisResult result) {
        // Idempotency guard
        if (noteRepository.existsByInboxItem_Id(item.getId())) {
            log.debug("[AI] Note already exists for InboxItem {}, skipping", item.getId());
            return;
        }

        // Title = first non-empty line of rawText, capped at 120 chars
        String raw = item.getRawText().trim();
        int nl = raw.indexOf('\n');
        String title = (nl > 0 ? raw.substring(0, nl).trim() : raw);
        if (title.length() > 120)
            title = title.substring(0, 120).trim() + "…";

        // Both creation and classification modes now return the clasificacion format.
        // Backward-compat: fall back to old paths format for items processed before the
        // prompt unification.
        List<ClasificacionItem> clasif = result.getClasificacion();

        if (clasif == null || clasif.isEmpty()) {
            // ── Legacy creation-mode fallback (paths format) ─────────────────
            if (result.getPaths() != null && !result.getPaths().isEmpty()) {
                PathProposal best = result.getPaths().get(0);
                String path = clampPath(best.getPath(), MAX_PATH_DEPTH);
                Set<NoteTag> tags = Arrays.stream(path.split("/"))
                        .map(seg -> new NoteTag(seg, null))
                        .collect(Collectors.toCollection(LinkedHashSet::new));
                if (result.getKeywords() != null)
                    result.getKeywords().forEach(kw -> tags.add(new NoteTag(kw, null)));
                // Tags must exist in the tags registry BEFORE note_tags rows are inserted.
                upsertTagHierarchy(path);
                Note note = Note.builder()
                        .title(title).path(path).type("CONCEPT")
                        .summary(result.getRationale())
                        .confidenceScore(best.getConfidence())
                        .inboxItem(item).build();
                note.setTags(tags);
                noteRepository.save(note);
                log.info("[AI] Auto-created Note '{}' (path={}, mode=legacy-creation) for InboxItem {}",
                        title, path, item.getId());
            } else {
                log.warn("[AI] No clasificacion or paths in result for InboxItem {}, skipping", item.getId());
            }
            return;
        }

        // ── Unified clasificacion path ────────────────────────────────────────
        // The user has already decided to approve – proceed regardless of the
        // clasificacion_final_valida flag that was only advisory in the AI response.
        List<ClasificacionItem> ordered = clasif.stream()
                .sorted(Comparator.comparingInt(ClasificacionItem::getNivel))
                .collect(Collectors.toList());

        String path = ordered.stream()
                .map(ClasificacionItem::getEtiqueta)
                .collect(Collectors.joining("/"));
        path = clampPath(path, MAX_PATH_DEPTH);

        // Overall note confidence = minimum per-level confidence (weakest link)
        double confidence = ordered.stream()
                .mapToDouble(ClasificacionItem::getConfianza)
                .min().orElse(0.0) / 100.0;

        // Skip only if a note with the EXACT same path already exists with high
        // confidence.
        // (Prevents duplicates but allows new notes in the same category tree.)
        if (noteRepository.existsByPathAndConfidenceScoreGreaterThan(path, OVERLAP_CONFIDENCE_THRESHOLD)) {
            log.info("[AI] Exact-path duplicate for '{}', skipping InboxItem {}", path, item.getId());
            return;
        }

        // Tags: one NoteTag per classification level that survived clamping,
        // storing the AI's per-level confidence. Use limit() not contains() to
        // avoid substring false-positives (e.g. "ia" inside "inteligencia-artificial").
        int keptLevels = path.split("/").length;
        Set<NoteTag> tags = ordered.stream()
                .limit(keptLevels)
                .map(c -> new NoteTag(c.getEtiqueta(), c.getConfianza() / 100.0))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        // Tags must exist in the tags registry BEFORE note_tags rows are inserted.
        upsertTagHierarchy(path);

        Note note = Note.builder()
                .title(title)
                .path(path)
                .type("CONCEPT")
                .summary(result.getMotivo())
                .confidenceScore(confidence)
                .inboxItem(item)
                .build();
        note.setTags(tags);
        noteRepository.save(note);

        boolean isNew = clasif.stream().anyMatch(c -> tagRepository.findByName(c.getEtiqueta()).isEmpty());
        log.info("[AI] Auto-created Note '{}' (path={}, mode={}) for InboxItem {}",
                title, path, isNew ? "creation" : "classification", item.getId());
    }

    /**
     * Limits a slash-separated path to at most {@code maxDepth} segments.
     */
    private String clampPath(String path, int maxDepth) {
        if (path == null || path.isBlank())
            return "";
        String[] parts = path.split("/");
        if (parts.length <= maxDepth)
            return path;
        return String.join("/", Arrays.copyOf(parts, maxDepth));
    }

    /**
     * Inserts all segments of a slash-separated path into the tags table
     * with proper parent references (broad → specific).
     */
    private void upsertTagHierarchy(String path) {
        if (path == null || path.isBlank())
            return;
        String[] parts = path.split("/");
        String parent = null;
        for (String part : parts) {
            String name = part.trim();
            if (name.isEmpty())
                continue;
            tagRepository.upsert(name, parent);
            parent = name;
        }
    }

    // -------------------------------------------------------------------------
    // Prompt builders
    // -------------------------------------------------------------------------

    /**
     * Selects the appropriate prompt strategy:
     * • No existing tags → creation mode (AI proposes a brand-new path).
     * • Tags exist → classification mode (AI classifies into the tree).
     */
    private String buildPrompt(String rawText, List<Tag> allTags) {
        if (allTags.isEmpty()) {
            return buildCreationPrompt(rawText);
        } else {
            return buildClassificationPrompt(rawText, allTags);
        }
    }

    /**
     * Used when the tag registry is empty — AI invents a fresh path hierarchy.
     * Returns the same {@code clasificacion} JSON format as classification mode.
     *
     * The prompt walks the model through a strict step-by-step decision:
     * Step 1 → choose a root category → check confidence > 60 to continue
     * Step 2 → choose a subcategory → check confidence > 60 to continue
     * Step 3 → choose a leaf topic → always the last level
     */
    private String buildCreationPrompt(String rawText) {
        return """
                You are a knowledge organization system.
                Your task is to create a hierarchical path to classify the following text.
                The path has at most 3 levels: category → subcategory → topic.

                Follow EXACTLY these steps in order:

                STEP 1 – ROOT CATEGORY (level 1):
                  Think of the broadest category that describes the text.
                  Assign a confidence percentage (0-100) to that choice.
                  • If confidence is GREATER than 60 → include level 1 and continue to STEP 2.
                  • If confidence is 60 or lower → stop; result is an empty classification.

                STEP 2 – SUBCATEGORY (level 2):
                  Within the level 1 category, choose the subcategory that best fits.
                  Assign a confidence percentage (0-100) to that choice.
                  • If confidence is GREATER than 60 → include level 2 and continue to STEP 3.
                  • If confidence is 60 or lower → stop; result has only level 1.

                STEP 3 – SPECIFIC TOPIC (level 3):
                  Within the level 2 subcategory, choose the most specific topic.
                  Assign a confidence percentage (0-100) to that choice.
                  • Include level 3 if its confidence is GREATER than 60, otherwise omit it.

                RULES for label names:
                  - Lowercase, no spaces (use hyphens: "artificial-intelligence").
                  - Maximum 30 characters per label.
                  - No accents or special characters.

                FINAL RULE:
                  "clasificacion_final_valida" must be true only if you included AT LEAST level 1
                  with confidence > 60. If no level exceeds 60, return an empty "clasificacion"
                  and "clasificacion_final_valida": false.

                Return ONLY this JSON (no additional text, no code blocks):

                {
                  "clasificacion": [
                    { "nivel": 1, "etiqueta": "category-name", "confianza": 85 },
                    { "nivel": 2, "etiqueta": "subcategory-name", "confianza": 74 },
                    { "nivel": 3, "etiqueta": "topic-name", "confianza": 68 }
                  ],
                  "clasificacion_final_valida": true,
                  "motivo": "One sentence in English explaining the classification."
                }

                Text to analyze:
                """ + rawText;
    }

    /**
     * Used when tags already exist — AI classifies into the existing tree.
     *
     * The prompt forces the model through a strict level-by-level decision:
     * Step 1 → evaluate ONLY root tags (parentName=null) → pick best if > 60
     * Step 2 → evaluate ONLY children of chosen root → pick best if > 60
     * Step 3 → evaluate ONLY grandchildren of chosen child → pick best if > 60
     */
    private String buildClassificationPrompt(String rawText, List<Tag> allTags) {
        // Split the tree into two sections: root names and the full indented tree.
        // Listing root names separately makes Step 1 unambiguous for the model.
        String rootNames = allTags.stream()
                .filter(t -> t.getParentName() == null)
                .sorted(Comparator.comparing(Tag::getName))
                .map(t -> "  - " + t.getName())
                .collect(Collectors.joining("\n"));
        String treeStr = buildTagTreeString(allTags);

        return "You are a strict hierarchical classification system.\n"
                + "Your task is to place the text within the existing tag structure.\n"
                + "\n"
                + "FULL TAG TREE (root → children → grandchildren):\n"
                + treeStr
                + "\n"
                + "ROOT TAGS (no parent, level 1):\n"
                + rootNames + "\n"
                + "\n"
                + "Follow EXACTLY these steps in order:\n"
                + "\n"
                + "STEP 1 – ROOT TAG (level 1):\n"
                + "  Compare the text ONLY against the root tags listed above.\n"
                + "  Choose the most relevant one and assign it a confidence percentage (0-100).\n"
                + "  • If confidence is GREATER than 60 → include that tag as level 1 and continue to STEP 2.\n"
                + "  • If confidence is 60 or lower → stop; result: empty classification.\n"
                + "\n"
                + "STEP 2 – DIRECT CHILD (level 2):\n"
                + "  Look at the direct children of the tag chosen in STEP 1 within the tree.\n"
                + "  Compare the text ONLY against those children.\n"
                + "  Choose the most relevant one and assign it a confidence percentage (0-100).\n"
                + "  • If confidence is GREATER than 60 → include that tag as level 2 and continue to STEP 3.\n"
                + "  • If confidence is 60 or lower → stop; result: level 1 only.\n"
                + "  • If level 1 has no children → stop; result: level 1 only.\n"
                + "\n"
                + "STEP 3 – GRANDCHILD (level 3):\n"
                + "  Look at the direct children of the tag chosen in STEP 2 within the tree.\n"
                + "  Compare the text ONLY against those children.\n"
                + "  Choose the most relevant one and assign it a confidence percentage (0-100).\n"
                + "  • If confidence is GREATER than 60 → include that tag as level 3.\n"
                + "  • If confidence is 60 or lower → stop; result: levels 1 and 2 only.\n"
                + "  • If level 2 has no children → stop; result: levels 1 and 2 only.\n"
                + "\n"
                + "STRICT RULES:\n"
                + "  - NEVER invent new tags. Use only names from the tree.\n"
                + "  - NEVER skip a level (level 2 must be a direct child of level 1, etc.).\n"
                + "  - \"clasificacion_final_valida\" is true only if you included AT LEAST level 1 with confidence > 60.\n"
                + "\n"
                + "Return ONLY this JSON (no additional text, no code blocks):\n"
                + "\n"
                + "{\n"
                + "  \"clasificacion\": [\n"
                + "    { \"nivel\": 1, \"etiqueta\": \"RootName\", \"confianza\": 85 },\n"
                + "    { \"nivel\": 2, \"etiqueta\": \"ChildName\", \"confianza\": 72 }\n"
                + "  ],\n"
                + "  \"clasificacion_final_valida\": true,\n"
                + "  \"motivo\": \"One sentence in English explaining why that path was chosen.\"\n"
                + "}\n"
                + "\n"
                + "Text to classify:\n"
                + rawText;
    }

    /** Builds a human-readable indented tree from all stored tags. */
    private String buildTagTreeString(List<Tag> allTags) {
        Map<String, List<Tag>> byParent = allTags.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getParentName() != null ? t.getParentName() : ""));

        List<Tag> roots = allTags.stream()
                .filter(t -> t.getParentName() == null)
                .sorted(Comparator.comparing(Tag::getName))
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        Set<String> visited = new HashSet<>();
        for (Tag root : roots) {
            appendTagNode(sb, root, byParent, 0, visited);
        }
        return sb.toString();
    }

    private void appendTagNode(StringBuilder sb, Tag tag,
            Map<String, List<Tag>> byParent, int depth, Set<String> visited) {
        if (!visited.add(tag.getName())) {
            log.warn("[AI] Cycle detected in tag tree at '{}', skipping to prevent infinite loop", tag.getName());
            return;
        }
        sb.append("  ".repeat(depth)).append("- ").append(tag.getName()).append("\n");
        List<Tag> children = byParent.getOrDefault(tag.getName(), List.of());
        children.stream()
                .sorted(Comparator.comparing(Tag::getName))
                .forEach(child -> appendTagNode(sb, child, byParent, depth + 1, visited));
        visited.remove(tag.getName()); // allow same tag under different branches
    }

    // -------------------------------------------------------------------------
    // Response parser
    // -------------------------------------------------------------------------

    /**
     * Parses the JSON text returned by Ollama.
     * Handles cases where the model wraps the JSON in markdown code-fences.
     */
    private AiAnalysisResult parseResult(String rawJson) throws Exception {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalStateException("AI returned an empty response");
        }

        // Strip potential markdown code fences: ```json ... ``` or ``` ... ```
        String cleaned = rawJson.strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .strip();
        }

        // Find the outermost JSON object in case the model adds surrounding text
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            cleaned = cleaned.substring(start, end + 1);
        }

        return objectMapper.readValue(cleaned, AiAnalysisResult.class);
    }
}
