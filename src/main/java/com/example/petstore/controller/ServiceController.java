package com.example.petstore.controller;

import com.example.petstore.model.Invoice;
import com.example.petstore.model.Notification;
import com.example.petstore.model.ServiceBooking;
import com.example.petstore.repository.InvoiceRepository;
import com.example.petstore.repository.NotificationRepository;
import com.example.petstore.repository.ServiceBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceBookingRepository bookingRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;
    /**
     * ✨ CREATE A NEW BOOKING
     * POST http://localhost:8090/api/services/book
     */
    @PostMapping("/book")
    public ResponseEntity<?> bookService(@RequestBody ServiceBooking booking) {
        try {
            ServiceBooking saved = bookingRepository.save(booking);

            // ✨ NEW: Trigger a notification for the user
            Notification notification = new Notification();
            notification.setUserId(saved.getUserId());
            notification.setTitle("📅 Booking Received!");
            notification.setMessage("Your request for " + saved.getServiceType() + " is under review.");
            notification.setType("SERVICE");
            notificationRepository.save(notification);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * ✨ FETCH USER APPOINTMENTS
     * GET http://localhost:8090/api/services/my-appointments/{userId}
     */
    @GetMapping("/my-appointments/{userId}")
    public ResponseEntity<List<ServiceBooking>> getUserBookings(@PathVariable String userId) {
        return ResponseEntity.ok(bookingRepository.findByUserIdOrderByAppointmentTimeDesc(userId));
    }

    /**
     * ✨ CANCEL BOOKING
     */
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
            return ResponseEntity.ok("Booking cancelled successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/approve/{bookingId}")
    @Transactional
    public ResponseEntity<?> approveBooking(@PathVariable String bookingId) {
        return bookingRepository.findById(bookingId).map(booking -> {
            // 1. Update the Booking Status
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);

            // 2. Create a "Success" Notification for the Pet Owner
            Notification n = new Notification();
            n.setUserId(booking.getUserId());
            n.setTitle("✅ Appointment Confirmed!");
            n.setMessage("Your " + booking.getServiceType() + " for " +
                    booking.getAppointmentTime().toLocalDate() + " is officially scheduled.");
            n.setType("SERVICE_UPDATE");
            notificationRepository.save(n);

            Invoice inv = new Invoice();
            inv.setUserId(booking.getUserId());
            inv.setRelatedId(booking.getId());
            inv.setItemType("SERVICE");
            inv.setAmount(booking.getPrice());
            inv.setTax(booking.getPrice() * 0.18); // 18% GST for services
            inv.setTotal(inv.getAmount() + inv.getTax());
            invoiceRepository.save(inv);

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Booking approved successfully"));        }).orElse(ResponseEntity.notFound().build());
    }
    /**
     * ✨ FETCH ALL PENDING REQUESTS (For Vendors)
     * GET http://localhost:8090/api/services/all-requests
     */
    @GetMapping("/all-requests")
    public ResponseEntity<List<ServiceBooking>> getAllRequests() {
        // In a production app, you would filter by Vendor ID.
        // For now, we fetch all so you can test the logic.
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @PutMapping("/complete/{bookingId}")
    @Transactional
    public ResponseEntity<?> completeService(@PathVariable String bookingId) {
        return bookingRepository.findById(bookingId).map(booking -> {
            // 1. Final State Change
            booking.setStatus("COMPLETED");
            bookingRepository.save(booking);

            // 2. Final Pickup Notification
            Notification n = new Notification();
            n.setUserId(booking.getUserId());
            n.setTitle("✨ Service Completed!");
            n.setMessage("Your " + booking.getServiceType() + " is finished. Your companion is ready for pickup!");
            n.setType("SERVICE_FINISH");
            notificationRepository.save(n);

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Service marked as completed"));
        }).orElse(ResponseEntity.notFound().build());
    }
}