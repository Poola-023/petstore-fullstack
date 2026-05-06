package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data; // ✨ Don't forget Lombok!
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pet_journal")
@Data // ✨ CRITICAL: Adds getters, setters, and toString()
public class PetJournalEntry {
    @Id
    private String id;

    private String petId;
    private String userId;
    private String title;

    @Column(columnDefinition = "TEXT") // ✨ Allows for longer descriptions
    private String description;

    // ✨ BIG FIX: Use LONGTEXT if you are sending Base64 images from React
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image; // Changed to 'image' to match your React payload

    private Double weight;
    private LocalDateTime entryDate;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.entryDate == null) {
            this.entryDate = LocalDateTime.now();
        }
    }
}