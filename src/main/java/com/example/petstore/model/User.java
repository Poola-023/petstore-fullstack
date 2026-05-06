package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @Column(name = "user_id")
    @JsonIgnore
    private String userId; // Standard numeric ID

    private String username;

    @Column(name = "phone_number", unique = true, nullable = false)
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Phone number must start with 6-9 and be exactly 10 digits long"
    )
    private String phoneNumber;

    private String email;
    private String gender; // Male, Female, Other

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob; // Date of Birth

    @Column(name = "vendor_id")
    private String vendorId;

    @Transient
    private String otp; // For verification only, not in DB

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profileImg;

    }