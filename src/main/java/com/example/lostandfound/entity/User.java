package com.example.lostandfound.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@Table(name="users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(nullable = false, unique = true) // This field cannot be null, and no two users can have the same email
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column
    private String phoneNumber;

    @Enumerated(EnumType.STRING) // Saves the Enum as a readable string ("STUDENT" or "ADMIN") instead of an integer
    @Column(nullable = false)
    private Role role;

    @CreationTimestamp // Automatically sets the exact timestamp when the user registers
    private Instant createdAt;

    public enum Role { STUDENT, ADMIN }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // This tells Spring Security what permissions this user has (e.g., ROLE_STUDENT)
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        // Spring Security usually looks for a "username", so we tell it to use "email" instead
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Return true so the account is active
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Return true so the account isn't locked
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}


