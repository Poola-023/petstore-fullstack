package com.example.petstore.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_bookings")
@Data
public class ServiceBooking {
    @Id
    private String id; // UUID String

    private String userId;
    private String petId;
    private String serviceType; // e.g., "Full Grooming", "Vaccination", "Behavioral Training"
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    private LocalDateTime appointmentTime;
    private Double price;
    private String notes;

    @PrePersist
    public void setup() {
        this.id = java.util.UUID.randomUUID().toString();
        this.status = "PENDING";
    }
}