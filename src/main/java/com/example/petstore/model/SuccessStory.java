package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "success_stories")
@Data
public class SuccessStory {
    @Id
    private String id;

    private String userId;
    private String username;
    private String petId;
    private String petName;

    @Column(columnDefinition = "TEXT")
    private String storyContent;

    // ✨ MUST use LONGTEXT for Base64 images
    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    private Integer likes = 0;
    private LocalDateTime publishedDate;

    @PrePersist
    public void setup() {
        this.id = java.util.UUID.randomUUID().toString();
        this.publishedDate = LocalDateTime.now();
    }
}