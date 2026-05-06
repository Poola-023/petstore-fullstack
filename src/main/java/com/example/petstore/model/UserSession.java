package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {
    @Id
    private String id;

    private String userId; // ✨ Matches findByUserId in Repository
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime loginTime;
    private LocalDateTime lastSeen;

    @PrePersist
    public void generateId() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
        if (this.loginTime == null) this.loginTime = LocalDateTime.now();
    }
}