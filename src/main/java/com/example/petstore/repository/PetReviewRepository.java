package com.example.petstore.repository;

import com.example.petstore.model.PetReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetReviewRepository extends JpaRepository<PetReview, String> {
    // Helpful if you want to display reviews on the Pet Details page later!
    List<PetReview> findByPetId(String petId);

    // To check if an order has already been reviewed
    boolean existsByOrderId(String orderId);
}