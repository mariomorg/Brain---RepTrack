package com.brainreptrack.inbox.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Unified capture request — the single DTO for every content type entering the
 * inbox.
 *
 * <p>
 * Only {@code content} is mandatory. Everything else is optional and will be
 * inferred or enriched automatically by the backend when missing.
 * </p>
 *
 * <h3>Usage examples</h3>
 * <ul>
 * <li>Quick text / idea: {@code { "content": "Me surgió una idea..." }}</li>
 * <li>Link: {@code { "content": "https://youtube.com/..." }}</li>
 * <li>Code:
 * {@code { "content": "function hello() {...}", "contentType": "CODE", "metadata": {"language": "javascript"} }}</li>
 * <li>Voice note: sent via multipart to {@code /capture/audio}</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaptureRequestDto {

    /**
     * The raw captured content — text, URL, code snippet, etc.
     */
    @NotBlank(message = "content must not be blank")
    private String content;

    /**
     * Optional hint: TEXT, LINK, IDEA, VOICE_NOTE, CODE, VIDEO_REF, ARTICLE_REF,
     * FILE, BROWSER_EXTENSION.
     * When absent the backend auto-detects the type.
     */
    private String contentType;

    /**
     * Optional source URL — useful when pasting a link or referencing a
     * video/article.
     * If the content itself is a URL this can be left empty (auto-extracted).
     */
    private String sourceUrl;

    /**
     * Optional title / label provided by the user or browser extension.
     */
    private String title;

    /**
     * Optional free-form metadata (e.g.
     * {@code {"language": "python", "platform": "youtube"}}).
     */
    private Map<String, String> metadata;

    /**
     * Optional path on disk to the original uploaded file.
     * Set by the file-capture endpoint after saving the bytes to storage.
     */
    private String filePath;
}
