package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "promo_banners")
@Data
public class PromoBanner {

    @Id
    private String id;

    @Column(name = "vendor_id")
    private String vendorId;

    private Integer discount;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] image;

    // ✨ MUST HAVE THIS FOR CREATION TIMESTAMP
    @Column(name = "G_AUG_ADD_TS", updatable = false)
    private LocalDateTime createdDate;

    // ✨ MUST HAVE THIS FOR UPDATE TIMESTAMP
    @Column(name = "G_AUD_TS")
    private LocalDateTime updatedDate;

    // ✨ THIS METHOD IS CRITICAL: It runs right before saving a NEW ad
    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    // ✨ THIS METHOD IS CRITICAL: It runs right before UPDATING an existing ad
    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}