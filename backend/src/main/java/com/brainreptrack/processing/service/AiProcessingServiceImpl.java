package com.brainreptrack.processing.service;

import com.brainreptrack.inbox.client.TranscriptionClient;
import com.brainreptrack.inbox.domain.ContentType;
import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.domain.NoteTag;
import com.brainreptrack.note.domain.Tag;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.TagRepository;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.processing.dto.AiAnalysisResult;
import com.brainreptrack.processing.dto.ClasificacionItem;
import com.brainreptrack.processing.dto.OllamaResponse;
import com.brainreptrack.processing.dto.PathProposal;
import com.brainreptrack.processing.dto.ProcessResultDto;
import com.brainreptrack.processing.dto.SuggestionDto;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AiProcessingServiceImpl implements AiProcessingService {

    private final InboxItemRepository inboxItemRepository;
    private final NoteRepository noteRepository;
    private final TagRepository tagRepository;
    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper;
    private final SuggestionAnalyzer suggestionAnalyzer;
    private final SummaryGenerationService summaryGenerationService;
    private final TranscriptionClient transcriptionClient;
    private final DateEventExtractorService dateEventExtractorService;
    private final Path markdownOutputDir;

    public AiProcessingServiceImpl(
            InboxItemRepository inboxItemRepository,
            NoteRepository noteRepository,
            TagRepository tagRepository,
            OllamaClient ollamaClient,
            ObjectMapper objectMapper,
            SuggestionAnalyzer suggestionAnalyzer,
            SummaryGenerationService summaryGenerationService,
            TranscriptionClient transcriptionClient,
            DateEventExtractorService dateEventExtractorService,
            @Value("${markdown.output-dir:./markdown-notes}") String markdownOutputDirStr) {
        this.inboxItemRepository = inboxItemRepository;
        this.noteRepository = noteRepository;
        this.tagRepository = tagRepository;
        this.ollamaClient = ollamaClient;
        this.objectMapper = objectMapper;
        this.suggestionAnalyzer = suggestionAnalyzer;
        this.summaryGenerationService = summaryGenerationService;
        this.transcriptionClient = transcriptionClient;
        this.dateEventExtractorService = dateEventExtractorService;
        this.markdownOutputDir = Paths.get(markdownOutputDirStr);
        try {
            Files.createDirectories(this.markdownOutputDir);
            log.info("[AI] Markdown output directory: {}", this.markdownOutputDir.toAbsolutePath());
        } catch (IOException e) {
            log.error("[AI] Could not create markdown output directory: {}", e.getMessage());
        }
    }

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
            // ── 1b. VIDEO_REF: download audio, transcribe, enrich rawText ────
            if ("VIDEO_REF".equals(item.getDetectedType()) && item.getSourceUrl() != null) {
                try {
                    log.info("[AI] VIDEO_REF detected — transcribing video: {}", item.getSourceUrl());
                    TranscriptionClient.VideoTranscriptionResponse videoResult = transcriptionClient
                            .transcribeVideo(item.getSourceUrl());

                    // Store: first line = video title, rest = transcript
                    String videoTitle = videoResult.getTitle() != null
                            ? videoResult.getTitle()
                            : item.getSourceUrl();
                    String transcript = videoResult.getTranscript() != null
                            ? videoResult.getTranscript()
                            : "";

                    item.setRawText(videoTitle + "\n" + transcript);
                    inboxItemRepository.save(item);

                    log.info("[AI] Video transcribed successfully: '{}' ({} chars transcript)",
                            videoTitle, transcript.length());
                } catch (Exception videoEx) {
                    log.warn("[AI] Video transcription failed for {}: {}. Processing with URL only.",
                            inboxItemId, videoEx.getMessage());
                    // Non-fatal — processing continues with the original URL text
                }
            }

            // ── 2. Load existing tag tree ───────────────────────────────────
            List<Tag> allTags = tagRepository.findAll();

            // ── 3. Build prompt (dynamic, content-type aware) ────────────────────
            String contentTypeCtx = buildContentTypeContext(item.getDetectedType());
            String prompt = buildPrompt(contentTypeCtx + item.getRawText(), allTags);

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

            // ── 5b. Generate extensive topic summary (with web search if needed) ─
            try {
                String summary = summaryGenerationService.generateSummary(
                        item.getRawText(), item.getDetectedType());
                if (summary != null && !summary.isBlank()) {
                    item.setAiSummary(summary);
                    log.info("[AI] Extensive summary generated for InboxItem {} ({} chars)",
                            inboxItemId, summary.length());
                }
            } catch (Exception summaryEx) {
                log.warn("[AI] Summary generation failed for InboxItem {}: {}",
                        inboxItemId, summaryEx.getMessage());
                // Non-fatal — processing continues without a summary
            }

            // ── 5c. Extract calendar event (date / appointment detection) ──────────────────
            try {
                Map<String, Object> calEvent = dateEventExtractorService.extract(item.getRawText());
                String eventType = String.valueOf(calEvent.getOrDefault("type", "NONE"));
                if ("DATE_EVENT".equals(eventType)) {
                    String calJson = objectMapper.writeValueAsString(calEvent);
                    item.setCalendarEvent(calJson);
                    log.info("[AI] Calendar event detected for InboxItem {}: date={}, title={}",
                            inboxItemId, calEvent.get("date"), calEvent.get("title"));
                } else {
                    log.debug("[AI] No calendar event in InboxItem {}", inboxItemId);
                }
            } catch (Exception calEx) {
                log.warn("[AI] Calendar event extraction failed for InboxItem {}: {}",
                        inboxItemId, calEx.getMessage());
                // Non-fatal
            }

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
    // Unified "Procesar" — replaces old approve/reject flow
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public ProcessResultDto processItem(UUID inboxItemId) {
        log.info("[AI] processItem started for InboxItem {}", inboxItemId);

        InboxItem item = inboxItemRepository.findById(inboxItemId)
                .orElseThrow(() -> new ResourceNotFoundException("InboxItem", inboxItemId));

        // ── 1. Parse existing classification ────────────────────────────────
        AiAnalysisResult classification = null;
        if (item.getProposalsJson() != null) {
            try {
                classification = parseResult(item.getProposalsJson());
            } catch (Exception e) {
                log.warn("[AI] Could not parse proposalsJson for {}: {}", inboxItemId, e.getMessage());
            }
        }

        // ── 2. Auto-create Note (equivalent to old approve) ─────────────────
        if (classification != null) {
            autoCreateNote(item, classification);
        }

        // ── 3. Mark as PROCESSED ────────────────────────────────────────────
        item.setStatus("PROCESSED");
        item.setProcessedAt(LocalDateTime.now());
        inboxItemRepository.save(item);

        // ── 4. Generate Markdown + save to file ────────────────────────────
        String markdown = "";
        try {
            String mdPrompt = buildMarkdownPrompt(item, classification);
            OllamaResponse mdResponse = ollamaClient.generate(mdPrompt);
            markdown = stripCodeFences(mdResponse.getResponse());

            // Append the extensive AI summary as a dedicated section in the markdown
            String aiSummary = item.getAiSummary();
            if (aiSummary != null && !aiSummary.isBlank()) {
                markdown = markdown + "\n\n## Resumen extenso\n\n" + aiSummary.strip() + "\n";
            }

            saveMarkdownToFile(item, markdown);
        } catch (Exception e) {
            log.error("[AI] Markdown generation failed for {}: {}", inboxItemId, e.getMessage());
        }

        // ── 5. Analyse suggestions (decoupled — rule-based) ─────────────────
        List<SuggestionDto> suggestions = suggestionAnalyzer.analyze(item);

        // ── 6. Build combined response ──────────────────────────────────────
        InboxItemResponseDto itemDto = InboxItemResponseDto.builder()
                .id(item.getId())
                .rawText(item.getRawText())
                .detectedType(item.getDetectedType())
                .status(item.getStatus())
                .proposalsJson(item.getProposalsJson())
                .finalJson(item.getFinalJson())
                .outputPath(item.getOutputPath())
                .sourceUrl(item.getSourceUrl())
                .metadata(item.getMetadata())
                .aiSummary(item.getAiSummary())
                .createdAt(item.getCreatedAt())
                .processedAt(item.getProcessedAt())
                .build();

        log.info("[AI] processItem completed for InboxItem {} — {} suggestions generated",
                inboxItemId, suggestions.size());

        return ProcessResultDto.builder()
                .item(itemDto)
                .classification(classification)
                .markdown(markdown)
                .aiSummary(item.getAiSummary())
                .suggestions(suggestions)
                .build();
    }

    // -------------------------------------------------------------------------
    // Markdown generation
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public String generateMarkdown(UUID inboxItemId) {
        log.info("[AI] Generating markdown for InboxItem {}", inboxItemId);
        InboxItem item = inboxItemRepository.findById(inboxItemId)
                .orElseThrow(() -> new ResourceNotFoundException("InboxItem", inboxItemId));

        AiAnalysisResult result = null;
        if (item.getProposalsJson() != null) {
            try {
                result = parseResult(item.getProposalsJson());
            } catch (Exception ignored) {
                // proposals might be absent or malformed – proceed without them
            }
        }

        String prompt = buildMarkdownPrompt(item, result);
        OllamaResponse ollamaResponse = ollamaClient.generate(prompt);
        String markdown = stripCodeFences(ollamaResponse.getResponse());

        // Append the extensive AI summary as a dedicated section
        String aiSummary = item.getAiSummary();
        if (aiSummary != null && !aiSummary.isBlank()) {
            markdown = markdown + "\n\n## Resumen extenso\n\n" + aiSummary.strip() + "\n";
        }

        // Save to file and store path
        String filePath = saveMarkdownToFile(item, markdown);

        log.info("[AI] Markdown generated and saved to {} for InboxItem {}", filePath, inboxItemId);
        return filePath;
    }

    /**
     * Writes markdown content to a .md file and updates the InboxItem's outputPath.
     * Returns the absolute path of the saved file.
     */
    private String saveMarkdownToFile(InboxItem item, String markdown) {
        try {
            Files.createDirectories(markdownOutputDir);

            // Build filename from item: sanitize first line of rawText or use ID
            String baseName = buildFileName(item);
            String fileName = baseName + ".md";
            Path filePath = markdownOutputDir.resolve(fileName);

            // Avoid overwriting: append counter if file exists
            int counter = 1;
            while (Files.exists(filePath)) {
                fileName = baseName + "_" + counter + ".md";
                filePath = markdownOutputDir.resolve(fileName);
                counter++;
            }

            Files.writeString(filePath, markdown, StandardCharsets.UTF_8);

            String absolutePath = filePath.toAbsolutePath().toString();
            item.setOutputPath(absolutePath);
            inboxItemRepository.save(item);

            log.info("[AI] Markdown file saved: {}", absolutePath);
            return absolutePath;
        } catch (IOException e) {
            log.error("[AI] Failed to save markdown file for InboxItem {}: {}", item.getId(), e.getMessage());
            return "";
        }
    }

    /**
     * Builds a safe filename from the InboxItem content.
     */
    private String buildFileName(InboxItem item) {
        String raw = item.getRawText();
        if (raw != null && !raw.isBlank()) {
            // Use first line, strip markdown heading markers, limit length
            String firstLine = raw.lines().filter(l -> !l.isBlank()).findFirst().orElse("");
            firstLine = firstLine.replaceFirst("^#+\\s*", "").strip();
            if (!firstLine.isBlank()) {
                // Sanitize: keep only alphanumeric, spaces, hyphens
                String safe = firstLine.replaceAll("[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\\s-]", "")
                        .strip()
                        .replaceAll("\\s+", "_");
                if (safe.length() > 80) {
                    safe = safe.substring(0, 80);
                }
                if (!safe.isBlank()) {
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                    return safe + "_" + timestamp;
                }
            }
        }
        // Fallback: use UUID + timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return "note_" + item.getId().toString().substring(0, 8) + "_" + timestamp;
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
        // storing the AI's per-level confidence. The tag name is the full
        // accumulated path up to that level (e.g. "dev", "dev/frontend",
        // "dev/frontend/react").
        int keptLevels = path.split("/").length;
        String[] pathParts = path.split("/");
        Set<NoteTag> tags = new LinkedHashSet<>();
        List<ClasificacionItem> keptLevelsItems = ordered.stream()
                .limit(keptLevels)
                .collect(Collectors.toList());
        for (int i = 0; i < keptLevelsItems.size(); i++) {
            String accumulatedPath = String.join("/", Arrays.copyOfRange(pathParts, 0, i + 1));
            tags.add(new NoteTag(accumulatedPath, keptLevelsItems.get(i).getConfianza() / 100.0));
        }

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
        for (int i = 0; i < parts.length; i++) {
            String segment = parts[i].trim();
            if (segment.isEmpty())
                continue;
            // Build the full accumulated path for this level (e.g. "ia", "ia/ml",
            // "ia/ml/tensorflow")
            String accumulatedName = String.join("/", Arrays.copyOfRange(parts, 0, i + 1));
            tagRepository.upsert(accumulatedName, parent);
            parent = accumulatedName;
        }
    }

    // -------------------------------------------------------------------------
    // Prompt builders
    // -------------------------------------------------------------------------

    /**
     * Selects the appropriate prompt strategy:
     * • No existing tags → creation mode (AI proposes a brand-new path).
     * • Tags exist → classification mode (AI classifies into the tree).
     *
     * Both modes receive content-type context when available.
     */
    private String buildPrompt(String rawText, List<Tag> allTags) {
        if (allTags.isEmpty()) {
            return buildCreationPrompt(rawText);
        } else {
            return buildClassificationPrompt(rawText, allTags);
        }
    }

    /**
     * Builds a content-type context preamble for the AI prompt.
     * This helps the model understand what kind of content it's analysing.
     */
    private String buildContentTypeContext(String detectedType) {
        if (detectedType == null || detectedType.isBlank())
            return "";
        ContentType type = ContentType.fromString(detectedType);
        return switch (type) {
            case LINK -> "\n[CONTENT TYPE: Web link. Focus on the topic the URL refers to, not the URL itself.]\n";
            case IDEA ->
                "\n[CONTENT TYPE: Fleeting idea. This is a quick, unstructured thought. Classify by its core topic.]\n";
            case VOICE_NOTE ->
                "\n[CONTENT TYPE: Voice note transcription. May contain informal language, filler words, or incomplete sentences. Extract the core meaning.]\n";
            case CODE ->
                "\n[CONTENT TYPE: Code snippet. Classify by the technology, language, or domain the code belongs to.]\n";
            case VIDEO_REF ->
                "\n[CONTENT TYPE: Video transcription. The first line is the video title, followed by the audio transcript. Classify by the subject matter of the video content.]\n";
            case ARTICLE_REF ->
                "\n[CONTENT TYPE: Article/paper reference. Classify by the article's topic and field.]\n";
            case FILE -> "\n[CONTENT TYPE: File attachment. Classify based on the file description or name.]\n";
            case BROWSER_EXTENSION -> "\n[CONTENT TYPE: Browser capture. Content was captured from a web page.]\n";
            default -> "";
        };
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

    /**
     * Builds the prompt for converting raw inbox content into a clean Markdown
     * note.
     */
    private String buildMarkdownPrompt(InboxItem item, AiAnalysisResult result) {
        StringBuilder context = new StringBuilder();

        if (result != null) {
            // Build path string from classification
            List<ClasificacionItem> clasif = result.getClasificacion();
            if (clasif != null && !clasif.isEmpty()) {
                String path = clasif.stream()
                        .sorted(Comparator.comparingInt(ClasificacionItem::getNivel))
                        .map(ClasificacionItem::getEtiqueta)
                        .collect(Collectors.joining(" > "));
                context.append("Classification path: ").append(path).append("\n");
            }
            String motivo = result.getMotivo();
            if (motivo != null && !motivo.isBlank()) {
                context.append("AI summary context: ").append(motivo).append("\n");
            }
        }

        // Include the extensive AI summary if available
        String aiSummary = item.getAiSummary();
        if (aiSummary != null && !aiSummary.isBlank()) {
            context.append("\nExtensive topic summary (use this to enrich the note):\n");
            context.append(aiSummary).append("\n");
        }

        String detectedType = item.getDetectedType() != null ? item.getDetectedType() : "TEXT";
        String createdAt = item.getCreatedAt() != null ? item.getCreatedAt().toString() : "unknown";

        return """
                You are a Markdown note generator for a personal knowledge base.
                Convert the following raw content into a clean, well-structured Markdown note.
                If an extensive topic summary is provided, USE IT to create a richer, more
                detailed note that goes beyond the original raw content.

                Context provided:
                """ + context + """
                Detected content type: """ + detectedType + """

                Rules:
                - Start with a single # heading derived from the content (NOT from the classification path).
                - Use ## subheadings if the content has clear sections.
                - If an extensive summary is provided, integrate its key points into the note
                  as additional sections (## Contexto, ## Detalles, etc.).
                - Convert any lists, enumerations or steps into proper Markdown lists (- or 1.).
                - Preserve URLs as [text](url) links.
                - At the bottom, add a metadata block like:
                  ---
                  tags: tag1, tag2, tag3
                  type: """ + detectedType + """
                created: """ + createdAt + """
                - "tags" must be the classification labels (if provided), otherwise infer 2-4 relevant keywords.
                - Do NOT add a preamble like "Here is the note:" — output ONLY the Markdown.
                - Do NOT wrap output in code fences.
                - Do NOT wrap output in a JSON object like {"note": "..."}. Return raw Markdown text only.

                Raw content to convert:
                """ + item.getRawText();
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
     * Strips wrapping Markdown code-fences and/or JSON wrappers
     * (e.g. {"note": "..."}) that the model may add around its output.
     */
    private String stripCodeFences(String text) {
        if (text == null)
            return "";
        String stripped = text.strip();

        // 1. Strip markdown code fences: ```markdown ... ``` or ``` ... ```
        if (stripped.startsWith("```")) {
            stripped = stripped
                    .replaceFirst("^```(?:markdown)?\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .strip();
        }

        // 2. Unwrap JSON object wrapper: {"note": "...", ...} or {"markdown": "..."}
        if (stripped.startsWith("{") && stripped.endsWith("}")) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = objectMapper.readValue(stripped, Map.class);
                // Try common keys the model might use
                for (String key : List.of("note", "markdown", "content", "text", "output")) {
                    Object val = map.get(key);
                    if (val instanceof String s && !s.isBlank()) {
                        log.info("[AI] Unwrapped JSON key '{}' from markdown response", key);
                        stripped = s.strip();
                        break;
                    }
                }
            } catch (Exception ignored) {
                // Not valid JSON — leave as is
            }
        }

        return stripped;
    }

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
