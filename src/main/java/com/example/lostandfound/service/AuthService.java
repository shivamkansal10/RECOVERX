package com.example.lostandfound.service;

import com.example.lostandfound.dto.LoginRequest;
import com.example.lostandfound.dto.RegisterRequest;
import com.example.lostandfound.entity.User;
import com.example.lostandfound.exception.InvalidCredentialsException;
import com.example.lostandfound.exception.ResourceNotFoundException;
import com.example.lostandfound.exception.UserAlreadyExistsException;
import com.example.lostandfound.repository.PasswordResetTokenRepository;
import com.example.lostandfound.repository.UserRepository;
import com.example.lostandfound.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.lostandfound.entity.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final PasswordResetTokenRepository tokenRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public User register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new UserAlreadyExistsException("Email is already in use");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmail().equalsIgnoreCase("shivamkansal1000@gmail.com")) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.STUDENT);
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }
    @Transactional
    public void sendResetToken(String email) {
        userRepository.findAll().forEach(u -> System.out.println("USER IN DB: " + u.getEmail()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete existing token if it exists to avoid unique constraint violations
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(resetToken);

        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        notificationService.sendNotification(email, "Password Reset Request",
                "Click here to reset your password: " + resetUrl, user);
    }

    public String login(LoginRequest request) {
        // Step A: Find the user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Step B: Check if the raw password matches the scrambled database password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Step C: If passwords match, print and return the digital keycard (JWT)
        return jwtUtil.generateToken(user);
    }
    @Transactional
    public void processPasswordReset(String token, String newPassword) {
        // 1. Find the token in DB
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or non-existent token"));

        // 2. Check if expired
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        // 3. Update the user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Delete the token so it can't be reused
        tokenRepository.delete(resetToken);
    }

    // ... your other methods (register, login, sendResetToken)
}
