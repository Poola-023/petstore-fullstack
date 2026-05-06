package com.example.petstore.repository;

import com.example.petstore.model.UserAddress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<UserAddress, String> {
    // Standard JPA naming convention based on your userId field
    List<UserAddress> findByUserId(String userId);
    Page<UserAddress> findByUserId(String userId, Pageable pageable);

    Page<UserAddress> findByUserIdOrderByUpdatedAtDesc(String userId, Pageable pageable);

    // Used when showAll = false (Default)
    UserAddress findTopByUserIdOrderByUpdatedAtDesc(String userId);
}