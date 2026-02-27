package com.brainreptrack.session.repository;

import com.brainreptrack.session.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByUserId(Long userId);

    List<Session> findByTopicId(Long topicId);
}
