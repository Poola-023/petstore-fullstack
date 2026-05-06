package com.example.petstore.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    private String id; // UUID String

    private String userId;
    private String title;
    private String message;
    private String type; // e.g., "SERVICE", "ORDER", "COMMUNITY"
    private boolean isRead = false;
    private LocalDateTime createdAt;

    @PrePersist
    public void setup() {
        this.id = java.util.UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }
}
