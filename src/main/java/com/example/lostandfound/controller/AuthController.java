package com.example.lostandfound.controller;


import com.example.lostandfound.dto.LoginRequest;
import com.example.lostandfound.dto.RegisterRequest;
import com.example.lostandfound.entity.User;
import com.example.lostandfound.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {


    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        // Pass the JSON data to the service.
        // If the email is a duplicate, the GlobalExceptionHandler catches it automatically!
        User registeredUser = authService.register(request);

        // If successful, return the new user with a 201 Created status
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        // Call the service to get the token
        String token = authService.login(request);

        // Put the token in a nice JSON map
        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        // Return it with a 200 OK status
        return ResponseEntity.ok(response);
    }
}
