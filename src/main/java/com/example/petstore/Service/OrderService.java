package com.example.petstore.Service;

import com.example.petstore.model.Order;
import com.example.petstore.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * ✨ PLACES MULTIPLE ORDERS
     * Used by Checkout.js to process the entire cart in one go.
     */
    @Transactional
    public List<Order> placeOrders(List<Order> orders) {
        for (Order order : orders) {
            // Set default metadata before saving
            order.setOrderDate(LocalDateTime.now());

            // If it's a Razorpay/Online payment, mark as PAID
            if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
                order.setPaymentStatus("PAID");
            } else {
                order.setPaymentStatus("PENDING_COD");
            }

            order.setOrderStatus("IN_PROCESS");
        }
        return orderRepository.saveAll(orders);
    }

    /**
     * ✨ FETCHES USER ADOPTIONS
     * Used by MyPets.js to show the user's soulful companions.
     */
    public List<Order> getAdoptionsByUserId(String userId) {
        // We sort by date so the newest pet appears first
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    /**
     * ✨ FETCHES A SINGLE RECORD
     * Used by DigitalHealthPassport.js to verify ownership.
     */
    public Order getOrderDetails(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    /**
     * ✨ FETCHES ALL ORDERS FOR A SPECIFIC USER
     * This matches the call used in your OrderController.
     * * @param userId The ID of the logged-in user
     * @return List of Order objects, or an empty list if none found
     */
    public List<Order> getOrdersByUserId(String userId) {
        // Calling the custom repository method we defined earlier
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);

        // Defensive check: Return an empty list instead of null to prevent
        // frontend mapping errors in MyPets.js
        if (orders == null) {
            return new java.util.ArrayList<>();
        }

        return orders;
    }
}
