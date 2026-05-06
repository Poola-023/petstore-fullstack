package com.example.petstore.repository;

import com.example.petstore.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByUserIdOrderByIssuedDateDesc(String userId);
}

