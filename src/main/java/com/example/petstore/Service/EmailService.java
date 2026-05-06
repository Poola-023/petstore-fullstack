package com.example.petstore.Service;

import com.example.petstore.model.Order;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender; // Core Spring Boot interface for sending emails

    /**
     * Sends a plain text email containing the OTP.
     * @param toEmail The vendor's email address.
     * @param otp The 4-digit generated code.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ushapetstore@gmail.com"); // Matches your properties username
            message.setTo(toEmail);
            message.setSubject("Pet&Connect - Vendor OTP Verification");
            message.setText("Your one-time password (OTP) is: " + otp +
                    "\n\nThis code is valid for 5 minutes. Do not share it with anyone.");

            mailSender.send(message); // Triggers the SMTP delivery
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Error while sending email: " + e.getMessage());
            // Log the error but don't stop the app from running
        }
    }
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }


    public void sendVendorOrderNotification(String vendorEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("ushapetstore@gmail.com");
            helper.setTo(vendorEmail);

            // ✨ Clean, urgent subject line
            helper.setSubject("New Order Alert: Id #" + order.getId());

            String htmlContent =
                    "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 40px 20px; color: #111111;'>" +

                            // Brand Header
                            "<div style='margin-bottom: 40px;'>" +
                            "<h2 style='font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -1px;'>" +
                            "Pet <span style='color: #FF9900;'>&</span> Connect" +
                            "</h2>" +
                            "</div>" +

                            // Notification Text
                            "<div style='margin-bottom: 30px;'>" +
                            "<p style='font-size: 16px; line-height: 1.5; margin: 0;'>Hello Partner, a new adoption request has been placed for your boutique.</p>" +
                            "</div>" +

                            // ✨ Highlighted Order Box (Matching OTP style)
                            "<div style='background-color: #f2f2f2; border-radius: 12px; padding: 30px; text-align: left; margin-bottom: 30px;'>" +
                            "<p style='margin: 0 0 10px 0; font-size: 13px; color: #666666; font-weight: 700; text-transform: uppercase;'>Order Details</p>" +
                            "<h3 style='font-size: 20px; margin: 0 0 15px 0; color: #131921;'>" + order.getPetNames().toUpperCase() + "</h3>" +

                            "<div style='border-top: 1px solid #e5e5e5; padding-top: 15px;'>" +
                            "<p style='margin: 5px 0; font-size: 15px;'><strong>UTR/Ref ID:</strong> " + order.getTransactionId() + "</p>" +
                            "<p style='margin: 5px 0; font-size: 15px;'><strong>Amount:</strong> ₹" + order.getTotalAmount() + "</p>" +
                            "</div>" +
                            "</div>" +

                            // Verification Instruction
                            "<div style='margin-bottom: 50px;'>" +
                            "<p style='font-size: 15px; color: #444444; line-height: 1.6;'>" +
                            "Please verify the UTR in your business bank account. Once confirmed, log in to your dashboard to mark this order as <strong>'Confirmed'</strong>." +
                            "</p>" +
                            "</div>" +

                            // Team Sign-off
                            "<div style='margin-bottom: 40px; font-size: 15px; color: #111111;'>" +
                            "Best,<br/>" +
                            "The Pet & Connect team" +
                            "</div>" +

                            // Footer
                            "<div style='border-top: 1px solid #e5e5e5; padding-top: 30px;'>" +
                            "<h3 style='font-size: 20px; font-weight: 700; margin: 0 0 15px 0;'>Pet & Connect Partner</h3>" +
                            "<p style='font-size: 13px; color: #666666; margin: 5px 0;'>Boutique Support Hub</p>" +
                            "</div>" +

                            "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("LOG -> Order notification sent to vendor: " + vendorEmail);
        } catch (Exception e) {
            System.err.println("SMTP ERROR -> " + e.getMessage());
        }
    }

    @Async
    public void sendLoginNotification(String toEmail, String username, String device, String location) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("🛡️ New Login Alert: Pet & Connect");

        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        String body = String.format(
                "Hello %s,\n\n" +
                        "Your Pet & Connect account was recently accessed from a new device.\n\n" +
                        "📍 Device: %s\n" +
                        "⏰ Time: %s\n" +
                        "🌎 Location: %s\n\n" +
                        "If this wasn't you, please reset your password immediately.",
                username, device, time, location
        );

        message.setText(body);
        mailSender.send(message);
    }

}