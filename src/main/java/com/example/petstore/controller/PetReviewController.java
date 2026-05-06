package com.example.petstore.controller;

import com.example.petstore.model.PetReview;
import com.example.petstore.repository.PetReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class PetReviewController {

    private static final Logger logger = LoggerFactory.getLogger(PetReviewController.class);

    @Autowired
    private PetReviewRepository reviewRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody PetReview review) {
        try {
            // Check if review already exists for this order to prevent duplicates
            if (reviewRepository.existsByOrderId(review.getOrderId())) {
                return ResponseEntity.badRequest().body("Review already submitted for this order.");
            }

            // Generate custom ID (e.g. REV202603123456)
            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM")
                    .format(java.time.LocalDateTime.now());
            review.setId("REV" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000)));

            reviewRepository.save(review);
            logger.info("✅ Review saved successfully with ID: {}", review.getId());

            return ResponseEntity.ok("Review submitted successfully!");

        } catch (Exception e) {
            logger.error("❌ Error saving review: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving review.");
        }
    }

    // Endpoint to check if an order is reviewed (so frontend can hide the button)
    @GetMapping("/check/{orderId}")
    public ResponseEntity<Boolean> checkReviewExists(@PathVariable String orderId) {
        return ResponseEntity.ok(reviewRepository.existsByOrderId(orderId));
    }

    // ✨ NEW: Fetch all reviews for a specific pet
    @GetMapping("/pet/{petId}")
    public ResponseEntity<?> getReviewsByPet(@PathVariable String petId) {
        try {
            return ResponseEntity.ok(reviewRepository.findByPetId(petId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch reviews.");
        }
    }
}