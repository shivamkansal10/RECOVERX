package com.example.lostandfound;

import com.example.lostandfound.repository.PasswordResetTokenRepository;
import com.example.lostandfound.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LostandfoundApplicationTests {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private AuthService authService;

    @Test
    void testMailSending() {
        System.out.println("TESTING MAIL SENDING - CLEARING TOKENS...");
        tokenRepository.deleteAll();
        System.out.println("TOKENS CLEARED. SENDING EMAIL...");
        try {
            authService.sendResetToken("shivamkansal1000@gmail.com");
            System.out.println("MAIL SEND STEP EXECUTED SUCCESSFULLY.");
        } catch (Exception e) {
            System.out.println("MAIL SEND TRIGGER CRASHED: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
