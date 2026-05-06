package com.example.petstore.controller;

import com.example.petstore.model.PromoBanner;
import com.example.petstore.repository.PromoBannerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promos")
@CrossOrigin(origins = "*") // Adjust if you have a specific CORS setup
public class PromoBannerController {

    private static final Logger logger = LoggerFactory.getLogger(PromoBannerController.class);

    @Autowired
    private PromoBannerRepository promoBannerRepository;

    // ✨ 1. Endpoint to Add a New Promo Banner
    @PostMapping("/add")
    public ResponseEntity<?> addPromo(@RequestBody PromoBanner promoBanner) {
        logger.info("📥 Received request to add a new Promo Ad for Vendor: {}", promoBanner.getVendorId());

        try {
            // Generate a Custom ID (e.g., PRM202603123456)
            if (promoBanner.getId() == null || promoBanner.getId().trim().isEmpty()) {
                String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM")
                        .format(java.time.LocalDateTime.now());
                String customId = "PRM" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));

                promoBanner.setId(customId);
                logger.info("🏷️ Generated new Promo ID: {}", customId);
            }

            if (promoBanner.getImage() != null && promoBanner.getImage().length > 0) {
                logger.info("📸 Promo Image successfully parsed.");
            } else {
                logger.warn("⚠️ No image provided for Promo ID: {}", promoBanner.getId());
            }

            // Save to database

            promoBannerRepository.save(promoBanner);
            logger.info("✅ Promo Ad {} saved successfully.", promoBanner.getId());

            return ResponseEntity.ok("Promotional Ad saved successfully!");

        } catch (Exception e) {
            logger.error("❌ Error occurred while saving Promo Ad: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving Promo Ad: " + e.getMessage());
        }
    }

    // ✨ 2. Endpoint to Fetch all Promo Banners for a specific Vendor
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getPromosByVendor(@PathVariable String vendorId) {
        try {
            List<PromoBanner> promos = promoBannerRepository.findByVendorId(vendorId);
            return ResponseEntity.ok(promos);
        } catch (Exception e) {
            logger.error("❌ Error fetching promos for vendor {}: {}", vendorId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch promotional ads.");
        }
    }

    // ✨ NEW: Fetch ALL Promos for the main Dashboard
    @GetMapping("/all")
    public ResponseEntity<?> getAllPromos() {
        try {
            List<PromoBanner> promos = promoBannerRepository.findAll();
            return ResponseEntity.ok(promos);
        } catch (Exception e) {
            logger.error("❌ Error fetching all promos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch promotional ads.");
        }
    }

    // ✨ 1. Endpoint to UPDATE an existing Promo Banner
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePromo(@PathVariable String id, @RequestBody PromoBanner promoDetails) {
        logger.info("📝 Received request to update Promo Ad: {}", id);
        try {
            java.util.Optional<PromoBanner> existingPromoOpt = promoBannerRepository.findById(id);

            if (existingPromoOpt.isPresent()) {
                PromoBanner existingPromo = existingPromoOpt.get();

                // Update fields if provided
                if (promoDetails.getDiscount() != null) {
                    existingPromo.setDiscount(promoDetails.getDiscount());
                }
                if (promoDetails.getBio() != null) {
                    existingPromo.setBio(promoDetails.getBio());
                }
                // Only update the image if a new one was uploaded
                if (promoDetails.getImage() != null && promoDetails.getImage().length > 0) {
                    existingPromo.setImage(promoDetails.getImage());
                }

                // ✨ Manually update the G_AUD_TS timestamp!
                existingPromo.setUpdatedDate(java.time.LocalDateTime.now());

                promoBannerRepository.save(existingPromo);
                logger.info("✅ Promo Ad {} updated successfully.", id);
                return ResponseEntity.ok("Promotional Ad updated successfully!");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Promo Ad not found.");
        } catch (Exception e) {
            logger.error("❌ Error updating Promo Ad: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating Promo Ad: " + e.getMessage());
        }
    }

    // ✨ 2. Endpoint to DELETE a Promo Banner
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePromo(@PathVariable String id) {
        logger.info("🗑️ Received request to delete Promo Ad: {}", id);
        try {
            if (promoBannerRepository.existsById(id)) {
                promoBannerRepository.deleteById(id);
                logger.info("✅ Promo Ad {} deleted successfully.", id);
                return ResponseEntity.ok("Promotional Ad deleted successfully!");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Promo Ad not found.");
        } catch (Exception e) {
            logger.error("❌ Error deleting Promo Ad: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting Promo Ad: " + e.getMessage());
        }
    }
}