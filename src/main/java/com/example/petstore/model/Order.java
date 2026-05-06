package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_orders")
public class Order {
    @Id
    private String id;
    @Column(name = "user_id", nullable = false) // Maps to MySQL user_id
    private String userId;
    @Column(name = "vendor_id", nullable = false)
    private String vendorId;
    @Column(name = "pet_names") // Maps to MySQL pet_names
    private String petNames;
    @Column(name = "total_amount") // Maps to MySQL total_amount
    private Double totalAmount;

    @Column(name = "payment_status")
    private String paymentStatus = "PENDING"; // Default from your Razorpay success
    @Column(name = "order_status")
    private String orderStatus = "In Process";
    @Column(name = "transaction_id")
    private String transactionId; // To store the 12-digit UPI Ref
    @Column(name = "order_date") // Maps to MySQL order_date
    private LocalDateTime orderDate ;
    @Column(name = "petId")
    private String petId;
    @Column(name = "payment_method")
    private String paymentMethod; // UPI, CARD, or COD
    @JsonProperty("addressId")
    @Column(name = "address_id")
    private String addressId;
    @Column(name = "pet_gender")
    private String petGender;
    // GETTERS AND SETTERS (Ensure these use the standard names)


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getVendorId() {
        return vendorId;
    }

    public void setVendorId(String vendorId) {
        this.vendorId = vendorId;
    }

    public String getPetNames() {
        return petNames;
    }

    public void setPetNames(String petNames) {
        this.petNames = petNames;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getPetId() {
        return petId;
    }

    public void setPetId(String petId) {
        this.petId = petId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getAddressId() {
        return addressId;
    }

    public void setAddressId(String addressId) {
        this.addressId = addressId;
    }

    public String getPetGender() {
        return petGender;
    }

    public void setPetGender(String petGender) {
        this.petGender = petGender;
    }
}