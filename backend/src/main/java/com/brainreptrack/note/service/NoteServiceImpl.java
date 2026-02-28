package com.brainreptrack.note.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.domain.NoteTag;
import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;
import com.brainreptrack.note.dto.NoteTagDto;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.TagRepository;
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
        if (dto.getConfidenceScore() != null)
            note.setConfidenceScore(dto.getConfidenceScore());
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
        return noteRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> findByType(String type) {
        return noteRepository.findByType(type).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponseDto> search(String keyword) {
        return noteRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::toDto).collect(Collectors.toList());
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
        if (dto.getConfidenceScore() != null)
            note.setConfidenceScore(dto.getConfidenceScore());
        if (dto.getInboxItemId() != null) {
            InboxItem item = inboxItemRepository.findById(dto.getInboxItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InboxItem", dto.getInboxItemId()));
            note.setInboxItem(item);
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
        return noteRepository.findByTagName(tagName).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTags() {
        return noteRepository.findAllDistinctTags();
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
                .build();
    }
}
