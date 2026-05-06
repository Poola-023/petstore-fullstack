package com.example.petstore.repository;

import com.example.petstore.model.StoryCheer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoryCheerRepository extends JpaRepository<StoryCheer, Long> {

    /**
     * ✨ COUNT CHEERS
     * Used to display the total ❤️ count on the Success Story card.
     */
    long countByStoryId(Long storyId);

    /**
     * ✨ DUPLICATE CHECK
     * Used to check if a specific user has already cheered this story.
     * If this returns an Optional.isPresent(), the frontend should disable the button.
     */
    Optional<StoryCheer> findByStoryIdAndUserId(Long storyId, String userId);

    /**
     * ✨ UN-CHEER (Optional)
     * If a user clicks the heart again, you might want to remove the cheer.
     */
    void deleteByStoryIdAndUserId(Long storyId, String userId);
}