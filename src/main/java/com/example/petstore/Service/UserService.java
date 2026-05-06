package com.example.petstore.Service;

import com.example.petstore.model.User;
import com.example.petstore.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    // Temporary storage for OTPs: Phone Number -> OTP
    private Map<String, String> otpStorage = new HashMap<>();

    /**
     * Generates a 4-digit OTP and sends it to the user's email.
     * Also prints to the console for easy testing in Hyderabad.
     */
    public String generateOTP(String phoneNumber, String email) {
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(phoneNumber, otp);

        if (email != null && !email.isEmpty()) {
            sendEmail(email, otp);
        }

        // Helpful for debugging in your IntelliJ console
        System.out.println("USER DEBUG -> OTP for " + phoneNumber + " is: " + otp);
        return otp;
    }

    /**
     * Sends the 4-digit PIN via Gmail.
     */
    /*private void sendEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ushapetstore@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Pet&Connect - User Verification");
            message.setText("Your verification code is: " + otp + "\n\nPlease use this to complete your registration or login.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email failed to send: " + e.getMessage());
        }
    }*/
    private void sendEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("ushapetstore@gmail.com");
            helper.setTo(toEmail);

            // ✨ Updated Subject to match OpenAI's concise style
            helper.setSubject("Your Pet & Connect code is " + otp);

            // ✨ HTML Body replicating the OpenAI/ChatGPT structure
            String htmlContent =
                    "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 40px 20px; color: #111111;'>" +

                            // Logo Header (Pet & Connect Brand)
                            "<div style='margin-bottom: 40px;'>" +
                            "<h2 style='font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -1px;'>" +
                            "Pet <span style='color: #FF9900;'>&</span> Connect" +
                            "</h2>" +
                            "</div>" +

                            // Intro Text
                            "<div style='margin-bottom: 30px;'>" +
                            "<p style='font-size: 16px; line-height: 1.5; margin: 0;'>Enter this temporary verification code to continue:</p>" +
                            "</div>" +

                            // ✨ Large Verification Box (Exact match to image style)
                            "<div style='background-color: #f2f2f2; border-radius: 12px; padding: 40px 20px; text-align: left; margin-bottom: 30px;'>" +
                            "<span style='font-size: 42px; font-weight: 500; letter-spacing: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>" +
                            otp +
                            "</span>" +
                            "</div>" +

                            // Security Warning
                            "<div style='margin-bottom: 50px;'>" +
                            "<p style='font-size: 15px; color: #444444; line-height: 1.6;'>" +
                            "If you did not request this code, please ignore this email. " +
                            "For your security, <strong>do not share this code with anyone</strong>. " +
                            "Pet & Connect staff will never ask for your verification PIN." +
                            "</p>" +
                            "</div>" +

                            // Team Sign-off
                            "<div style='margin-bottom: 40px; font-size: 15px; color: #111111;'>" +
                            "Best,<br/>" +
                            "The Pet & Connect team" +
                            "</div>" +

                            // Footer
                            "<div style='border-top: 1px solid #e5e5e5; padding-top: 30px;'>" +
                            "<h3 style='font-size: 20px; font-weight: 700; margin: 0 0 15px 0;'>Pet & Connect</h3>" +
                            "<p style='font-size: 13px; color: #666666; margin: 5px 0;'>Help center</p>" +
                            "</div>" +

                            "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("LOG -> OpenAI-styled email sent successfully");
        } catch (Exception e) {
            System.err.println("SMTP ERROR -> " + e.getMessage());
        }
    }


    /**
     * Verifies the PIN entered by the user against the stored OTP.
     */
    public boolean verifyOTP(String phoneNumber, String userOtp) {
        boolean isValid = userOtp != null && userOtp.equals(otpStorage.get(phoneNumber));
        if (isValid) {
            otpStorage.remove(phoneNumber); // Clear after successful use
        }
        return isValid;
    }

    public User registerUser(User user) {

        if (user.getUserId() == null || user.getUserId().trim().isEmpty()) {
            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM").format(java.time.LocalDateTime.now());
            String customId = "USR" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
            user.setUserId(customId);
        }
        return userRepository.save(user);
    }

    public Optional<User> findByPhone(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }
}