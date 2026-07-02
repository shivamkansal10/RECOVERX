package com.example.lostandfound.repository;

import com.example.lostandfound.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Existing method for fetching the dashboard list
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // New method for the "Mark All as Read" feature
    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    // New method for the "30-Day Cleanup" feature
    int deleteByCreatedAtBefore(LocalDateTime date);
}
