package com.example.petstore.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "story_cheers")
@Data
public class StoryCheer {
    @Id
    private String id;

    private String userId;
    private String storyId;

    private LocalDateTime cheeredAt;

    @PrePersist
    public void setup() {
        this.id = UUID.randomUUID().toString();
        this.cheeredAt = LocalDateTime.now();
    }
}