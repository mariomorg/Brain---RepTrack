package com.brainreptrack.note.service;

import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;

import java.util.List;
import java.util.UUID;

public interface NoteService {

    NoteResponseDto create(NoteRequestDto dto);

    NoteResponseDto findById(UUID id);

    List<NoteResponseDto> findAll();

    List<NoteResponseDto> findByType(String type);

    List<NoteResponseDto> search(String keyword);

    NoteResponseDto update(UUID id, NoteRequestDto dto);

    void delete(UUID id);

    List<NoteResponseDto> findByTag(String tagName);

    List<String> getAllTags();

    // 👇 ESTE iba fuera, ahora está bien
    List<NoteResponseDto> findSimilares(UUID id);
}