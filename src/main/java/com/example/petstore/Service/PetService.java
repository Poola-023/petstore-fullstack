package com.example.petstore.Service;

import com.example.petstore.model.Pet;
import com.example.petstore.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    public Pet savePet(Pet pet) {
        return petRepository.save(pet);
    }

    public List<Pet> getPetsByVendor(String vendorId) {
        return petRepository.findByVendorId(vendorId);
    }

    // ✨ NEW: Service method to get related pets
    public List<Pet> getRelatedPets(String vendorId, String category, String currentPetId) {
        return petRepository.findByVendorIdAndCategoryAndIdNot(vendorId, category, currentPetId);
    }

    public Optional<Pet> getPetById(String id) {
        return petRepository.findById(id);
    }

    // Add this inside your PetService class
    public List<Pet> getPetsByCategory(String category) {
        return petRepository.findByCategoryIgnoreCase(category);
    }


    public List<Pet> saveBulkPets(List<Pet> pets) {
        for (Pet pet : pets) {
            // If the frontend didn't provide an ID, generate a unique one
            if (pet.getId() == null || pet.getId().isEmpty()) {
                pet.setId(UUID.randomUUID().toString());
            }

            // Set default stock status if quantity is missing
            if (pet.getQuantity() == null) {
                pet.setQuantity("1");
            }
        }

        // Spring Data JPA saves the whole array in one ultra-fast transaction
        return petRepository.saveAll(pets);
    }
}