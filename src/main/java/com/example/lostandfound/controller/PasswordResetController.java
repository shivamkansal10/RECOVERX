
package com.example.lostandfound.controller;

import com.example.lostandfound.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final AuthService authService;

    // 1. User enters email to request a reset
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.sendResetToken(email);
        return ResponseEntity.ok("If an account exists, a reset link has been sent.");
    }

    // 2. User submits new password with the token received in email
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestBody String newPassword) {
        authService.processPasswordReset(token, newPassword);
        return ResponseEntity.ok("Password successfully updated.");
    }
}