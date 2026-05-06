package com.example.petstore.controller;

import com.example.petstore.model.Pet;
import com.example.petstore.Service.PetService;
import com.example.petstore.repository.PetRepository;
import com.example.petstore.repository.VendorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.petstore.dto.CategoryDiscountRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "*")
public class PetController {

    @Autowired
    private PetService petService;



    /*@PostMapping("/add")
    public ResponseEntity<?> addPet(
            @RequestParam("pet") String petJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Convert JSON string from React into Pet Object
            ObjectMapper objectMapper = new ObjectMapper();
            Pet pet = objectMapper.readValue(petJson, Pet.class);

            // Convert Image to Byte Array if it exists
            if (image != null && !image.isEmpty()) {
                pet.setImage(image.getBytes());
            }

            Pet savedPet = petService.savePet(pet);
            return ResponseEntity.ok(savedPet);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }*/
    /* com.example.petstore.controller.PetController.java */

    // ✨ 1. Initialize the logger at the top of your controller class
    private static final Logger logger = LoggerFactory.getLogger(PetController.class);


    /*@PostMapping("/add")
    public ResponseEntity<?> addPet(
            @RequestParam("pet") String petJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        logger.info("📥 Received request to add a new pet.");

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Pet pet = objectMapper.readValue(petJson, Pet.class);

            // ✨ Generate Custom ID if it's a new pet
            if (pet.getId() == null || pet.getId().trim().isEmpty()) {
                // Generates e.g. PET202603123456
                String yearMonth = DateTimeFormatter.ofPattern("yyyyMM")
                        .format(LocalDateTime.now());
                String customId = "PET" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));

                pet.setId(customId);
                logger.info("🏷️ Generated new Pet ID: {}", customId);
            } else {
                logger.info("🔄 Updating existing Pet ID: {}", pet.getId());
            }

            // Process the image
            if (imageFile != null && !imageFile.isEmpty()) {
                pet.setImage(imageFile.getBytes());
            }


            // Save to the database
            petRepository.save(pet);

            // Return the custom ID so the frontend knows it succeeded
            return ResponseEntity.ok("Pet added successfully with ID: " + pet.getId());

        } catch (Exception e) {
            logger.error("❌ Error occurred while saving pet: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error saving pet: " + e.getMessage());
        }
    }*/

   /* @GetMapping("/vendor/{vendorId}")
    public List<Pet> getVendorPets(@PathVariable Long vendorId) {
        return petService.getPetsByVendor(vendorId);
    }
*/
    @Autowired // 3. This "injects" the repository into the controller
    private PetRepository petRepository;

    /*@PutMapping("/update/{id}")
    public ResponseEntity<?> updatePet(
            @PathVariable Long id,
            @RequestParam("pet") String petJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Pet updatedData = objectMapper.readValue(petJson, Pet.class);

            // 1. Find the existing pet first
            return petRepository.findById(id).map(existingPet -> {

                // 2. Update the fields
                existingPet.setName(updatedData.getName());
                existingPet.setBreed(updatedData.getBreed());
                existingPet.setAge(updatedData.getAge());
                existingPet.setPrice(updatedData.getPrice());
                existingPet.setQuantity(updatedData.getQuantity());
                existingPet.setDescription(updatedData.getDescription());

                // 3. Handle the image update
                if (image != null && !image.isEmpty()) {
                    try {
                        existingPet.setImage(image.getBytes());
                    } catch (IOException e) {
                        return ResponseEntity.internalServerError().body("Image processing failed");
                    }
                }

                // 4. Save and return the response
                Pet savedPet = petRepository.save(existingPet);
                return ResponseEntity.ok(savedPet);

            }).orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Update error: " + e.getMessage());
        }
    }*/
    /*@GetMapping("/all")
    public List<Pet> getAllPets() {
        List<Pet> allPets = petRepository.findAll();
        System.out.println("Total pets found: " + allPets.size()); // Check your IntelliJ console
        return allPets;
    }

    // This is the endpoint the Vendor Dashboard uses
    @GetMapping("/vendor/{vendorId}")
    public List<Pet> getPetsByVendor(@PathVariable Long vendorId) {
        return petRepository.findByVendorId(vendorId);
    }*/
    @GetMapping("/all")
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    // 2. GET VENDOR PETS (For the Vendor Dashboard)
    // ONLY KEEP THIS ONE - REMOVE ANY OTHER METHOD MAPPED TO THIS SAME URL
    @GetMapping("/vendor/{vendorId}")
    public List<Pet> getPetsByVendor(@PathVariable String vendorId) {
        return petRepository.findByVendorId(vendorId);
    }

    @Autowired
    private VendorRepository vendorRepository;

    // PetController.java


    @GetMapping("/{id}")
    public ResponseEntity<Pet> getPetById(@PathVariable String id) {
        return petRepository.findById(id)
                .map(pet -> {
                    // Now this will work because vendorRepository is injected
                    vendorRepository.findById(pet.getVendorId())
                            .ifPresent(v -> pet.setVendorName(v.getUsername()));
                    return ResponseEntity.ok(pet);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /* PetController.java */

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePet(@PathVariable String id) {
        try {
            // 1. Check if pet exists
            Optional<Pet> pet = petRepository.findById(id);
            if (pet.isPresent()) {
                // 2. Delete the pet
                petRepository.deleteById(id);
                return ResponseEntity.ok("Pet deleted successfully");
            } else {
                return ResponseEntity.status(404).body("Pet not found");
            }
        } catch (Exception e) {
            // This might fail if the pet is referenced in an existing Order
            return ResponseEntity.status(500).body("Error: Cannot delete pet. It may be linked to an order.");
        }
    }

    /*@PutMapping("/update/{id}")
    public ResponseEntity<?> updatePet(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("breed") String breed,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        return petRepository.findById(id).map(pet -> {
            pet.setName(name);
            pet.setBreed(breed);
            pet.setPrice(price);
            pet.setQuantity(quantity);

            // Only update image if a new one is uploaded
            if (image != null && !image.isEmpty()) {
                try {
                    pet.setImage(Base64.getEncoder().encodeToString(image.getBytes()).getBytes());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }

            petRepository.save(pet);
            return ResponseEntity.ok("Pet updated successfully");
        }).orElse(ResponseEntity.notFound().build());
    }*/

    // Add this to your PetController.java
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePet(@PathVariable String id, @RequestBody Pet petDetails) {
        try {
            Optional<Pet> existingPetOpt = petRepository.findById(id);

            if (existingPetOpt.isPresent()) {
                Pet existingPet = existingPetOpt.get();

                // Update fields
                if (petDetails.getCategory() != null) existingPet.setCategory(petDetails.getCategory());
                if (petDetails.getBreed() != null) existingPet.setBreed(petDetails.getBreed());
                if (petDetails.getPrice() != null) existingPet.setPrice(petDetails.getPrice());
                if (petDetails.getMaleQuantity() != null) existingPet.setMaleQuantity(petDetails.getMaleQuantity());
                if (petDetails.getFemaleQuantity() != null) existingPet.setFemaleQuantity(petDetails.getFemaleQuantity());
                if (petDetails.getQuantity() != null) existingPet.setQuantity(petDetails.getQuantity());
                if (petDetails.getDob() != null) existingPet.setDob(petDetails.getDob());
                if (petDetails.getColor() != null) existingPet.setColor(petDetails.getColor());
                if (petDetails.getIsVaccinated() != null) existingPet.setIsVaccinated(petDetails.getIsVaccinated());
                if (petDetails.getVaccinationDose() != null) existingPet.setVaccinationDose(petDetails.getVaccinationDose());
                if (petDetails.getDescription() != null) existingPet.setDescription(petDetails.getDescription());

                // Only update image if a NEW one was uploaded
                if (petDetails.getImage() != null && petDetails.getImage().length > 0) {
                    existingPet.setImage(petDetails.getImage());
                }

                petRepository.save(existingPet);
                return ResponseEntity.ok("Pet updated successfully!");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pet not found.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating pet.");
        }
    }

    // ✨ NEW: Endpoint to fetch related pets from the same boutique
    @GetMapping("/{id}/related")
    public ResponseEntity<List<Pet>> getRelatedPets(@PathVariable String id) {
        return petService.getPetById(id)
                .map(currentPet -> {
                    List<Pet> relatedPets = petService.getRelatedPets(
                            currentPet.getVendorId(),
                            currentPet.getCategory(),
                            currentPet.getId()
                    );
                    return ResponseEntity.ok(relatedPets);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✨ NEW: Dedicated Bulk Save Endpoint
    // ✨ NEW: Fetch pets by category

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<?> getPetsByCategory(@PathVariable String categoryName) {
        try {
            // Using the repository method we defined earlier
            List<Pet> pets = petRepository.findByCategoryIgnoreCase(categoryName);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            logger.error("❌ Error fetching pets for category {}: {}", categoryName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch category data.");
        }
    }
    /*@PostMapping("/saveBulk")
    public ResponseEntity<?> saveBulkPets(@RequestBody List<Pet> pets) {

        logger.info("📥 Received request to bulk add {} pets.", pets.size());

        try {
            // Get current YearMonth for ID generation
            String yearMonth = DateTimeFormatter.ofPattern("yyyyMM")
                    .format(LocalDateTime.now());

            for (Pet pet : pets) {
                // ✨ 1. Generate Custom ID if it's a new pet
                if (pet.getId() == null || pet.getId().trim().isEmpty()) {
                    String customId = "PET" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
                    pet.setId(customId);
                    logger.info("🏷️ Generated new Pet ID: {}", customId);
                } else {
                    logger.info("🔄 Updating existing Pet ID: {}", pet.getId());
                }

                // ✨ 2. Verify Image Processing (Jackson automatically converted Base64 to byte[]!)
                if (pet.getImage() != null && pet.getImage().length > 0) {
                    logger.info("📸 Image successfully parsed and attached to Pet ID: {}", pet.getId());
                } else {
                    logger.warn("⚠️ No image provided for Pet ID: {}", pet.getId());
                }
            }

            // ✨ 3. Save ALL to the database at once using the repository
            // (If you use PetService, you can pass the list there, but this matches your /add format perfectly)
            List<Pet> savedPets = petRepository.saveAll(pets);

            logger.info("✅ {} Pets saved successfully to the database.", savedPets.size());

            return ResponseEntity.ok("Successfully added " + savedPets.size() + " pet(s)!");

        } catch (Exception e) {
            // ✨ 4. Detailed error logging matching the /add method
            logger.error("❌ Error occurred while saving bulk pets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving bulk pets: " + e.getMessage());
        }
    }*/


// ... your other imports

    @PostMapping("/discount/category")
    public ResponseEntity<?> applyCategoryDiscount(@RequestBody CategoryDiscountRequest request) {
        try {
            // 1. Fetch all pets for this vendor in this specific category
            List<Pet> petsToUpdate = petRepository.findByVendorIdAndCategoryIgnoreCase(
                    request.getVendorId(),
                    request.getCategory()
            );

            if (petsToUpdate.isEmpty()) {
                return ResponseEntity.badRequest().body("No pets found in this category for this vendor.");
            }

            // 2. Loop through and apply the new discount percentage
            for (Pet pet : petsToUpdate) {
                pet.setDiscountPercentage(request.getDiscountPercentage());
            }

            // 3. Save the entire updated list back to the database
            petRepository.saveAll(petsToUpdate);

            return ResponseEntity.ok("Successfully applied a " + request.getDiscountPercentage() + "% discount to " + petsToUpdate.size() + " pets.");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error applying discount: " + e.getMessage());
        }
    }

    // ✨ 1. Apply a discount to ALL pets owned by a specific vendor (Store-wide)
    @PostMapping("/discount/vendor")
    public ResponseEntity<?> applyVendorDiscount(@RequestBody Map<String, Object> payload) {
        try {
            String vendorId = (String) payload.get("vendorId");
            int discountPercentage = Integer.parseInt(payload.get("discountPercentage").toString());

            List<Pet> vendorPets = petRepository.findByVendorId(vendorId);
            for (Pet pet : vendorPets) {
                pet.setDiscountPercentage(discountPercentage);
            }
            petRepository.saveAll(vendorPets);

            return ResponseEntity.ok("Store-wide discount applied successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error applying store-wide discount.");
        }
    }

    // ✨ 2. Apply a discount to a SPECIFIC individual pet
    @PostMapping("/discount/pet")
    public ResponseEntity<?> applyIndividualPetDiscount(@RequestBody Map<String, Object> payload) {
        try {
            String petId = (String) payload.get("petId");
            int discountPercentage = Integer.parseInt(payload.get("discountPercentage").toString());

            return petRepository.findById(petId).map(pet -> {
                pet.setDiscountPercentage(discountPercentage);
                petRepository.save(pet);
                return ResponseEntity.ok("Individual pet discount applied successfully!");
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pet not found."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error applying individual discount.");
        }
    }
    @PostMapping("/saveBulk")
    public ResponseEntity<?> saveBulkPets(@RequestBody List<Pet> pets) {

        logger.info("📥 Received request to bulk add {} pets.", pets.size());

        try {
            // Get current YearMonth for ID generation
            String yearMonth = DateTimeFormatter.ofPattern("yyyyMM")
                    .format(LocalDateTime.now());

            for (Pet pet : pets) {
                // ✨ 1. Generate Custom ID if it's a new pet
                if (pet.getId() == null || pet.getId().trim().isEmpty()) {
                    String customId = "PET" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
                    pet.setId(customId);
                    logger.info("🏷️ Generated new Pet ID: {}", customId);
                }

                // ✨ 2. Jackson already converted the clean Base64 string from React into a byte[]!
                if (pet.getImage() != null && pet.getImage().length > 0) {
                    logger.info("📸 Image successfully parsed and attached to Pet ID: {}", pet.getId());
                } else {
                    logger.warn("⚠️ No image provided for Pet ID: {}", pet.getId());
                }
            }

            // ✨ 3. Save ALL directly to the MySQL database at once
            List<Pet> savedPets = petRepository.saveAll(pets);

            logger.info("✅ {} Pets saved successfully to the database.", savedPets.size());

            return ResponseEntity.ok("Successfully added " + savedPets.size() + " pet(s)!");

        } catch (Exception e) {
            logger.error("❌ Error occurred while saving bulk pets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving bulk pets: " + e.getMessage());
        }
    }


    @PostMapping("/add")
    public ResponseEntity<?> addPet(
            @RequestParam("pet") String petJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        logger.info("📥 Received request to add a single new pet.");

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Pet pet = objectMapper.readValue(petJson, Pet.class);

            // ✨ 1. Generate Custom ID if it's a new pet
            if (pet.getId() == null || pet.getId().trim().isEmpty()) {
                String yearMonth = DateTimeFormatter.ofPattern("yyyyMM")
                        .format(LocalDateTime.now());
                String customId = "PET" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));

                pet.setId(customId);
                logger.info("🏷️ Generated new Pet ID: {}", customId);
            }

            // ✨ 2. Process the MultipartFile directly to the Database
            if (imageFile != null && !imageFile.isEmpty()) {
                pet.setImage(imageFile.getBytes());
                logger.info("📸 Multipart image successfully attached to Pet ID: {}", pet.getId());
            }

            // ✨ 3. Save directly to MySQL
            petRepository.save(pet);

            return ResponseEntity.ok("Pet added successfully with ID: " + pet.getId());

        } catch (Exception e) {
            logger.error("❌ Error occurred while saving pet: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error saving pet: " + e.getMessage());
        }
    }

}