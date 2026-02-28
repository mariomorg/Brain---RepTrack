package com.brainreptrack.inbox.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranscriptionClient {

    private final WebClient transcriptionWebClient;

    /**
     * Envía el audio al servicio Python y devuelve el texto transcrito.
     *
     * @param file archivo de audio recibido en el endpoint
     * @return texto transcrito
     */
    public String transcribe(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String filename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename()
                    : "audio.webm";

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            }).contentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "audio/webm"
            ));

            TranscriptionResponse response = transcriptionWebClient.post()
                    .uri("/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(TranscriptionResponse.class)
                    .block(); // síncrono: esperamos la transcripción antes de guardar

            if (response == null || response.getTranscript() == null) {
                throw new RuntimeException("Respuesta vacía del servicio de transcripción");
            }

            log.info("Audio transcrito ({} seg, idioma: {}) -> {} caracteres",
                    response.getDuration(), response.getLanguage(),
                    response.getTranscript().length());

            return response.getTranscript();

        } catch (Exception e) {
            log.error("Error al transcribir audio: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudo transcribir el audio: " + e.getMessage(), e);
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TranscriptionResponse {
        private String transcript;
        private String language;
        @JsonProperty("language_probability")
        private Double languageProbability;
        private Double duration;
    }
}