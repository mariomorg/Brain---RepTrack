package com.brainreptrack.session.service;

import com.brainreptrack.session.domain.Session;
import com.brainreptrack.session.dto.SessionRequestDto;
import com.brainreptrack.session.dto.SessionResponseDto;
import com.brainreptrack.session.repository.SessionRepository;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import com.brainreptrack.topic.domain.Topic;
import com.brainreptrack.topic.repository.TopicRepository;
import com.brainreptrack.user.domain.User;
import com.brainreptrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Override
    public SessionResponseDto createSession(SessionRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", dto.getUserId()));
        Topic topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", dto.getTopicId()));
        Session session = Session.builder()
                .user(user)
                .topic(topic)
                .repetitions(dto.getRepetitions())
                .notes(dto.getNotes())
                .build();
        return toResponse(sessionRepository.save(session));
    }

    @Override
    @Transactional(readOnly = true)
    public SessionResponseDto getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", id));
        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponseDto> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponseDto> getSessionsByUser(Long userId) {
        return sessionRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Session", id);
        }
        sessionRepository.deleteById(id);
    }

    private SessionResponseDto toResponse(Session session) {
        return SessionResponseDto.builder()
                .id(session.getId())
                .userId(session.getUser().getId())
                .username(session.getUser().getUsername())
                .topicId(session.getTopic().getId())
                .topicTitle(session.getTopic().getTitle())
                .repetitions(session.getRepetitions())
                .notes(session.getNotes())
                .sessionDate(session.getSessionDate())
                .build();
    }
}
