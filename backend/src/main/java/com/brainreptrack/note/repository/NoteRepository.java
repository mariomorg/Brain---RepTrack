package com.brainreptrack.note.repository;

import com.brainreptrack.note.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {

     List<Note> findByType(String type);

     List<Note> findByTitleContainingIgnoreCase(String keyword);

     @Query("SELECT n FROM Note n JOIN n.tags t WHERE t.tagName = :tagName")
     List<Note> findByTagName(@Param("tagName") String tagName);

     @Query("SELECT DISTINCT t.tagName FROM Note n JOIN n.tags t ORDER BY t.tagName")
     List<String> findAllDistinctTags();

     boolean existsByInboxItem_Id(UUID inboxItemId);

     /**
      * Returns true if a note with the exact path already exists above the
      * confidence threshold.
      */
     boolean existsByPathAndConfidenceScoreGreaterThan(String path, double confidenceScore);
}
