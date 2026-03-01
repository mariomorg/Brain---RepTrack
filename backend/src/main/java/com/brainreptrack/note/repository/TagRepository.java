package com.brainreptrack.note.repository;

import com.brainreptrack.note.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, String> {

    /**
     * Inserts a tag into the registry. If a tag with this name already exists
     * it is left unchanged (first-writer wins for the parent relationship).
     */
    @Modifying
    @Transactional
    @Query(value = """
            INSERT INTO tags (name, parent_name)
            VALUES (:name, :parentName)
            ON CONFLICT (name) DO NOTHING
            """, nativeQuery = true)
    void upsert(@Param("name") String name, @Param("parentName") String parentName);

    /** All direct children of a given parent tag. */
    List<Tag> findByParentName(String parentName);

    /** All root tags (no parent). */
    List<Tag> findByParentNameIsNull();

    Optional<Tag> findByName(String name);
}
