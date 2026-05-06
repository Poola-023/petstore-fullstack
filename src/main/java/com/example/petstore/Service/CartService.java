package com.example.petstore.Service;

import com.example.petstore.model.CartItem;
import com.example.petstore.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public String generateCartId() {
        // 1. Get current Year and Month
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));

        // 2. Get the current count to increment the suffix
        long count = cartRepository.count() + 1;

        // 3. Format suffix to 4 digits (e.g., 0001)
        String suffix = String.format("%04d", count);

        return "CART" + datePart + suffix;
    }

    /*public CartItem addToCart(CartItem item) {
        item.setId(generateCartId());
        return cartRepository.save(item);
    }*/
}
