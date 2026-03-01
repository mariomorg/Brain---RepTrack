package com.brainreptrack.processing.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body sent to POST http://localhost:11434/api/chat
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OllamaRequest {

    /** Model name installed in Ollama, e.g. "llama3:8b" */
    private String model;

    /** Conversation messages (system prompt + user content). */
    private List<OllamaMessage> messages;

    /** false = wait for the full response; no streaming. */
    @Builder.Default
    private boolean stream = false;

    /** Forces JSON-structured output when the model supports it. */
    @Builder.Default
    private String format = "json";

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OllamaMessage {
        private String role;
        private String content;
    }
}
