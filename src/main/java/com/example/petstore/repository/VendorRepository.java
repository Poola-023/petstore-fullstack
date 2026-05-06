package com.example.petstore.repository;

import com.example.petstore.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, String> {

    /**
     * Finds a vendor by their phone number for OTP verification.
     * Spring will automatically generate: SELECT * FROM vendors WHERE phone_number = ?
     */
    Optional<Vendor> findByPhoneNumber(String phoneNumber);

    /**
     * Optional: Check if a vendor already exists with this email during signup.
     */
    Vendor findByEmail(String email);
}
