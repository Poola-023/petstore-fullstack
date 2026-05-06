package com.example.petstore.dto;

import lombok.Data;

@Data
public class CategoryDiscountRequest {
    private String vendorId;
    private String category;
    private Integer discountPercentage;
}