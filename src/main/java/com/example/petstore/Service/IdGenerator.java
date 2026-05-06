package com.example.petstore.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class IdGenerator {
    /*public static String generateUserId(long currentCount) {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        // This formats the number to be 4 digits with leading zeros (0001)
        return String.format("USER%s%04d", datePart, currentCount + 1);
    }*/
    public static String generateUserId(long currentCount) {
        try {
            String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
            // Ensures the ID is never null
            return String.format("USER%s%04d", datePart, currentCount + 1);
        } catch (Exception e) {
            return "USER-TEMP-" + System.currentTimeMillis(); // Fallback ID
        }
    }
}
