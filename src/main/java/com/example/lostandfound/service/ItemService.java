package com.example.lostandfound.service;

import com.example.lostandfound.dto.ItemRequest;
import com.example.lostandfound.dto.ItemResponse;
import com.example.lostandfound.entity.Item;
import com.example.lostandfound.entity.ItemStatus;
import com.example.lostandfound.entity.User;
import com.example.lostandfound.exception.ResourceNotFoundException;
import com.example.lostandfound.exception.UnauthorizedException;
import com.example.lostandfound.repository.ItemRepository;
import com.example.lostandfound.specification.ItemSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final NotificationService notificationService; // Integrated for Phase 10

    // --- Search & Filtering ---
    public Page<ItemResponse> getItems(String category, String status, Pageable pageable) {
        Specification<Item> spec = Specification.where(ItemSpecification.hasCategory(category))
                .and(ItemSpecification.hasStatus(status));
        return itemRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    // --- Create ---
    public ItemResponse createItem(ItemRequest request, User user) {
        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setStatus(ItemStatus.valueOf(request.getStatus().toUpperCase()));
        item.setUser(user);
        item.setCreatedAt(LocalDateTime.now());

        return mapToResponse(itemRepository.save(item));
    }

    // --- Get My Items (User Dashboard) ---
    public Page<ItemResponse> getMyItems(User user, Pageable pageable) {
        return itemRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    // --- Update Image (with security) ---
    @Transactional
    public void updateItemImage(Long id, String filename, User user) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this item.");
        }

        item.setImageUrl(filename);
        itemRepository.save(item);
    }

    // --- Admin: Flagging ---
    // --- Admin: Flagging ---
    @Transactional
    public void flagItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        item.setStatus(ItemStatus.UNDER_REVIEW);
        itemRepository.save(item);

        notificationService.sendUnderReviewNotification(item.getUser(), item);
    }

    // --- Admin: Confirm Match ---
    @Transactional
    public void confirmMatch(Long lostId, Long foundId) {
        Item lostItem = itemRepository.findById(lostId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found"));
        Item foundItem = itemRepository.findById(foundId)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found"));

        lostItem.setStatus(ItemStatus.MATCHED);
        foundItem.setStatus(ItemStatus.MATCHED);

        itemRepository.saveAll(List.of(lostItem, foundItem));

        // Automated Notification
        notificationService.sendMatchNotification(
                lostItem.getUser(),
                foundItem.getUser(),
                lostItem,
                foundItem
        );
    }

    // --- Get by ID ---
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        return mapToResponse(item);
    }

    // --- Delete (with security) ---
    @Transactional
    public void deleteItem(Long id, User user) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this item.");
        }
        itemRepository.delete(item);
    }

    // --- Mapper ---
    private ItemResponse mapToResponse(Item item) {
        String imageUrl = item.getImageUrl();
        if (imageUrl != null && !imageUrl.startsWith("http")) {
            imageUrl = "/api/items/images/" + imageUrl;
        }
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .status(item.getStatus().toString())
                .createdAt(item.getCreatedAt())
                .reporterName(item.getUser().getFullName())
                .reporterId(item.getUser().getId())
                .imageUrl(imageUrl)
                .build();
    }
}