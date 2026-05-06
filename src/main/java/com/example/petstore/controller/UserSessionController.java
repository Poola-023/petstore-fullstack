package com.example.petstore.controller;

import com.example.petstore.model.UserSession;
import com.example.petstore.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public class UserSessionController {

    @Autowired
    private UserSessionRepository sessionRepository;
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<List<UserSession>> getUserSessions(@PathVariable String userId) {
        // ✨ Critical: Sort by login time descending so the newest is first!
        List<UserSession> sessions = sessionRepository.findByUserIdOrderByLoginTimeDesc(userId);
        return ResponseEntity.ok(sessions);
    }
}
