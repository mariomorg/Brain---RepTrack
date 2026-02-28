package com.brainreptrack.inbox.repository;

import com.brainreptrack.inbox.domain.InboxItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InboxItemRepository extends JpaRepository<InboxItem, UUID> {

    List<InboxItem> findByStatus(String status);

    List<InboxItem> findByDetectedType(String detectedType);
}
