package com.example.petstore.repository;

import com.example.petstore.model.Pet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, String> {
    List<Pet> findByVendorId(String vendorId); // Find all pets for one vendor
    List<Pet> findByVendorIdAndCategoryAndIdNot(String vendorId, String category, String id);

    // For "Just Arrived" (Newest pets first)
    List<Pet> findTop8ByOrderByIdDesc();

    // For "Best Selling" (Mocking with highest price for now)
    List<Pet> findTop8ByOrderByPriceDesc();

    // Add this to your PetRepository interface
    List<Pet> findByVendorIdAndCategoryIgnoreCase(String vendorId, String category);

    // Add this inside your PetRepository interface
    List<Pet> findByCategoryIgnoreCase(String category);

}
