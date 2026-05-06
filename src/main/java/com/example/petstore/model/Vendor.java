package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "vendors")
public class Vendor {
    @Id
    @Column(name = "id")
    private String id;
    private String username;
    @Column(name = "phone_number", unique = true)
    private String phoneNumber;
    @Column(name = "store_name")
    private String storeName;
    private String email;
    private String address;
    @Column(name = "upi_id")
    private String upiId;
    @Transient // Not saved in DB, just for verification
    private String otp;
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] banner; // For the soulful profile cover
    @Lob
    @Column(name = "store_img", columnDefinition = "LONGTEXT")
    private String storeImg;
    @Column(columnDefinition = "TEXT")
    private String bio;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public byte[] getBanner() {
        return banner;
    }

    public void setBanner(byte[] banner) {
        this.banner = banner;
    }

    public String getStoreImg() {
        return storeImg;
    }

    public void setStoreImg(String storeImg) {
        this.storeImg = storeImg;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}