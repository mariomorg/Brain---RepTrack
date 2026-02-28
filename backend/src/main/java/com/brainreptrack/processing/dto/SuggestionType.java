package com.brainreptrack.processing.dto;

/**
 * Extensible enum of AI-powered suggestion types.
 * Each type maps to a concrete action the system (or user) can perform later.
 */
public enum SuggestionType {

    /** Propose a condensed summary of lengthy content. */
    SUMMARIZE,

    /** Reformulate content into a clearer, structured version. */
    REFORMULATE,

    /** Transcribe audio content to text. */
    TRANSCRIBE,

    /** Extract text from images or PDFs via OCR. */
    OCR,

    /** Scrape / extract the main content behind a URL. */
    URL_EXTRACT,

    /** Find related notes already stored in the Cerebro (Zettelkasten linking). */
    RELATIONS,

    /** Format and syntax-highlight code snippets, detect language. */
    CODE_FORMAT,

    /** Extract metadata (title, description, duration) from a video reference. */
    VIDEO_EXTRACT
}
