package com.example.petstore.repository;

import com.example.petstore.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<CartItem, String> {

    // Fetch all cart items for a specific user to restore their session
    List<CartItem> findByUserId(String userId);

    // Remove a specific pet from a user's cart
    @Transactional
    void deleteByUserIdAndPetId(String userId, String petId);

    // Clear the entire cart after a successful payment in Hyderabad
    @Transactional
    void deleteByUserId(String userId);
}
