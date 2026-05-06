package com.example.petstore.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment") // ✨ FIXED: Removed the "s" so it matches React!
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            // ✨ FIXED: Added your actual Test API Keys here
            RazorpayClient client = new RazorpayClient("rzp_test_SaGKXWItyTOgJv", "Io3xRhO7QPqJMb7GdDe1w1eR");

            JSONObject orderRequest = new JSONObject();

            // Convert amount to Integer and then to Paise (1 INR = 100 Paise)
            int amountInPaise = Integer.parseInt(data.get("amount").toString()) * 100;

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = client.orders.create(orderRequest);

            // Using ResponseEntity prevents plain-text formatting issues
            return ResponseEntity.ok(order.toString());

        } catch (RazorpayException e) {
            System.out.println("Razorpay Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Razorpay Order: " + e.getMessage());
        }
    }
}