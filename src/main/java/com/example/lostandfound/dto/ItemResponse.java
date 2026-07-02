package com.example.lostandfound.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ItemResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private LocalDateTime createdAt;
    private String reporterName;
    private Long reporterId;

    // ADD THIS FIELD
    private String imageUrl;
}
