package com.brainreptrack.topic.service;

import com.brainreptrack.shared.exception.ResourceNotFoundException;
import com.brainreptrack.topic.domain.Topic;
import com.brainreptrack.topic.dto.TopicRequestDto;
import com.brainreptrack.topic.dto.TopicResponseDto;
import com.brainreptrack.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;

    @Override
    public TopicResponseDto createTopic(TopicRequestDto dto) {
        Topic topic = Topic.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .build();
        return toResponse(topicRepository.save(topic));
    }

    @Override
    @Transactional(readOnly = true)
    public TopicResponseDto getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));
        return toResponse(topic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponseDto> getAllTopics() {
        return topicRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TopicResponseDto updateTopic(Long id, TopicRequestDto dto) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));
        topic.setTitle(dto.getTitle());
        topic.setDescription(dto.getDescription());
        return toResponse(topicRepository.save(topic));
    }

    @Override
    public void deleteTopic(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new ResourceNotFoundException("Topic", id);
        }
        topicRepository.deleteById(id);
    }

    private TopicResponseDto toResponse(Topic topic) {
        return TopicResponseDto.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .createdAt(topic.getCreatedAt())
                .build();
    }
}
