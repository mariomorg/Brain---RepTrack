package com.brainreptrack.inbox.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

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
                    file.getContentType() != null ? file.getContentType() : "audio/webm"));

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

    /**
     * Sends a video URL to the Python service, which downloads the audio,
     * transcribes it, and returns the transcript + video title.
     *
     * @param videoUrl URL of the video (YouTube, Vimeo, etc.)
     * @return response with title, transcript, language, duration
     */
    public VideoTranscriptionResponse transcribeVideo(String videoUrl) {
        try {
            log.info("Transcribing video from URL: {}", videoUrl);

            VideoTranscriptionResponse response = transcriptionWebClient.post()
                    .uri("/transcribe-video")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("url", videoUrl))
                    .retrieve()
                    .bodyToMono(VideoTranscriptionResponse.class)
                    .timeout(Duration.ofMinutes(10)) // videos may take longer
                    .block();

            if (response == null || response.getTranscript() == null) {
                throw new RuntimeException("Respuesta vacía del servicio de transcripción de video");
            }

            log.info("Video transcribed: title='{}', {} chars, {} seg, lang={}",
                    response.getTitle(),
                    response.getTranscript().length(),
                    response.getDuration(),
                    response.getLanguage());

            return response;

        } catch (Exception e) {
            log.error("Error al transcribir video desde URL {}: {}", videoUrl, e.getMessage(), e);
            throw new RuntimeException("No se pudo transcribir el video: " + e.getMessage(), e);
        }
    }

    /**
     * Quick call to get just the video title (uses oEmbed for YouTube — fast, no
     * auth).
     * Used at capture time so the item displays the title instead of the URL.
     *
     * @param videoUrl URL of the video
     * @return video title, or the URL itself if title cannot be fetched
     */
    public String getVideoTitle(String videoUrl) {
        try {
            log.info("Fetching video title for: {}", videoUrl);

            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> response = transcriptionWebClient.post()
                    .uri("/video-title")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("url", videoUrl))
                    .retrieve()
                    .bodyToMono(java.util.Map.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null && response.get("title") != null) {
                String title = response.get("title").toString();
                log.info("Video title fetched: '{}'", title);
                return title;
            }
        } catch (Exception e) {
            log.warn("Could not fetch video title for {}: {}", videoUrl, e.getMessage());
        }
        return videoUrl; // fallback: return URL
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

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VideoTranscriptionResponse {
        private String title;
        private String transcript;
        private String language;
        @JsonProperty("language_probability")
        private Double languageProbability;
        private Double duration;
    }
}