package com.brainreptrack.topic.controller;

import com.brainreptrack.shared.response.ApiResponse;
import com.brainreptrack.topic.dto.TopicRequestDto;
import com.brainreptrack.topic.dto.TopicResponseDto;
import com.brainreptrack.topic.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<ApiResponse<TopicResponseDto>> createTopic(@Valid @RequestBody TopicRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(topicService.createTopic(dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponseDto>> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getTopicById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicResponseDto>>> getAllTopics() {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getAllTopics()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponseDto>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.updateTopic(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
