package com.example.petstore.controller;

import com.example.petstore.model.Notification;
import com.example.petstore.model.StoryCheer;
import com.example.petstore.model.SuccessStory;
import com.example.petstore.repository.NotificationRepository;
import com.example.petstore.repository.StoryCheerRepository;
import com.example.petstore.repository.SuccessStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*")
public class StoryController {

    @Autowired
    private SuccessStoryRepository storyRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private StoryCheerRepository cheerRepository;

    /**
     * ✨ FETCH ALL STORIES
     * GET http://localhost:8090/api/stories/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<SuccessStory>> getAllStories() {
        return ResponseEntity.ok(storyRepository.findAllByOrderByPublishedDateDesc());
    }

    /**
     * ✨ PUBLISH A NEW STORY
     * POST http://localhost:8090/api/stories/publish
     */
    @PostMapping("/publish")
    public ResponseEntity<?> publishStory(@RequestBody SuccessStory story) {
        try {
            SuccessStory saved = storyRepository.save(story);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to publish story.");
        }
    }

    /**
     * ✨ LIKE A STORY (CHEER)
     * PUT http://localhost:8090/api/stories/like/{id}
     */
    @PutMapping("/like/{id}")
    public ResponseEntity<?> likeStory(@PathVariable String id) {
        if (storyRepository.existsById(id)) {
            storyRepository.incrementLikes(id);
            return ResponseEntity.ok("❤️ Success Story Cheered!");
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{storyId}/cheer")
    @Transactional
    public ResponseEntity<?> cheerStory(@PathVariable String storyId, @RequestParam String userId) {
        // 1. Save the Cheer
        StoryCheer cheer = new StoryCheer();
        cheer.setStoryId(storyId);
        cheer.setUserId(userId);
        cheerRepository.save(cheer);

        // 2. Find the Story Owner to notify them
        SuccessStory story = storyRepository.findById(storyId).orElseThrow();

        // 3. Trigger Notification
        Notification n = new Notification();
        n.setUserId(story.getUserId()); // The owner of the story
        n.setTitle("❤️ Your story got a Cheer!");
        n.setMessage("Someone loved your companion's journey. Keep sharing!");
        n.setType("SOCIAL");
        notificationRepository.save(n);

        return ResponseEntity.ok(Collections.singletonMap("message", "Story cheered!"));
    }
    @PostMapping("/add")
    public ResponseEntity<?> addStory(@RequestBody SuccessStory story) {
        return ResponseEntity.ok(storyRepository.save(story));
    }
}