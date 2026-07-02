package com.example.lostandfound.dto;

import com.example.lostandfound.entity.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String jwt;
    private User user; // In a production app, we'd make a UserDto here too, but this is fine for v1

    public AuthResponse(String jwt, User user) {
        this.jwt = jwt;
        this.user = user;
    }

}
