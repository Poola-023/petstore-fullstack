package com.example.petstore.repository;

import com.example.petstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    /**
     * Retrieves the adoption history for a specific user.
     * This is used to populate the "My Adoptions" sidebar on the dashboard.
     * * @param userId The ID of the logged-in user (e.g., Poola's ID).
     * @return A list of orders sorted by the most recent date.
     */
   /* List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    *//**
     * Finds all orders containing a specific pet name.
     * Useful for administrative searches or vendor tracking.
     *//*
    List<Order> findByPetNamesContaining(String petName);

    List<Order> findByVendorIdOrderByOrderDateDesc(String vendorId);

    // For Vendor Dashboard


    List<Order> findByUserId(String userId);
    List<Order> findByVendorId(String vendorId);
    List<Order> findByPetId(String petId);*/

    // ✨ CHANGED: from Long userId to String userId
    List<Order> findByUserIdOrderByOrderDateDesc(String userId);

    // ✨ CHANGED: from Long vendorId to String vendorId
    List<Order> findByVendorIdOrderByOrderDateDesc(String vendorId);
}
