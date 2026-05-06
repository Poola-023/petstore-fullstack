package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cart_items")
@Data
public class CartItem {
    @Id
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "pet_id")
    private String petId;

    @Column(name = "selected_gender")
    private String selectedGender;
}