package com.brainreptrack.note.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class NoteResponseDto {

    private UUID id;
    private String title;
    private String path;
    private String type;
    private String summary;
    private LocalDateTime createdAt;
    private UUID inboxItemId;
    private Double confidenceScore;
    /** Tags from note_tags with optional per-tag confidence level. */
    private Set<NoteTagDto> tags;

    /** Contenido original del recurso (rawText de InboxItem relacionado). */
    private String originalContent;

    /** Resumen extenso generado por IA (desde InboxItem). */
    private String aiSummary;

    /** Tipo detectado del contenido original (TEXT, LINK, FILE, etc.). */
    private String detectedType;

    /** URL de origen del recurso (para videos, enlaces, etc.). */
    private String sourceUrl;

    /**
     * Contenido completo extraído del archivo (solo para detectedType=FILE).
     * Mientras que originalContent contiene solo el nombre del archivo,
     * fileContent contiene el texto extraído completo del documento.
     */
    private String fileContent;

    /**
     * URL relativa para obtener el archivo original desde el backend.
     * Solo presente cuando detectedType=FILE y el archivo fue guardado en disco.
     * Ejemplo: /api/notes/{id}/file
     */
    private String fileUrl;
}
