package com.brainreptrack.processing.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Response body from POST http://localhost:11434/api/chat (stream=false).
 * Only the fields we care about are mapped; the rest are ignored.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OllamaResponse {

    private String model;

    /** The assistant reply message containing role + content. */
    private OllamaMessage message;

    private boolean done;

    @JsonProperty("done_reason")
    private String doneReason;

    /**
     * Convenience accessor — returns {@code message.content} so callers
     * using {@code getResponse()} continue to work without changes.
     */
    public String getResponse() {
        return message != null ? message.getContent() : null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OllamaMessage {
        private String role;
        private String content;
    }
}
