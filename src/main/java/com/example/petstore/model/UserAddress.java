package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses")
@Data
public class UserAddress {

    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    @JsonIgnore
    private String addressId;

    @Column(name = "user_id") // Hibernate will automatically link to User's Primary Key
    private String userId;
    @Column(name = "full_name")
    private String fullName;
    private String mobile;
    @Column(name = "alt_mobile")
    private String altMobile;
    @Column(name = "house_details")
    private String houseDetails;
    @Column(name = "area_locality")
    private String areaLocality;
    @Column(name = "pincode")
    private String pincode;
    @Column(name = "city")
    private String city = "Hyderabad"; //
    @Column(name = "address_type")
    private String addressType;

    @Column(name = "begin_date", updatable = false)
    private LocalDate beginDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Hibernate will auto-fill this on creation and NEVER let it update
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Hibernate will auto-update this every time the row changes
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.beginDate == null) {
            this.beginDate = LocalDate.now(); // Sets to today's date
        }
        if (this.endDate == null) {
            this.endDate = LocalDate.of(9999, 12, 31); // Sets to 31-Dec-9999
        }
    }
}
