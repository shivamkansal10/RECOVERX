package com.example.lostandfound.controller;

import com.example.lostandfound.entity.User;
import com.example.lostandfound.service.AdminService;
import com.example.lostandfound.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ItemService itemService;

    // Get all users for the dashboard user management table
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Admin can delete any item that is flagged or inappropriate
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/items/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        adminService.deleteAnyItem(id);
        return ResponseEntity.ok("Item successfully deleted by Administrator.");
    }

    // Admin can manually flag or update status if needed
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/items/{id}/flag")
    public ResponseEntity<String> flagItem(@PathVariable Long id) {
        itemService.flagItem(id); // routes through ItemService -> NotificationService
        return ResponseEntity.ok("Item marked as under review.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/confirm-match")
    public ResponseEntity<String> confirmMatch(@RequestParam Long lostId,
                                               @RequestParam Long foundId) {
        itemService.confirmMatch(lostId, foundId);
        return ResponseEntity.ok("Match confirmed, emails sent to both parties.");
    }
}
