package com.brainreptrack.note.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final InboxItemRepository inboxItemRepository;

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
            note.setTags(dto.getTags());
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
        if (dto.getTitle() != null)   note.setTitle(dto.getTitle());
        if (dto.getPath() != null)    note.setPath(dto.getPath());
        if (dto.getType() != null)    note.setType(dto.getType());
        if (dto.getSummary() != null) note.setSummary(dto.getSummary());
        if (dto.getTags() != null)    note.setTags(dto.getTags());
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

    // -------------------------------------------------------

    private Note findOrThrow(UUID id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
    }

    private NoteResponseDto toDto(Note n) {
        return NoteResponseDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .path(n.getPath())
                .type(n.getType())
                .summary(n.getSummary())
                .createdAt(n.getCreatedAt())
                .inboxItemId(n.getInboxItem() != null ? n.getInboxItem().getId() : null)
                .tags(n.getTags())
                .build();
    }
}
