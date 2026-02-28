package com.brainreptrack.processing.service;

import com.brainreptrack.processing.dto.OllamaResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Generates an extensive summary of the topic discussed in an inbox item.
 * <p>
 * Pipeline:
 * <ol>
 * <li>Asks Llama whether the raw content provides enough information
 * for a comprehensive summary.</li>
 * <li>If not, uses {@link WebSearchService} to fetch additional web
 * context about the topic.</li>
 * <li>Sends all collected context to Llama to produce a rich, detailed
 * summary in Spanish.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryGenerationService {

    private final OllamaClient ollamaClient;
    private final WebSearchService webSearchService;
    private final ObjectMapper objectMapper;

    // ── Minimum word threshold below which we always search the web ──
    private static final int MIN_WORDS_FOR_SELF_SUFFICIENT = 40;

    /**
     * Generates an extensive summary for the given raw content.
     *
     * @param rawText      the original text / transcription / idea
     * @param detectedType the content type (TEXT, IDEA, VOICE_NOTE, etc.)
     * @return the generated summary (may be multi-paragraph)
     */
    public String generateSummary(String rawText, String detectedType) {
        log.info("[Summary] Starting summary generation (type={}, length={})",
                detectedType, rawText != null ? rawText.length() : 0);

        if (rawText == null || rawText.isBlank()) {
            log.warn("[Summary] Raw text is empty, skipping summary generation");
            return "";
        }

        // ── Step 1: Determine if the content needs web enrichment ────────
        boolean needsWebSearch = needsWebEnrichment(rawText);

        String webContext = "";
        if (needsWebSearch) {
            // ── Step 2: Extract search query from the content ────────────
            String searchQuery = extractSearchQuery(rawText);
            log.info("[Summary] Content needs enrichment. Searching web for: {}", searchQuery);

            // ── Step 3: Fetch web results ────────────────────────────────
            List<WebSearchService.SearchResult> results = webSearchService.search(searchQuery);
            webContext = webSearchService.formatResultsAsContext(results);

            if (webContext.isBlank()) {
                log.info("[Summary] No web results found, proceeding with original content only");
            } else {
                log.info("[Summary] Enriched with {} web sources", results.size());
            }
        } else {
            log.info("[Summary] Content appears self-sufficient, skipping web search");
        }

        // ── Step 4: Generate the extensive summary ───────────────────────
        return buildExtensiveSummary(rawText, detectedType, webContext);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Determines whether the raw content has enough substance for a good
     * summary or whether we should search the web for more context.
     * <p>
     * Uses a two-pronged approach:
     * 1. Simple heuristic: very short texts always need enrichment.
     * 2. AI evaluation: ask Llama directly if more context is needed.
     */
    private boolean needsWebEnrichment(String rawText) {
        // Short texts nearly always benefit from web context
        int wordCount = rawText.trim().split("\\s+").length;
        if (wordCount < MIN_WORDS_FOR_SELF_SUFFICIENT) {
            log.debug("[Summary] Text has {} words (< {}), will search web",
                    wordCount, MIN_WORDS_FOR_SELF_SUFFICIENT);
            return true;
        }

        // Ask Llama to evaluate
        try {
            String systemPrompt = "You are an information sufficiency evaluator. " +
                    "Respond ONLY with valid JSON, no additional text.";

            String userPrompt = """
                    Analyze the following text and determine if it contains enough detailed
                    information to write a comprehensive, multi-paragraph summary about its
                    main topic.

                    Consider:
                    - Does it explain the topic in depth, or is it just a brief mention?
                    - Are there enough details, examples, or explanations?
                    - Would a reader understand the topic well from this text alone?

                    Respond with ONLY this JSON:
                    {
                      "sufficient": true or false,
                      "topic": "main topic in 3-6 words",
                      "reason": "one sentence explaining why"
                    }

                    Text to evaluate:
                    """ + rawText;

            OllamaResponse response = ollamaClient.generate(
                    buildEvaluationPrompt(systemPrompt, userPrompt));

            String json = response.getResponse();
            if (json != null && !json.isBlank()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = objectMapper.readValue(json.trim(), Map.class);
                boolean sufficient = Boolean.TRUE.equals(result.get("sufficient"));
                String reason = (String) result.getOrDefault("reason", "");
                log.info("[Summary] AI sufficiency check: sufficient={}, reason='{}'", sufficient, reason);
                return !sufficient;
            }
        } catch (Exception e) {
            log.warn("[Summary] AI sufficiency check failed: {}. Defaulting to web search.", e.getMessage());
        }
        // Default: search if unsure
        return true;
    }

    /**
     * Asks Llama to produce a concise search query from the raw content
     * so we can look it up on the web.
     */
    private String extractSearchQuery(String rawText) {
        try {
            String systemPrompt = "You are a search query extractor. " +
                    "Respond ONLY with valid JSON, no additional text.";

            String userPrompt = """
                    Read the following text and extract the best search query to find
                    comprehensive information about its main topic on the internet.

                    The query should be:
                    - In the SAME LANGUAGE as the original text
                    - Between 3 and 10 words
                    - Focused on the core subject
                    - Suitable for a web search engine

                    Respond with ONLY this JSON:
                    { "query": "your search query here" }

                    Text:
                    """ + rawText;

            OllamaResponse response = ollamaClient.generate(
                    buildEvaluationPrompt(systemPrompt, userPrompt));

            String json = response.getResponse();
            if (json != null && !json.isBlank()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = objectMapper.readValue(json.trim(), Map.class);
                String query = (String) result.get("query");
                if (query != null && !query.isBlank()) {
                    return query;
                }
            }
        } catch (Exception e) {
            log.warn("[Summary] Query extraction failed: {}. Using raw text truncation.", e.getMessage());
        }

        // Fallback: first 60 chars of raw text
        String fallback = rawText.trim().replaceAll("\\s+", " ");
        return fallback.length() > 60 ? fallback.substring(0, 60) : fallback;
    }

    /**
     * Generates the final extensive summary by sending the raw content
     * (optionally enriched with web context) to Llama.
     */
    private String buildExtensiveSummary(String rawText, String detectedType, String webContext) {
        String typeHint = detectedType != null ? detectedType : "TEXT";

        String systemPrompt = """
                You are a knowledgeable research assistant that creates comprehensive,
                well-structured summaries in Spanish. You write in a clear, informative
                style, covering all important aspects of the topic. Your summaries should
                be educational and useful for someone building a personal knowledge base.
                """;

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("""
                Genera un resumen EXTENSO y DETALLADO sobre el tema principal del siguiente contenido.

                INSTRUCCIONES:
                1. Identifica el tema central del contenido proporcionado.
                2. Escribe un resumen completo que cubra:
                   - Definición y contexto del tema
                   - Puntos clave y conceptos importantes
                   - Detalles relevantes, ejemplos o aplicaciones
                   - Información complementaria que enriquezca la comprensión
                3. El resumen debe tener al menos 3-5 párrafos bien desarrollados.
                4. Usa un tono informativo y claro, como si fuera una entrada de enciclopedia personal.
                5. Si se proporciona información adicional de internet, INTÉGRALA naturalmente
                   en el resumen sin mencionarla como fuente separada.
                6. Escribe SIEMPRE en español.
                7. NO uses formato markdown (ni #, ni **, ni listas con -).
                   Escribe texto plano con párrafos separados por líneas en blanco.

                """);

        userPrompt.append("Tipo de contenido original: ").append(typeHint).append("\n\n");
        userPrompt.append("CONTENIDO ORIGINAL:\n").append(rawText).append("\n");

        if (!webContext.isBlank()) {
            userPrompt.append(webContext);
        }

        userPrompt.append("\nRESUMEN EXTENSO:");

        try {
            OllamaResponse response = ollamaClient.generateText(
                    systemPrompt, userPrompt.toString());

            String summary = response.getResponse();
            if (summary != null && !summary.isBlank()) {
                // Clean up potential artifacts
                summary = summary.strip();
                log.info("[Summary] Generated extensive summary ({} chars)", summary.length());
                return summary;
            }
        } catch (Exception e) {
            log.error("[Summary] Summary generation failed: {}", e.getMessage(), e);
        }

        return "";
    }

    /**
     * Helper: builds a prompt string for the JSON-mode generate() call
     * (the existing OllamaClient.generate() uses its own system prompt,
     * so we concatenate ours into the user prompt).
     */
    private String buildEvaluationPrompt(String systemContext, String userPrompt) {
        // The current generate() method uses a fixed system prompt for JSON mode.
        // We prepend our instructions to the user prompt so they take effect.
        return "[INSTRUCTIONS: " + systemContext + "]\n\n" + userPrompt;
    }
}
