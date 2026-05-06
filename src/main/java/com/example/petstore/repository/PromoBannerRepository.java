package com.example.petstore.repository;

import com.example.petstore.model.PromoBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromoBannerRepository extends JpaRepository<PromoBanner, String> {

    // Custom method to fetch all promos created by a specific vendor
    List<PromoBanner> findByVendorId(String vendorId);
}