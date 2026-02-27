package com.brainreptrack.session.service;

import com.brainreptrack.session.dto.SessionRequestDto;
import com.brainreptrack.session.dto.SessionResponseDto;

import java.util.List;

public interface SessionService {

    SessionResponseDto createSession(SessionRequestDto dto);

    SessionResponseDto getSessionById(Long id);

    List<SessionResponseDto> getAllSessions();

    List<SessionResponseDto> getSessionsByUser(Long userId);

    void deleteSession(Long id);
}
