package com.example.petstore.controller;

import com.example.petstore.Configuration.JwtUtils;
import com.example.petstore.Service.VendorService;
import com.example.petstore.model.Vendor;
import com.example.petstore.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;



@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*") // Fixes "Backend unreachable"
public class VendorController {

    @Autowired
    private VendorService vendorService;

    // STEP 1: Send OTP to the email entered in the form
    @PostMapping("/send-signup-otp")
    public ResponseEntity<String> sendSignupOtp(@RequestBody Map<String, String> req) {
        String phoneNumber = req.get("phoneNumber");
        String email = req.get("email");

        if (phoneNumber == null || email == null) {
            return ResponseEntity.badRequest().body("Phone and Email are required");
        }

        vendorService.generateOTP(phoneNumber, email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    // STEP 2: Verify OTP and Save full Vendor details
    /*@PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody Vendor vendor) {
        // Matches the @Transient otp field in your POJO
        if (vendorService.verifyOTP(vendor.getPhoneNumber(), vendor.getOtp())) {

            if (vendorService.findByPhone(vendor.getPhoneNumber()) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Phone already registered");
            }

            Vendor savedVendor = vendorService.registerVendor(vendor);
            return ResponseEntity.ok(savedVendor);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
    }*/
    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody Vendor vendor) {

        // 1. Excellent debugging log
        System.out.println("DEBUG -> Phone: " + vendor.getPhoneNumber() + " | OTP Received: " + vendor.getOtp());

        // 2. Good safety check
        if (vendor.getOtp() == null || vendor.getOtp().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP field is empty.");
        }

        // 3. Verify PIN
        if (vendorService.verifyOTP(vendor.getPhoneNumber(), vendor.getOtp())) {

            // 🚨 CRITICAL FIX: Handle Optional correctly using .isPresent()
            Optional<Vendor> existingVendor = vendorService.findByPhone(vendor.getPhoneNumber());
            if (existingVendor.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Vendor already exists.");
            }

            // ✨ NOTE: Make sure your vendorService.registerVendor() method
            // generates the custom "VND202603..." String ID before it calls .save()!
            Vendor savedVendor = vendorService.registerVendor(vendor);
            return ResponseEntity.ok(savedVendor);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP. Check your email again.");
    }
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> req) {
        String phoneNumber = req.get("phoneNumber");

        // 1. Find the vendor to get their registered email
        Vendor vendor = vendorService.findByPhone(phoneNumber).orElse(null);
        if (vendor != null) {
            // 2. Generate OTP and send to both Phone (Console) and Email
            vendorService.generateOTP(phoneNumber, vendor.getEmail());
            return ResponseEntity.ok("OTP Sent to " + vendor.getEmail());
        } else {
            // This handles cases where the phone number isn't registered yet
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Phone number not registered");
        }
    }
    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");

        // 1. Verify OTP using your service
        boolean isValid = vendorService.verifyOTP(phoneNumber, otp);

        if (isValid) {
            // 2. Find vendor (use .orElseThrow or .get() safely)
            Vendor vendor = vendorService.findByPhone(phoneNumber)
                    .orElseThrow(() -> new RuntimeException("Vendor not found after OTP match"));

            // 3. GENERATE TOKEN using the vendor's username/store name and role
            // Use vendor.getStoreName() or vendor.getEmail() as the subject
            String token = jwtUtils.generateToken(vendor.getEmail(), "VENDOR");

            // 4. Create a clean Response Map
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", vendor);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN.");
        }
    }

    @Autowired
    private VendorRepository vendorRepository;

    @GetMapping("/all")
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id) {
        return vendorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update-profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestBody Vendor updatedVendor) {
        return vendorRepository.findById(id).map(vendor -> {
            vendor.setStoreName(updatedVendor.getStoreName());
            vendor.setBio(updatedVendor.getBio());
            vendor.setAddress(updatedVendor.getAddress());
            vendor.setUpiId(updatedVendor.getUpiId());
            if(updatedVendor.getBanner() != null) vendor.setBanner(updatedVendor.getBanner());
            if(updatedVendor.getStoreImg() != null) vendor.setStoreImg(updatedVendor.getStoreImg());
            vendorRepository.save(vendor);
            return ResponseEntity.ok(vendor);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('VENDOR')")
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getVendorStats() {
        return ResponseEntity.ok("Vendor stats data...");
    }
}