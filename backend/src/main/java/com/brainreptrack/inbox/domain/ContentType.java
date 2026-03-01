package com.brainreptrack.inbox.domain;

/**
 * All content types the unified inbox capture point can handle.
 *
 * <p>
 * Each enum value represents a distinct kind of information that a user
 * might throw into the inbox. The AI processing pipeline and the suggestion
 * analyzer use this to tailor their behaviour.
 * </p>
 */
public enum ContentType {

    /** Free-form text — the default catch-all. */
    TEXT("Texto libre"),

    /** A URL (web page, blog post, documentation, etc.). */
    LINK("Enlace web"),

    /** A short, unstructured thought or fleeting idea. */
    IDEA("Idea suelta"),

    /** Audio captured live or uploaded as a file (pre-transcription). */
    VOICE_NOTE("Nota de voz"),

    /** A code snippet or block of source code. */
    CODE("Código fuente"),

    /** A reference to a YouTube / Vimeo / video resource. */
    VIDEO_REF("Referencia a vídeo"),

    /** A reference to an article, paper, or written resource. */
    ARTICLE_REF("Referencia a artículo"),

    /** A generic file attachment (image, PDF, etc.). */
    FILE("Archivo adjunto"),

    /** Content captured from a browser extension. */
    BROWSER_EXTENSION("Extensión del navegador"),

    /** A date, meeting, appointment or calendar event detected in the text. */
    DATE_EVENT("Evento de calendario");

    private final String displayName;

    ContentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Safe parse — returns {@code TEXT} when the input is null or unrecognised.
     */
    public static ContentType fromString(String value) {
        if (value == null || value.isBlank())
            return TEXT;
        try {
            return valueOf(value.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException e) {
            // Backward compat: "AUDIO" → VOICE_NOTE
            if ("AUDIO".equalsIgnoreCase(value))
                return VOICE_NOTE;
            return TEXT;
        }
    }
}
