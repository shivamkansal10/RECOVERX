package com.example.lostandfound.controller;

import com.example.lostandfound.entity.User;
import com.example.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get current profile
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    // Update Name and Phone
    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@AuthenticationPrincipal User user,
                                                @RequestBody Map<String, String> updates) {
        userService.updateProfile(user, updates.get("fullName"), updates.get("phoneNumber"));
        return ResponseEntity.ok("Profile updated successfully.");
    }

    // Change Password
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@AuthenticationPrincipal User user,
                                                 @RequestBody Map<String, String> passwords) {
        userService.changePassword(user, passwords.get("oldPassword"), passwords.get("newPassword"));
        return ResponseEntity.ok("Password updated successfully.");
    }
}