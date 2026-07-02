package com.example.lostandfound.service;

import com.example.lostandfound.entity.User;
import com.example.lostandfound.entity.Item;
import com.example.lostandfound.entity.Notification; // Import your new Entity
import com.example.lostandfound.repository.NotificationRepository; // Import your Repository
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository; // NEW: Injected

    @Value("${spring.mail.username}")
    private String fromAddress;

    // Helper: Saves notification to DB for the UI
    @Transactional
    public void saveNotification(User user, String messageContent) {
        Notification notification = Notification.builder()
                .user(user)
                .message(messageContent)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void sendNotification(String to, String subject, String text, User user) {
        log.info("Attempting to send email to: {}", to);
        // Save to DB first so it always shows up in the web UI
        try {
            saveNotification(user, text);
        } catch (Exception e) {
            log.error("Failed to save notification to DB for user {}: {}", to, e.getMessage());
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(fromAddress);

            mailSender.send(message);
            log.info("Email successfully sent for: {}", to);
        } catch (MailException e) {
            log.error("EMAIL FAILED for {}: {}", to, e.getMessage(), e);
        }
    }

    // Scenario 1: Admin Flags Item
    public void sendUnderReviewNotification(User user, Item item) {
        String subject = "Action Required: Item Status Update";
        String text = "Hello " + user.getFullName() + ",\n\n" +
                "Your item '" + item.getTitle() + "' has been flagged for review.";
        sendNotification(user.getEmail(), subject, text, user);
    }

    // Scenario 2: Orchestration for Match
    public void sendMatchNotification(User reporter, User finder, Item lostItem, Item foundItem) {
        String reporterText = "Hello " + reporter.getFullName() + ",\n\n" +
                "A match has been found! Contact the finder:\n" + finder.getFullName() +
                "\nEmail: " + finder.getEmail();
        sendNotification(reporter.getEmail(), "Match Found!", reporterText, reporter);

        String finderText = "Hello " + finder.getFullName() + ",\n\n" +
                "Match found! Contact the owner:\n" + reporter.getFullName() +
                "\nEmail: " + reporter.getEmail();
        sendNotification(finder.getEmail(), "Match Found!", finderText, finder);
    }
}