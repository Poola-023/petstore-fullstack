package com.example.petstore.controller;

import com.example.petstore.Service.AddressService;
import com.example.petstore.model.UserAddress;
import com.example.petstore.repository.AddressRepository;
import com.example.petstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    /*@PostMapping("/save/{userId}")
    public ResponseEntity<?> saveAddress(@PathVariable Long userId, @RequestBody UserAddress address) {
        return userRepository.findById(userId).map(user -> {
            UserAddress saved = addressService.saveOrUpdateAddress(userId, address);
            return ResponseEntity.ok((Object) saved);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not found."));
    }*/

    /*@PostMapping("/save/{userId}")
    public ResponseEntity<?> saveAddress(@PathVariable String userId, @RequestBody UserAddress address) {

        // ✨ Generate Custom ID: ADR + YYYYMM + Random 6 digits
        if (address.getAddressId() == null || address.getAddressId().trim().isEmpty()) {
            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM").format(java.time.LocalDateTime.now());
            String customId = "ADR" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));
            address.setAddressId(customId);
        }
        address.setUserId(userId);

        UserAddress savedAddress = addressRepository.save(address);
        return ResponseEntity.ok(savedAddress);
    }*/
    @PostMapping("/save/{userId}")
    public ResponseEntity<?> saveAddress(@PathVariable String userId, @RequestBody UserAddress address) {

        // 1. IF NEW ADDRESS: Generate ID and Save
        if (address.getAddressId() == null || address.getAddressId().trim().isEmpty()) {
            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM").format(java.time.LocalDateTime.now());
            String customId = "ADR" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));

            address.setAddressId(customId);
            address.setUserId(userId);

            UserAddress savedAddress = addressRepository.save(address);
            return ResponseEntity.ok(savedAddress);
        }

        // 2. IF EXISTING ADDRESS: Safely update only the form fields
        else {
            return addressRepository.findById(address.getAddressId()).map(existing -> {
                // Map only the fields the user can edit on the frontend.
                // This protects your begin_date and created_at from being erased!
                existing.setFullName(address.getFullName());
                existing.setMobile(address.getMobile());
                existing.setAltMobile(address.getAltMobile());
                existing.setHouseDetails(address.getHouseDetails());
                existing.setAreaLocality(address.getAreaLocality());
                existing.setPincode(address.getPincode());
                existing.setCity(address.getCity());
                existing.setAddressType(address.getAddressType());

                // Saving the existing entity triggers the @UpdateTimestamp automatically
                UserAddress updatedAddress = addressRepository.save(existing);
                return ResponseEntity.ok(updatedAddress);
            }).orElse(ResponseEntity.notFound().build());
        }
    }

    /*@GetMapping("/fetch/{userId}")
    public ResponseEntity<List<UserAddress>> fetchAddresses(@PathVariable String userId) {
        List<UserAddress> list = addressService.getAddressesByUserId(userId);
        return list.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(list);
    }*/
    @GetMapping("/fetch/{userId}")
    public ResponseEntity<Page<UserAddress>> fetchAddresses(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "false") boolean showAll) {

        Page<UserAddress> addressPage = addressService.getAddressesByUserId(userId, page, size, showAll);
        return ResponseEntity.ok(addressPage);
    }

    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<?> removeAddress(@PathVariable String addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok("Address removed from boutique records.");
    }
    @Autowired
    AddressRepository addressRepository;
    @GetMapping("/fetchById/{addressId}")
    public ResponseEntity<UserAddress> getAddressById(@PathVariable String addressId) {
        // Logic to find the exact address used for the order
        return addressRepository.findById(addressId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}