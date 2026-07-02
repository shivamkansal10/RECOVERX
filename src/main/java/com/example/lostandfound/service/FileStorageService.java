

package com.example.lostandfound.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.lostandfound.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path root = Paths.get("uploads");
    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret
    ) {
        // Initialize local folder to prevent legacy breaking
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            // Keep fallback but non-blocking
        }

        // Initialize Cloudinary if credentials are provided; otherwise fallback to null
        if (cloudName != null && !cloudName.isEmpty() &&
            apiKey != null && !apiKey.isEmpty() &&
            apiSecret != null && !apiSecret.isEmpty()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
            ));
        } else {
            this.cloudinary = null;
        }
    }

    public String save(MultipartFile file) {
        try {
            if (file.isEmpty()) throw new FileStorageException("File is empty.");

            // If Cloudinary is configured, upload to Cloudinary and return the secure CDN URL
            if (this.cloudinary != null) {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl == null) {
                    throw new FileStorageException("Cloudinary upload failed (secureUrl was null)");
                }
                return secureUrl;
            }

            // Fallback: Local filesystem storage (useful for local development testing)
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new FileStorageException("Could not store file. Please try again!", e);
        }
    }
}