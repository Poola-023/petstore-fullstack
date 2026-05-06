package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
public class Invoice {
    @Id
    private String id; // UUID String (e.g., INV-2026-XXXX)

    private String userId;
    private String relatedId; // Can be OrderId or ServiceBookingId
    private String itemType; // "ADOPTION" or "SERVICE"

    private Double amount;
    private Double tax;
    private Double total;

    private LocalDateTime issuedDate;

    @PrePersist
    public void setup() {
        this.id = "INV-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.issuedDate = LocalDateTime.now();
    }
}
