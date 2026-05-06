package com.example.petstore.repository;

import com.example.petstore.model.PetImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PetImageRepository extends JpaRepository<PetImage, String> {

    /**
     * Finds all images associated with a specific Pet ID.
     * Useful for displaying a gallery on the frontend.
     */
    List<PetImage> findByPetId(String petId);
}
