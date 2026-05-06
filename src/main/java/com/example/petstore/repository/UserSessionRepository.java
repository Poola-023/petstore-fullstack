package com.example.petstore.repository;

import com.example.petstore.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    // ✨ Finds all sessions for a user, newest first
    List<UserSession> findByUserIdOrderByLoginTimeDesc(String userId);

    Optional<UserSession> findByUserIdAndDeviceInfo(String userId, String deviceInfo);
}