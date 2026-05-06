package com.example.petstore.controller;

import com.example.petstore.Service.CartService;
import com.example.petstore.model.CartItem;
import com.example.petstore.model.Pet;
import com.example.petstore.repository.CartRepository;
import com.example.petstore.repository.PetRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*") // Critical: Prevents 'Failed to fetch' CORS errors
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PetRepository petRepository;

    // 1. Fetch saved cart from DB for a specific user
    @GetMapping("/user/{userId}")
    public List<Pet> getSavedCart(@PathVariable String userId) { // Assumes userId is Long
        List<CartItem> items = cartRepository.findByUserId(userId);

        return items.stream()
                .map(item -> petRepository.findById(item.getPetId()).orElse(null))
                .filter(pet -> pet != null)
                .collect(Collectors.toList());
    }

    // 2. Add a pet to the database cart
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItem cartItem) {

        // ✨ Generate Custom Cart ID: CRT + YYYYMM + Random 6 digits
        if (cartItem.getId() == null || cartItem.getId().trim().isEmpty()) {
            String yearMonth = DateTimeFormatter.ofPattern("yyyyMM").format(LocalDateTime.now());
            String customId = "CRT" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
            cartItem.setId(customId);
        }

        cartRepository.save(cartItem);
        return ResponseEntity.ok("Pet added to persistent cart with ID: " + cartItem.getId());
    }

    @Autowired
    private CartService cartService;

    /*@PostMapping("/add")
    public ResponseEntity<CartItem> addItem(@RequestBody CartItem item) {
        CartItem savedItem = cartService.addToCart(item);
        return ResponseEntity.ok(savedItem);
    }*/

    // 3. Remove a single pet from the cart
    /*@DeleteMapping("/remove/{userId}/{petId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long petId) {
        cartRepository.deleteByUserIdAndPetId(userId, petId);
        return ResponseEntity.ok("Pet removed from cart");
    }*/

    @DeleteMapping("/remove/{userId}/{petId}")
    @Transactional // Required for delete operations
    public ResponseEntity<?> removeFromCart(
            @PathVariable String userId,
            @PathVariable String petId) { // ✨ CRITICAL: petId MUST be String now (PET...)

        try {
            // Find and delete the specific row in your cart table
            cartRepository.deleteByUserIdAndPetId(userId, petId);
            return ResponseEntity.ok("Item removed from cart");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}