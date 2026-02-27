package com.brainreptrack.topic.repository;

import com.brainreptrack.topic.domain.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findByTitleContainingIgnoreCase(String title);
}
