package com.example.lostandfound.service;

import com.example.lostandfound.entity.User;
import com.example.lostandfound.entity.Item;
import com.example.lostandfound.entity.Notification; // Import your new Entity
import com.example.lostandfound.repository.NotificationRepository; // Import your Repository
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:shivamkansal1000@gmail.com}")
    private String brevoSenderEmail;

    @Value("${brevo.sender.name:RecoverX Lost and Found}")
    private String brevoSenderName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

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

        if (brevoApiKey == null || brevoApiKey.trim().isEmpty() || brevoApiKey.contains("YOUR_API_KEY")) {
            log.warn("Brevo API key is not configured. Email to {} not sent via HTTP. (Saved to DB only)", to);
            return;
        }

        try {
            // Build Brevo payload Map
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", brevoSenderName, "email", brevoSenderEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", text
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email successfully sent via Brevo to: {}. Response code: {}", to, response.statusCode());
            } else {
                log.error("Failed to send email via Brevo. Status: {}, Body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error occurred while sending email via Brevo to {}: {}", to, e.getMessage(), e);
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