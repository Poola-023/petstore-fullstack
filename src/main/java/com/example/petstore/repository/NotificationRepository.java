package com.example.petstore.repository;

import com.example.petstore.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    /**
     * ✨ FETCH RECENT NOTIFICATIONS
     * Gets the latest 20 notifications for a specific user, newest first.
     */
    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * ✨ COUNT UNREAD
     * Used for the Navbar bell icon badge (e.g., showing "3" new alerts).
     */
    long countByUserIdAndIsReadFalse(String userId);

    /**
     * ✨ MARK ALL AS READ
     * A "Clear All" or "Mark All Read" feature for the user.
     */
    @Transactional
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId")
    void markAllAsReadByUserId(String userId);
}