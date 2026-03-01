package com.brainreptrack.processing.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.processing.dto.SuggestionDto;
import com.brainreptrack.processing.dto.SuggestionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Default rule-based implementation of {@link SuggestionAnalyzer}.
 *
 * <p>
 * Each suggestion type is evaluated independently by a small private
 * method that returns a confidence score (0–100). Suggestions whose
 * confidence exceeds a minimum threshold are included in the result,
 * sorted by descending confidence.
 * </p>
 *
 * <p>
 * This design makes it trivial to add new suggestion types: just add
 * a new evaluator method and register it in {@link #analyze}.
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SuggestionAnalyzerImpl implements SuggestionAnalyzer {

    private static final double MIN_CONFIDENCE = 30.0;
    private static final int LONG_TEXT_THRESHOLD = 400;
    private static final int SHORT_TEXT_THRESHOLD = 300;

    @Override
    public List<SuggestionDto> analyze(InboxItem item) {
        List<SuggestionDto> all = new ArrayList<>();

        all.add(evaluateSummarize(item));
        all.add(evaluateReformulate(item));
        all.add(evaluateTranscribe(item));
        all.add(evaluateOcr(item));
        all.add(evaluateUrlExtract(item));
        all.add(evaluateRelations(item));
        all.add(evaluateCodeFormat(item));
        all.add(evaluateVideoExtract(item));

        // Filter by minimum confidence and sort descending
        List<SuggestionDto> result = all.stream()
                .filter(s -> s.getConfidence() >= MIN_CONFIDENCE)
                .sorted(Comparator.comparingDouble(SuggestionDto::getConfidence).reversed())
                .toList();

        log.debug("[Suggestions] {} suggestions generated for InboxItem {} (of {} evaluated)",
                result.size(), item.getId(), all.size());
        return result;
    }

    // ── Individual evaluators ───────────────────────────────────────────────

    private SuggestionDto evaluateSummarize(InboxItem item) {
        String text = safeText(item);
        double confidence = 0;

        if (text.length() > LONG_TEXT_THRESHOLD) {
            // Longer text → higher confidence
            confidence = Math.min(95, 50 + (text.length() - LONG_TEXT_THRESHOLD) * 0.05);
        }

        return SuggestionDto.builder()
                .type(SuggestionType.SUMMARIZE)
                .label("Resumir contenido")
                .description("El contenido parece extenso — se puede generar un resumen conciso.")
                .confidence(confidence)
                .actionable(false) // future: wire to AI summarization
                .build();
    }

    private SuggestionDto evaluateReformulate(InboxItem item) {
        String text = safeText(item);
        String type = safeType(item);
        double confidence = 0;

        boolean isPlainText = "TEXT".equalsIgnoreCase(type);
        boolean isShort = text.length() < SHORT_TEXT_THRESHOLD && text.length() > 20;
        boolean hasNoStructure = !text.contains("\n") && !text.contains("-") && !text.contains("•");

        if (isPlainText && isShort && hasNoStructure) {
            confidence = 70;
        } else if (isPlainText && isShort) {
            confidence = 45;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.REFORMULATE)
                .label("Reformular nota")
                .description("¿Reformular esta nota de forma clara y estructurada?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    private SuggestionDto evaluateTranscribe(InboxItem item) {
        String type = safeType(item);
        double confidence = 0;
        if ("AUDIO".equalsIgnoreCase(type) || "VOICE_NOTE".equalsIgnoreCase(type)) {
            confidence = 95;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.TRANSCRIBE)
                .label("Transcribir audio")
                .description("Se detectó contenido de audio — ¿transcribirlo a texto?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    private SuggestionDto evaluateOcr(InboxItem item) {
        String type = safeType(item);
        String text = safeText(item);
        double confidence = 0;

        if ("FILE".equalsIgnoreCase(type)) {
            // Check for image-like references in rawText
            boolean looksLikeImage = text.toLowerCase().matches(".*\\.(png|jpg|jpeg|gif|bmp|webp|pdf).*");
            confidence = looksLikeImage ? 90 : 60;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.OCR)
                .label("Extraer texto (OCR)")
                .description("Se detectó un archivo — ¿extraer texto mediante OCR?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    private SuggestionDto evaluateUrlExtract(InboxItem item) {
        String text = safeText(item).trim();
        String type = safeType(item);
        double confidence = 0;

        if (isUrl(text)) {
            confidence = 95;
        } else if ("LINK".equalsIgnoreCase(type) || "ARTICLE_REF".equalsIgnoreCase(type)) {
            confidence = 90;
        } else if ("VIDEO_REF".equalsIgnoreCase(type)) {
            confidence = 85;
        } else if (text.contains("http://") || text.contains("https://")) {
            confidence = 50;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.URL_EXTRACT)
                .label("Extraer contenido web")
                .description("Este enlace contiene contenido — ¿extraerlo y almacenarlo?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    private SuggestionDto evaluateRelations(InboxItem item) {
        double confidence = 0;

        // If there's already a classification, we can look for related notes
        if (item.getProposalsJson() != null && !item.getProposalsJson().isBlank()) {
            confidence = 75;
        } else if (safeText(item).length() > 50) {
            // Even without classification, long-enough text can be compared
            confidence = 40;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.RELATIONS)
                .label("Buscar relaciones")
                .description("Buscar notas relacionadas en el Cerebro para crear vínculos Zettelkasten.")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    // ── New evaluators for expanded content types ────────────────────

    private SuggestionDto evaluateCodeFormat(InboxItem item) {
        String type = safeType(item);
        String text = safeText(item);
        double confidence = 0;

        if ("CODE".equalsIgnoreCase(type)) {
            confidence = 90;
        } else if (text.contains("```") || text.contains("function ") || text.contains("class ")) {
            confidence = 45;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.CODE_FORMAT)
                .label("Formatear código")
                .description("Se detectó código fuente — ¿formatear y detectar lenguaje?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    private SuggestionDto evaluateVideoExtract(InboxItem item) {
        String type = safeType(item);
        double confidence = 0;

        if ("VIDEO_REF".equalsIgnoreCase(type)) {
            confidence = 90;
        }

        return SuggestionDto.builder()
                .type(SuggestionType.VIDEO_EXTRACT)
                .label("Extraer info del vídeo")
                .description("Se detectó una referencia a vídeo — ¿extraer título y descripción?")
                .confidence(confidence)
                .actionable(false)
                .build();
    }

    // ── Utility ─────────────────────────────────────────────────────────────

    private static String safeText(InboxItem item) {
        return item.getRawText() != null ? item.getRawText() : "";
    }

    private static String safeType(InboxItem item) {
        return item.getDetectedType() != null ? item.getDetectedType() : "TEXT";
    }

    private static boolean isUrl(String text) {
        try {
            new URL(text);
            return text.startsWith("http://") || text.startsWith("https://");
        } catch (MalformedURLException e) {
            return false;
        }
    }
}
