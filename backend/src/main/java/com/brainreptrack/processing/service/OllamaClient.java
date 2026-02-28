package com.brainreptrack.processing.service;

import com.brainreptrack.processing.dto.OllamaRequest;
import com.brainreptrack.processing.dto.OllamaResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Low-level HTTP client that wraps the Ollama /api/generate endpoint.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OllamaClient {

    private final RestTemplate restTemplate;

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3.2}")
    private String defaultModel;

    /**
     * Sends a prompt to Ollama and returns the raw response object.
     *
     * @param prompt the full prompt text
     * @return OllamaResponse with the generated text in {@code response}
     * @throws RestClientException if the HTTP call fails
     */
    public OllamaResponse generate(String prompt) {
        String endpoint = ollamaUrl + "/api/chat";

        OllamaRequest request = OllamaRequest.builder()
                .model(defaultModel)
                .messages(List.of(
                        new OllamaRequest.OllamaMessage("system",
                                "You are a knowledge classification system. " +
                                        "Respond ONLY with valid JSON, no additional text."),
                        new OllamaRequest.OllamaMessage("user", prompt)))
                .stream(false)
                .format("json")
                .build();

        log.debug("Calling Ollama /api/chat at {} with model '{}'", endpoint, defaultModel);

        OllamaResponse response = restTemplate.postForObject(endpoint, request, OllamaResponse.class);

        if (response == null) {
            throw new IllegalStateException("Ollama returned a null response");
        }

        log.debug("Ollama done={}, content length={}", response.isDone(),
                response.getResponse() != null ? response.getResponse().length() : 0);

        return response;
    }
}
