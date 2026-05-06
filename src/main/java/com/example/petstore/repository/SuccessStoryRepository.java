package com.example.petstore.repository;

import com.example.petstore.model.SuccessStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface SuccessStoryRepository extends JpaRepository<SuccessStory, String> {

    // Fetch all stories, newest first
    List<SuccessStory> findAllByOrderByPublishedDateDesc();

    @Transactional
    @Modifying
    @Query("UPDATE SuccessStory s SET s.likes = s.likes + 1 WHERE s.id = :id")
    void incrementLikes(String id);
}