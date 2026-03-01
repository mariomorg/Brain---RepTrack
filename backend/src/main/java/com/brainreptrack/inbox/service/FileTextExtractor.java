package com.brainreptrack.inbox.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Extracts text content from uploaded files.
 * Currently supports:
 * <ul>
 * <li>PDF (via Apache PDFBox)</li>
 * <li>Plain text files (.txt, .md, .csv, .json, .xml, .log, etc.)</li>
 * </ul>
 */
@Slf4j
@Service
public class FileTextExtractor {

    private static final int MAX_TEXT_LENGTH = 50_000; // safety cap

    /**
     * Extracts readable text from the given file.
     *
     * @param file the uploaded multipart file
     * @return extracted text, or the original filename if extraction fails
     */
    public String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
        String lower = filename.toLowerCase();

        try {
            if (lower.endsWith(".pdf")) {
                return extractFromPdf(file);
            } else if (isPlainText(lower)) {
                return extractFromTextFile(file);
            } else {
                log.info("[FileExtractor] Unsupported file type '{}', using filename as content", filename);
                return filename;
            }
        } catch (Exception e) {
            log.error("[FileExtractor] Failed to extract text from '{}': {}", filename, e.getMessage(), e);
            return filename;
        }
    }

    /**
     * Checks if a file can be reasonably read as plain text.
     */
    public boolean canExtractText(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String lower = filename.toLowerCase();
        return lower.endsWith(".pdf") || isPlainText(lower);
    }

    private String extractFromPdf(MultipartFile file) throws IOException {
        log.info("[FileExtractor] Extracting text from PDF: {}", file.getOriginalFilename());

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            if (text == null || text.isBlank()) {
                log.warn("[FileExtractor] PDF '{}' contains no extractable text (might be scanned/image-based)",
                        file.getOriginalFilename());
                return file.getOriginalFilename() + "\n[PDF sin texto extraíble — podría ser un documento escaneado]";
            }

            // Trim to safety limit
            if (text.length() > MAX_TEXT_LENGTH) {
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n\n[… texto truncado por límite de tamaño]";
            }

            log.info("[FileExtractor] Extracted {} chars from PDF '{}'", text.length(), file.getOriginalFilename());
            return text.strip();
        }
    }

    private String extractFromTextFile(MultipartFile file) throws IOException {
        log.info("[FileExtractor] Reading text file: {}", file.getOriginalFilename());
        String text = new String(file.getBytes(), StandardCharsets.UTF_8);

        if (text.length() > MAX_TEXT_LENGTH) {
            text = text.substring(0, MAX_TEXT_LENGTH) + "\n\n[… texto truncado por límite de tamaño]";
        }

        return text.strip();
    }

    private boolean isPlainText(String filename) {
        return filename.endsWith(".txt")
                || filename.endsWith(".md")
                || filename.endsWith(".csv")
                || filename.endsWith(".json")
                || filename.endsWith(".xml")
                || filename.endsWith(".log")
                || filename.endsWith(".yaml")
                || filename.endsWith(".yml")
                || filename.endsWith(".properties")
                || filename.endsWith(".html")
                || filename.endsWith(".htm")
                || filename.endsWith(".java")
                || filename.endsWith(".py")
                || filename.endsWith(".js")
                || filename.endsWith(".ts")
                || filename.endsWith(".css")
                || filename.endsWith(".sql");
    }
}
