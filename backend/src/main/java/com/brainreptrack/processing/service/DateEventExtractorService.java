package com.brainreptrack.processing.service;

import com.brainreptrack.processing.dto.OllamaResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Uses the Ollama LLM to detect whether an inbox item contains a date, meeting,
 * appointment, reminder or any other calendar event and extracts its details.
 *
 * <p>The service injects the current date so the model can resolve relative
 * references like "mañana", "la semana que viene", etc.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DateEventExtractorService {

    private static final String USER_PROMPT_TEMPLATE =
            "Tu tarea es analizar un texto proveniente del inbox de un usuario y detectar si contiene una fecha o una cita.\n\n" +
            "INSTRUCCIONES:\n\n" +
            "1. Si el texto contiene una fecha, reunión, cita, recordatorio o evento:\n" +
            "   - Extrae:\n" +
            "     - type = \"DATE_EVENT\"\n" +
            "     - date en formato ISO 8601 (YYYY-MM-DD)\n" +
            "     - time en formato 24h (HH:MM). Si no existe, usar null.\n" +
            "     - title: título corto y claro del evento\n" +
            "     - description: breve descripción resumida\n\n" +
            "2. Si NO contiene ninguna fecha o evento:\n" +
            "   - type = \"NONE\"\n" +
            "   - date = null\n" +
            "   - time = null\n" +
            "   - title = null\n" +
            "   - description = null\n\n" +
            "3. Interpreta correctamente fechas relativas:\n" +
            "   - \"mañana\"\n" +
            "   - \"pasado mañana\"\n" +
            "   - \"el viernes\"\n" +
            "   - \"la semana que viene\"\n" +
            "   - \"el 3 de marzo\"\n" +
            "   - etc.\n\n" +
            "4. Usa como fecha actual de referencia:\n" +
            "   {{CURRENT_DATE}} ({{CURRENT_WEEKDAY}})\n\n" +
            "5. Si la fecha es ambigua, asume la próxima ocurrencia futura.\n\n" +
            "6. Devuelve SIEMPRE únicamente JSON válido.\n" +
            "   NO incluyas explicaciones.\n" +
            "   NO incluyas texto adicional.\n" +
            "   NO uses markdown.\n" +
            "   SOLO el JSON.\n\n" +
            "FORMATO DE RESPUESTA OBLIGATORIO:\n\n" +
            "{\n" +
            "  \"type\": \"DATE_EVENT\" | \"NONE\",\n" +
            "  \"date\": \"YYYY-MM-DD\" | null,\n" +
            "  \"time\": \"HH:MM\" | null,\n" +
            "  \"title\": \"string\" | null,\n" +
            "  \"description\": \"string\" | null\n" +
            "}\n\n" +
            "TEXTO A ANALIZAR:\n" +
            "\"\"\"\n" +
            "{{INBOX_CONTENT}}\n" +
            "\"\"\"";

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper;

    /**
     * Analyses {@code rawText} for calendar events.
     *
     * @param rawText   the inbox item content
     * @param createdAt the timestamp when the inbox item was created; used as
     *                  the reference date for resolving relative expressions
     *                  like "el martes" or "mañana". Falls back to today if null.
     * @return a map with keys: type, date, time, title, description
     *         Always non-null; type will be "NONE" when no event is detected.
     */
    public Map<String, Object> extract(String rawText, LocalDateTime createdAt) {
        LocalDate referenceDate = (createdAt != null) ? createdAt.toLocalDate() : LocalDate.now();
        String currentDate = referenceDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String currentWeekday = referenceDate.getDayOfWeek()
                .getDisplayName(java.time.format.TextStyle.FULL, new java.util.Locale("es", "ES"));

        String userPrompt = USER_PROMPT_TEMPLATE
                .replace("{{CURRENT_DATE}}", currentDate)
                .replace("{{CURRENT_WEEKDAY}}", currentWeekday)
                .replace("{{INBOX_CONTENT}}", rawText != null ? rawText : "");

        try {
            OllamaResponse response = ollamaClient.generate(buildPrompt(userPrompt));
            String raw = response.getResponse();
            log.debug("[DateExtractor] Raw AI response: {}", raw);

            String cleaned = cleanJson(raw);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.readValue(cleaned, Map.class);

            // Sanity: ensure required keys exist
            result.putIfAbsent("type", "NONE");
            return result;

        } catch (Exception e) {
            log.warn("[DateExtractor] Failed to extract calendar event: {}", e.getMessage());
            return Map.of("type", "NONE");
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Wraps the user prompt into a full Ollama-compatible prompt string.
     * We reuse the JSON-mode generate() method so the model is constrained to JSON.
     */
    private String buildPrompt(String userPrompt) {
        // The OllamaClient.generate() injects a system message automatically,
        // so we just return the user prompt as-is.
        return userPrompt;
    }

    /** Strips markdown code fences and locates the outermost JSON object. */
    private String cleanJson(String raw) {
        if (raw == null) return "{}";
        String s = raw.strip();
        if (s.startsWith("```")) {
            s = s.replaceFirst("^```(?:json)?\\s*", "")
                 .replaceFirst("\\s*```$", "")
                 .strip();
        }
        int start = s.indexOf('{');
        int end   = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return s.substring(start, end + 1);
        }
        return s.isEmpty() ? "{}" : s;
    }
}
