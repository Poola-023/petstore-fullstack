package com.example.petstore.Service;

import com.example.petstore.model.Vendor;
import com.example.petstore.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender; // 1. MUST IMPORT THIS
import org.springframework.stereotype.Service;

@Service
public class VendorService{
    @Autowired
    private VendorRepository vendorRepository;

    @Autowired // 2. MUST USE THIS TO INJECT THE BEAN
    private JavaMailSender mailSender;
    // Temporary storage for OTPs: Phone -> OTP
    private Map<String, String> otpStorage = new HashMap<>();

    /*public String generateOTP(String phoneNumber) {
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(phoneNumber, otp);
        System.out.println("OTP for " + phoneNumber + " is: " + otp); // Check IntelliJ Console
        return otp;
    }*/
    public String generateOTP(String identifier, String email) {
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(identifier, otp);

        // Send to Email if provided
        if (email != null && !email.isEmpty()) {
            sendEmail(email, otp);
        }

        // Still print to IntelliJ console for your testing in Hyderabad
        System.out.println("VENDOR DEBUG -> OTP for " + identifier + " is: " + otp);
        return otp;
    }
    private void sendEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ushapetstore@gmail.com"); // Your email
            message.setTo(toEmail);
            message.setSubject("Vendor Verification - Usha Pet Store");
            message.setText("Your verification code is: " + otp + "\n\nPlease use this to complete your login/signup.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email failed to send: " + e.getMessage());
        }
    }

    /*public boolean verifyOTP(String phoneNumber, String userOtp) {
        return userOtp.equals(otpStorage.get(phoneNumber));
    }

    public Vendor registerVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public Vendor findByPhone(String phoneNumber) {
        return vendorRepository.findByPhoneNumber(phoneNumber);
    }*/
   /* public boolean verifyOTP(String identifier, String userOtp) {

        return userOtp.equals(otpStorage.get(identifier));
    }*/
    public boolean verifyOTP(String identifier, String userOtp) {
        String storedOtp = otpStorage.get(identifier);
        System.out.println("Verifying Phone: " + identifier);
        System.out.println("Stored OTP: " + storedOtp + " | Received OTP: " + userOtp);

        if (userOtp != null && userOtp.equals(storedOtp)) {
            otpStorage.remove(identifier); // Clear OTP after success
            return true;
        }
        return false;
    }
    public Vendor registerVendor(Vendor vendor) {
        if (vendor.getId() == null || vendor.getId().trim().isEmpty()) {
            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM").format(java.time.LocalDateTime.now());
            String customId = "VND" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
            vendor.setId(customId);
        }
        return vendorRepository.save(vendor);
    }

    public Optional<Vendor> findByPhone(String phoneNumber) {
        return vendorRepository.findByPhoneNumber(phoneNumber);
    }
}
