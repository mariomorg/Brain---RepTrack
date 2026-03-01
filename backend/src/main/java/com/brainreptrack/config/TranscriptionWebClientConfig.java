package com.brainreptrack.config;

// Añade este bean a tu AppConfig.java existente

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class TranscriptionWebClientConfig {

    @Value("${transcription.service.url:http://localhost:8081}")
    private String transcriptionServiceUrl;

    @Bean
    public WebClient transcriptionWebClient() {
        return WebClient.builder()
                .baseUrl(transcriptionServiceUrl)
                .codecs(config -> config
                        .defaultCodecs()
                        .maxInMemorySize(50 * 1024 * 1024)) // 50 MB máximo por audio
                .build();
    }
}