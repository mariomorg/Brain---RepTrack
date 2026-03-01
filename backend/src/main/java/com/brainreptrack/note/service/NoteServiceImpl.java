package com.brainreptrack.note.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.domain.NoteTag;
import com.brainreptrack.note.dto.FolderSummaryRequestDto;
import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;
import com.brainreptrack.note.dto.NoteTagDto;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.TagRepository;
import com.brainreptrack.processing.service.OllamaClient;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final InboxItemRepository inboxItemRepository;
    private final TagRepository tagRepository;
    private final OllamaClient ollamaClient;

    @Override
    public NoteResponseDto create(NoteRequestDto dto) {
        Note.NoteBuilder builder = Note.builder()
                .title(dto.getTitle())
                .path(dto.getPath())
                .type(dto.getType())
                .summary(dto.getSummary());

        if (dto.getInboxItemId() != null) {
            InboxItem item = inboxItemRepository.findById(dto.getInboxItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InboxItem", dto.getInboxItemId()));
            builder.inboxItem(item);
        }

        Note note = builder.build();

        if (dto.getTags() != null) {
            ensureTags(dto.getTags());
            note.setTags(toNoteTags(dto.getTags()));
        }

        if (dto.getConfidenceScore() != null) {
            note.setConfidenceScore(dto.getConfidenceScore());
        }

        return toDto(noteRepository.save(note));
    }

    @Override
    @Transactional(readOnly = true)
    public NoteResponseDto findById(UUID id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> findAll() {
        return noteRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> findByType(String type) {
        return noteRepository.findByType(type).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> search(String keyword) {
        return noteRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public NoteResponseDto update(UUID id, NoteRequestDto dto) {
        Note note = findOrThrow(id);

        if (dto.getTitle() != null)
            note.setTitle(dto.getTitle());
        if (dto.getPath() != null)
            note.setPath(dto.getPath());
        if (dto.getType() != null)
            note.setType(dto.getType());
        if (dto.getSummary() != null)
            note.setSummary(dto.getSummary());

        if (dto.getTags() != null) {
            ensureTags(dto.getTags());
            note.setTags(toNoteTags(dto.getTags()));
        }

        if (dto.getConfidenceScore() != null) {
            note.setConfidenceScore(dto.getConfidenceScore());
        }

        if (dto.getInboxItemId() != null) {
            InboxItem item = inboxItemRepository.findById(dto.getInboxItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InboxItem", dto.getInboxItemId()));
            note.setInboxItem(item);
        }

        // Allow direct editing of ai_summary via the linked InboxItem
        if (dto.getAiSummary() != null && note.getInboxItem() != null) {
            note.getInboxItem().setAiSummary(dto.getAiSummary());
            inboxItemRepository.save(note.getInboxItem());
        }

        return toDto(noteRepository.save(note));
    }

    @Override
    public void delete(UUID id) {
        findOrThrow(id);
        noteRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> findByTag(String tagName) {
        return noteRepository.findByTagName(tagName).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTags() {
        return noteRepository.findAllDistinctTags();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> findSimilares(UUID id) {
        Note base = findOrThrow(id);

        List<String> baseTags = base.getTags().stream()
                .map(NoteTag::getTagName)
                .toList();

        double baseConfidence = base.getConfidenceScore() != null ? base.getConfidenceScore() : 0.0;

        List<Note> candidates = noteRepository.findAll().stream()
                .filter(n -> !n.getId().equals(id))
                .toList();

        // Score: +2 por tag igual, penaliza diferencia de confianza
        List<NoteScore> scored = candidates.stream()
                .map(n -> {
                    int tagMatches = (int) n.getTags().stream()
                            .filter(t -> baseTags.contains(t.getTagName()))
                            .count();

                    double confidence = n.getConfidenceScore() != null ? n.getConfidenceScore() : 0.0;
                    double confidenceDiff = Math.abs(confidence - baseConfidence);
                    double score = tagMatches * 2 - confidenceDiff;

                    return new NoteScore(n, score);
                })
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .toList();

        return scored.stream()
                .limit(5)
                .map(ns -> toDto(ns.note))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String generateFolderSummary(FolderSummaryRequestDto request) {
        if (request.getNoteIds() == null || request.getNoteIds().isEmpty()) {
            return "No hay notas en esta carpeta para resumir.";
        }

        // Build context: title + summary for each note
        StringBuilder context = new StringBuilder();
        for (UUID noteId : request.getNoteIds()) {
            noteRepository.findById(noteId).ifPresent(note -> {
                context.append("- **").append(note.getTitle()).append("**");
                if (note.getSummary() != null && !note.getSummary().isBlank()) {
                    context.append(": ").append(note.getSummary().strip());
                }
                // Include AI summary if available
                if (note.getInboxItem() != null && note.getInboxItem().getAiSummary() != null
                        && !note.getInboxItem().getAiSummary().isBlank()) {
                    String aiS = note.getInboxItem().getAiSummary().strip();
                    // Truncate to avoid huge prompts (max 400 chars per note)
                    if (aiS.length() > 400) aiS = aiS.substring(0, 400) + "…";
                    context.append(" | Detalle: ").append(aiS);
                }
                context.append("\n");
            });
        }

        String folderLabel = request.getFolderPath() != null && !request.getFolderPath().isBlank()
                ? request.getFolderPath()
                : request.getFolderName() != null ? request.getFolderName() : "esta carpeta";

        String systemPrompt = """
                Eres un asistente de base de conocimiento personal. \
                Recibirás una lista de notas de una carpeta y debes generar un resumen cohesionado, \
                en español, que explique de forma clara qué tipo de conocimiento hay en esa carpeta, \
                cuáles son los temas principales y qué patrones o relaciones observas entre las notas. \
                El resumen debe tener entre 3 y 6 oraciones y ser útil para que el usuario recuerde \
                rápidamente el contenido de la carpeta. No uses listas, escribe en prosa fluida.""";

        String userPrompt = String.format(
                "Carpeta: \"%s\"\n\nNotas (%d):\n%s\n\nEscribe el resumen de la carpeta:",
                folderLabel, request.getNoteIds().size(), context);

        try {
            var response = ollamaClient.generateText(systemPrompt, userPrompt);
            String result = response.getResponse();
            return (result != null && !result.isBlank()) ? result.strip() : "No se pudo generar el resumen.";
        } catch (Exception e) {
            return "Error al generar el resumen: " + e.getMessage();
        }
    }

    private static class NoteScore {
        private final Note note;
        private final double score;

        private NoteScore(Note note, double score) {
            this.note = note;
            this.score = score;
        }
    }

    // -------------------------------------------------------

    /**
     * Ensures all tags in the set exist in the tag registry.
     * When tags come from arbitrary API input (no path context)
     * they are inserted with parent_name = null.
     * The parent will be updated later if the same tag is seen
     * in a path-aware context (AiProcessingServiceImpl).
     */
    private void ensureTags(Set<NoteTagDto> tagDtos) {
        for (NoteTagDto dto : tagDtos) {
            tagRepository.upsert(dto.getName(), null);
        }
    }

    /** Converts a set of NoteTagDto (from request) into domain NoteTag objects. */
    private Set<NoteTag> toNoteTags(Set<NoteTagDto> dtos) {
        return dtos.stream()
                .map(d -> new NoteTag(d.getName(), d.getConfidenceLevel()))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Note findOrThrow(UUID id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
    }

    private NoteResponseDto toDto(Note n) {
        Set<NoteTagDto> tagDtos = n.getTags().stream()
                .map(t -> new NoteTagDto(t.getTagName(), t.getConfidenceLevel()))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String originalContent = null;
        String aiSummary = null;
        String detectedType = null;
        String sourceUrl = null;
        String fileContent = null;
        if (n.getInboxItem() != null) {
            detectedType = n.getInboxItem().getDetectedType();
            aiSummary = n.getInboxItem().getAiSummary();
            sourceUrl = n.getInboxItem().getSourceUrl();
            String raw = n.getInboxItem().getRawText();
            // Para archivos (FILE) y videos (VIDEO_REF), mostrar solo la primera línea
            // (título/nombre)
            if (("FILE".equalsIgnoreCase(detectedType) || "VIDEO_REF".equalsIgnoreCase(detectedType))
                    && raw != null) {
                int lineEnd = raw.indexOf('\n');
                originalContent = lineEnd > 0 ? raw.substring(0, lineEnd).trim() : raw.trim();
                // Para archivos, exponer el contenido completo extraído
                if ("FILE".equalsIgnoreCase(detectedType) && lineEnd > 0) {
                    fileContent = raw.substring(lineEnd + 1).trim();
                }
            } else {
                originalContent = raw;
            }
        }

        return NoteResponseDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .path(n.getPath())
                .type(n.getType())
                .summary(n.getSummary())
                .createdAt(n.getCreatedAt())
                .inboxItemId(n.getInboxItem() != null ? n.getInboxItem().getId() : null)
                .confidenceScore(n.getConfidenceScore())
                .tags(tagDtos)
                .originalContent(originalContent)
                .aiSummary(aiSummary)
                .detectedType(detectedType)
                .sourceUrl(sourceUrl)
                .fileContent(fileContent)
                .fileUrl("FILE".equalsIgnoreCase(detectedType)
                        && n.getInboxItem() != null
                        && n.getInboxItem().getFilePath() != null
                        ? "/api/notes/" + n.getId() + "/file"
                        : null)
                .build();
    }
}