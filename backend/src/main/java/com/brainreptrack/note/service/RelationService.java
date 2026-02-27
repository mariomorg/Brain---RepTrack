package com.brainreptrack.note.service;

import com.brainreptrack.note.dto.RelationRequestDto;
import com.brainreptrack.note.dto.RelationResponseDto;

import java.util.List;
import java.util.UUID;

public interface RelationService {

    RelationResponseDto create(RelationRequestDto dto);

    RelationResponseDto findById(UUID id);

    List<RelationResponseDto> findAll();

    List<RelationResponseDto> findByNoteA(UUID noteAId);

    List<RelationResponseDto> findByNoteB(UUID noteBId);

    RelationResponseDto validate(UUID id);

    void delete(UUID id);
}
