package com.brainreptrack.topic.service;

import com.brainreptrack.topic.dto.TopicRequestDto;
import com.brainreptrack.topic.dto.TopicResponseDto;

import java.util.List;

public interface TopicService {

    TopicResponseDto createTopic(TopicRequestDto dto);

    TopicResponseDto getTopicById(Long id);

    List<TopicResponseDto> getAllTopics();

    TopicResponseDto updateTopic(Long id, TopicRequestDto dto);

    void deleteTopic(Long id);
}
