package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Data
public class Pet {

    @Id
    private String id;

    @Column(name = "vendor_id")
    private String vendorId;

    private String category;

    private String breed;

    // ✨ FIX: Ensures it maps to your 'color' DB column
    @Column(name = "color")
    private String color;

    private String dob;

    private Double price;

    private String quantity;

    @Column(name = "male_quantity")
    private String maleQuantity;

    @Column(name = "female_quantity")
    private String femaleQuantity;

    // Notice how these match the camelCase in your screenshot!
    @Column(name = "isVaccinated")
    private String isVaccinated;

    @Column(name = "vaccinationDose")
    private String vaccinationDose;

    // ✨ FIX: Changed back from 'bio' to 'description'
    @Column(columnDefinition = "TEXT", name = "description")
    private String description;

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] image;

    @Transient
    private String vendorName;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<PetImage> images = new ArrayList<>();

    @Column(name = "discount_percentage")
    private Integer discountPercentage = 0; // Default to 0%
}