package com.brainreptrack.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Returns live health status for all external services
 * (Ollama, Transcription/Whisper, PostgreSQL).
 */
@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final RestTemplate restTemplate;
    private final WebClient transcriptionWebClient;

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3:8b}")
    private String ollamaModel;

    @GetMapping("/services")
    public ResponseEntity<Map<String, Object>> servicesHealth() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ollama", checkOllama());
        result.put("transcription", checkTranscription());
        result.put("database", checkDatabase());
        return ResponseEntity.ok(result);
    }

    // ── Ollama ───────────────────────────────────────────────
    private Map<String, Object> checkOllama() {
        Map<String, Object> info = new LinkedHashMap<>();
        try {
            // Ollama exposes GET / that returns "Ollama is running"
            String body = restTemplate.getForObject(ollamaUrl, String.class);
            boolean ok = body != null && body.toLowerCase().contains("ollama");
            info.put("status", ok ? "up" : "degraded");
            info.put("url", ollamaUrl);
            info.put("model", ollamaModel);

            // Try to get list of loaded models
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> tags = restTemplate.getForObject(
                        ollamaUrl + "/api/tags", Map.class);
                if (tags != null && tags.get("models") != null) {
                    @SuppressWarnings("unchecked")
                    var models = (java.util.List<Map<String, Object>>) tags.get("models");
                    info.put("availableModels",
                            models.stream().map(m -> m.get("name")).toList());
                }
            } catch (Exception ignored) {
                // non-critical
            }
        } catch (Exception e) {
            info.put("status", "down");
            info.put("url", ollamaUrl);
            info.put("error", e.getMessage());
        }
        return info;
    }

    // ── Transcription service (Python / Whisper) ─────────────
    private Map<String, Object> checkTranscription() {
        Map<String, Object> info = new LinkedHashMap<>();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> health = transcriptionWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(java.time.Duration.ofSeconds(5));

            if (health != null && "ok".equals(health.get("status"))) {
                info.put("status", "up");
                info.put("whisperModel", health.get("model"));
                info.put("device", health.get("device"));
            } else {
                info.put("status", "degraded");
            }
        } catch (Exception e) {
            info.put("status", "down");
            info.put("error", "Servicio no disponible");
        }
        return info;
    }

    // ── PostgreSQL ───────────────────────────────────────────
    private Map<String, Object> checkDatabase() {
        Map<String, Object> info = new LinkedHashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(3);
            info.put("status", valid ? "up" : "degraded");
            info.put("database", conn.getMetaData().getDatabaseProductName()
                    + " " + conn.getMetaData().getDatabaseProductVersion());
            info.put("url", conn.getMetaData().getURL());
        } catch (Exception e) {
            info.put("status", "down");
            info.put("error", e.getMessage());
        }
        return info;
    }
}
