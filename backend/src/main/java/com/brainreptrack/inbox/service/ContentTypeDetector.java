package com.brainreptrack.inbox.service;

import com.brainreptrack.inbox.domain.ContentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Server-side auto-detector that analyses raw text content and returns the
 * most probable {@link ContentType}.
 *
 * <p>
 * The detector runs a series of lightweight heuristic checks in priority
 * order. If the caller already provides a hint (e.g. "AUDIO" from the audio
 * upload endpoint), the hint is respected.
 * </p>
 */
@Slf4j
@Component
public class ContentTypeDetector {

    // ── Video platforms ──────────────────────────────────────────────────────
    private static final List<String> VIDEO_DOMAINS = List.of(
            "youtube.com", "youtu.be", "vimeo.com", "dailymotion.com",
            "twitch.tv", "tiktok.com", "rumble.com", "odysee.com",
            "loom.com", "wistia.com");

    // ── Article / blog / news platforms ──────────────────────────────────────
    private static final List<String> ARTICLE_DOMAINS = List.of(
            "medium.com", "dev.to", "hashnode.com", "substack.com",
            "arxiv.org", "scholar.google", "researchgate.net",
            "techcrunch.com", "hackernews", "news.ycombinator.com",
            "wikipedia.org", "notion.so", "blog.");

    // ── Code detection patterns ──────────────────────────────────────────────
    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile(
            "```[\\s\\S]+?```");
    private static final Pattern CODE_SYNTAX_PATTERN = Pattern.compile(
            "(?m)(^\\s*(import |from |package |class |def |fn |func |function |const |let |var |public |private |#include|<\\?php|<!DOCTYPE|SELECT |CREATE TABLE))"
                    +
                    "|[{};]\\s*$" +
                    "|=>|->|\\|>" +
                    "|(\\w+\\(.*\\)\\s*\\{)" +
                    "|(if\\s*\\(.*\\)\\s*\\{)");

    // ── URL detection ────────────────────────────────────────────────────────
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^https?://[^\\s]+$", Pattern.CASE_INSENSITIVE);

    // ── Idea heuristic: short, no structure, casual ─────────────────────────
    private static final int IDEA_MAX_LENGTH = 280;

    /**
     * Analyses the raw content and returns the detected {@link ContentType}.
     *
     * @param rawText  the content captured by the user
     * @param hintType an optional hint from the caller (e.g. "AUDIO", "FILE");
     *                 if null or blank the detector decides autonomously.
     * @return the detected content type, never null
     */
    public ContentType detect(String rawText, String hintType) {
        // ── 1. Respect explicit hints ─────────────────────────────────────
        if (hintType != null && !hintType.isBlank()) {
            ContentType hinted = ContentType.fromString(hintType);
            if (hinted != ContentType.TEXT) {
                log.debug("[ContentDetector] Respecting caller hint: {}", hinted);
                return hinted;
            }
        }

        if (rawText == null || rawText.isBlank()) {
            return ContentType.TEXT;
        }

        String trimmed = rawText.trim();

        // ── 2. Pure URL on a single line ──────────────────────────────────
        if (URL_PATTERN.matcher(trimmed).matches()) {
            String lower = trimmed.toLowerCase();

            // 2a. Video reference?
            if (VIDEO_DOMAINS.stream().anyMatch(lower::contains)) {
                log.debug("[ContentDetector] Detected VIDEO_REF from URL");
                return ContentType.VIDEO_REF;
            }

            // 2b. Article reference?
            if (ARTICLE_DOMAINS.stream().anyMatch(lower::contains)) {
                log.debug("[ContentDetector] Detected ARTICLE_REF from URL");
                return ContentType.ARTICLE_REF;
            }

            // 2c. Generic link
            log.debug("[ContentDetector] Detected LINK from URL");
            return ContentType.LINK;
        }

        // ── 3. Contains a URL (mixed content) ────────────────────────────
        if (trimmed.contains("http://") || trimmed.contains("https://")) {
            String lower = trimmed.toLowerCase();
            if (VIDEO_DOMAINS.stream().anyMatch(lower::contains)) {
                log.debug("[ContentDetector] Detected VIDEO_REF from embedded URL");
                return ContentType.VIDEO_REF;
            }
            if (ARTICLE_DOMAINS.stream().anyMatch(lower::contains)) {
                log.debug("[ContentDetector] Detected ARTICLE_REF from embedded URL");
                return ContentType.ARTICLE_REF;
            }
        }

        // ── 4. Code detection ────────────────────────────────────────────
        if (CODE_BLOCK_PATTERN.matcher(trimmed).find()) {
            log.debug("[ContentDetector] Detected CODE from markdown code block");
            return ContentType.CODE;
        }
        if (looksLikeCode(trimmed)) {
            log.debug("[ContentDetector] Detected CODE from syntax heuristics");
            return ContentType.CODE;
        }

        // ── 5. Short casual text → IDEA ─────────────────────────────────
        if (trimmed.length() <= IDEA_MAX_LENGTH && isIdea(trimmed)) {
            log.debug("[ContentDetector] Detected IDEA (short, casual text)");
            return ContentType.IDEA;
        }

        // ── 6. File reference (attachment markers from the frontend) ────
        if (trimmed.contains("[Adjuntos:") || trimmed.contains("[Attached:")) {
            return ContentType.FILE;
        }

        // ── 7. Default ──────────────────────────────────────────────────
        return ContentType.TEXT;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Heuristic for code: counts "code-like" lines and checks ratio.
     */
    private boolean looksLikeCode(String text) {
        String[] lines = text.split("\n");
        if (lines.length < 2)
            return false;

        int codeLikeLines = 0;
        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isEmpty())
                continue;
            if (CODE_SYNTAX_PATTERN.matcher(trimmedLine).find()) {
                codeLikeLines++;
            }
            // Indentation with 2+ spaces or tabs (common in code)
            if (line.startsWith("  ") || line.startsWith("\t")) {
                codeLikeLines++;
            }
        }

        double ratio = (double) codeLikeLines / lines.length;
        return ratio >= 0.35; // at least 35% of lines look like code
    }

    /**
     * An "idea" is typically short, single-paragraph, no structured formatting.
     */
    private boolean isIdea(String text) {
        long lineCount = text.lines().count();
        boolean hasStructure = text.contains("- ") || text.contains("• ")
                || text.contains("1.") || text.contains("##");
        boolean hasUrl = text.contains("http://") || text.contains("https://");
        return lineCount <= 3 && !hasStructure && !hasUrl;
    }
}
