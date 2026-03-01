package com.brainreptrack.note.service;

import com.brainreptrack.note.domain.Note;
import com.brainreptrack.note.domain.Relation;
import com.brainreptrack.note.dto.RelationRequestDto;
import com.brainreptrack.note.dto.RelationResponseDto;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.RelationRepository;
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
public class RelationServiceImpl implements RelationService {

    private final RelationRepository relationRepository;
    private final NoteRepository noteRepository;

    @Override
    public RelationResponseDto create(RelationRequestDto dto) {
        Note noteA = noteRepository.findById(dto.getNoteAId())
                .orElseThrow(() -> new ResourceNotFoundException("Note (A)", dto.getNoteAId()));
        Note noteB = noteRepository.findById(dto.getNoteBId())
                .orElseThrow(() -> new ResourceNotFoundException("Note (B)", dto.getNoteBId()));

        Relation relation = Relation.builder()
                .noteA(noteA)
                .noteB(noteB)
                .score(dto.getScore() != null ? dto.getScore() : 0.0)
                .validated(dto.getValidated() != null ? dto.getValidated() : false)
                .build();
        return toDto(relationRepository.save(relation));
    }

    @Override
    @Transactional(readOnly = true)
    public RelationResponseDto findById(UUID id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelationResponseDto> findAll() {
        return relationRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelationResponseDto> findByNoteA(UUID noteAId) {
        return relationRepository.findByNoteA_Id(noteAId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelationResponseDto> findByNoteB(UUID noteBId) {
        return relationRepository.findByNoteB_Id(noteBId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public RelationResponseDto validate(UUID id) {
        Relation relation = findOrThrow(id);
        relation.setValidated(true);
        return toDto(relationRepository.save(relation));
    }

    @Override
    public void delete(UUID id) {
        findOrThrow(id);
        relationRepository.deleteById(id);
    }

    // -------------------------------------------------------

    private Relation findOrThrow(UUID id) {
        return relationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relation", id));
    }

    private RelationResponseDto toDto(Relation r) {
        return RelationResponseDto.builder()
                .id(r.getId())
                .noteAId(r.getNoteA().getId())
                .noteBId(r.getNoteB().getId())
                .score(r.getScore())
                .validated(r.getValidated())
                .build();
    }
}
