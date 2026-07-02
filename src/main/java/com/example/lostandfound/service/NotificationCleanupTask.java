
package com.example.lostandfound.service;

import com.example.lostandfound.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationCleanupTask {

    private final NotificationRepository notificationRepository;

    // Runs every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        int deletedCount = notificationRepository.deleteByCreatedAtBefore(thirtyDaysAgo);
        log.info("Cleanup Task: Deleted {} notifications older than 30 days.", deletedCount);
    }
}