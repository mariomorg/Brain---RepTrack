package com.brainreptrack.note.repository;

import com.brainreptrack.note.domain.Relation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelationRepository extends JpaRepository<Relation, UUID> {

    List<Relation> findByNoteA_Id(UUID noteAId);

    List<Relation> findByNoteB_Id(UUID noteBId);

    List<Relation> findByValidated(boolean validated);
}
