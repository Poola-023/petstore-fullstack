package com.example.petstore.dto;

public class ChatMessage {
    private String senderId;
    private String senderType; // e.g., "VENDOR" or "CUSTOMER"
    private String text;
    private String timestamp;

    // Default Constructor
    public ChatMessage() {}

    // Getters and Setters
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
