package com.example.petstore.controller;

import com.example.petstore.Service.EmailService;
import com.example.petstore.Service.OrderService;
import com.example.petstore.model.Order;
import com.example.petstore.model.Pet;
import com.example.petstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private VendorRepository vendorRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderService orderService;

    // ✨ ADDED: PetRepository to manage inventory
    @Autowired
    private PetRepository petRepository;

    @GetMapping("/vendor/{vendorId}")
    public List<Order> getOrdersByVendor(@PathVariable String vendorId) {
        return orderRepository.findByVendorIdOrderByOrderDateDesc(vendorId);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable String userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrders(@RequestBody List<Order> orders) {
        try {
            for (Order order : orders) {
                // 🛑 CRITICAL LOG: Check your console/terminal for this output
                System.out.println("DEBUG -> Pet: " + order.getPetNames() + " | Received Address ID: " + order.getAddressId());

                if (order.getAddressId() == null) {
                    System.err.println("WARNING: Address ID is NULL for pet " + order.getPetNames());
                }
                String customId = "ORD" + 2026 + String.format("%06d", (int)(Math.random() * 1000000));
                order.setId(customId);
                order.setOrderDate(java.time.LocalDateTime.now());

                orderRepository.save(order);

                // 1. order.getPetId() now returns a String like "PET202603123456"
                petRepository.findById(order.getPetId()).ifPresent(pet -> {

                    // 2. Check if there is stock left
                    int currentQuantity = 0;
                    if (pet.getQuantity() != null && !pet.getQuantity().isEmpty()) {
                        try {
                            currentQuantity = Integer.parseInt(pet.getQuantity());
                        } catch (NumberFormatException e) {
                            currentQuantity = 0; // Fallback if the string isn't a valid number
                        }
                    }


                    if (currentQuantity > 0) {
                        // Decrease by 1 and convert back to String
                        pet.setQuantity(String.valueOf(currentQuantity - 1));

                    } else {
                        // Optional: Log a warning if stock hit 0 before this order processed
                        System.out.println("⚠️ Warning: Order placed but pet is already out of stock!");
                    }
                    if ("Male".equalsIgnoreCase(order.getPetGender())) {
                        int maleQty = Integer.parseInt(pet.getMaleQuantity());
                        if (maleQty > 0) pet.setMaleQuantity(String.valueOf(maleQty - 1));
                    }
                    else if ("Female".equalsIgnoreCase(order.getPetGender())) {
                        int femaleQty = Integer.parseInt(pet.getFemaleQuantity());
                        if (femaleQty > 0) pet.setFemaleQuantity(String.valueOf(femaleQty - 1));
                    }
                    petRepository.save(pet); // Save the updated stock to the database
                });
            }

            // Use saveAll to persist the entire list including addressIds
            List<Order> savedOrders = orderRepository.saveAll(orders);
            // Email Notification Loop
            for (Order order : savedOrders) {
                String userEmail = userRepository.findById(order.getUserId())
                        .map(user -> user.getEmail())
                        .orElse(null);

                String vendorEmail = vendorRepository.findById(order.getVendorId())
                        .map(vendor -> vendor.getEmail())
                        .orElse(null);

                if (userEmail != null) {
                    emailService.sendEmail(userEmail, "Adoption Placed!",
                            "Order #" + order.getId() + " for " + order.getPetNames() + " is pending.");
                }

                if (vendorEmail != null) {
                    /*emailService.sendEmail(vendorEmail, "New Order Received!",
                            "Check UTR: " + order.getTransactionId() + " for pet: " + order.getPetNames());*/
                    emailService.sendVendorOrderNotification(vendorEmail, order);
                }
            }

            // Clear cart for the user after successful placement
            if (!orders.isEmpty()) {
                cartRepository.deleteByUserId(orders.get(0).getUserId());
            }

            return ResponseEntity.ok(savedOrders);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable String id, @RequestBody Map<String, String> updates) {
        return orderRepository.findById(id).map(order -> {

            // 1. Update Order Status and send Email
            if (updates.containsKey("orderStatus")) {
                String newStatus = updates.get("orderStatus");
                order.setOrderStatus(newStatus);

                userRepository.findById(order.getUserId()).ifPresent(user -> {
                    emailService.sendEmail(
                            user.getEmail(),
                            "Order Status Update",
                            "Your companion " + order.getPetNames() + " is now: " + newStatus
                    );
                });
            }

            // 2. Update Payment Status
            if (updates.containsKey("paymentStatus")) {
                order.setPaymentStatus(updates.get("paymentStatus"));
            }

            // 3. Save to database
            orderRepository.save(order);
            return ResponseEntity.ok("Updated Successfully");

        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-adoptions/{userId}")
    public ResponseEntity<List<Order>> getMyAdoptions(@PathVariable String userId) {
        // You'll need a custom method in your OrderRepository:
        // List<Order> findByUserIdOrderByOrderDateDesc(String userId);
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }
}