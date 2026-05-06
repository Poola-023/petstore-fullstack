package com.example.petstore.controller;

import com.example.petstore.model.Invoice;
import com.example.petstore.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Invoice>> getUserInvoices(@PathVariable String userId) {
        List<Invoice> invoices = invoiceRepository.findByUserIdOrderByIssuedDateDesc(userId);

        // ✨ FIX: Ensure we always return a list, even if empty.
        if (invoices == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        return ResponseEntity.ok(invoices);
    }
}
