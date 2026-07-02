

package com.example.lostandfound.specification;

import com.example.lostandfound.entity.Item;
import org.springframework.data.jpa.domain.Specification;

public class ItemSpecification {

    // Rule: Filter by Category (exact match)
    public static Specification<Item> hasCategory(String category) {
        return (root, query, cb) ->
                (category == null || category.isEmpty()) ? null : cb.equal(root.get("category"), category);
    }

    // Rule: Filter by Status (exact match)
    public static Specification<Item> hasStatus(String status) {
        return (root, query, cb) ->
                (status == null || status.isEmpty()) ? null : cb.equal(root.get("status"), status);
    }

    // Rule: Search by Title (partial match, case-insensitive)
    // Useful for a search bar: "find all items with 'key' in the title"
    public static Specification<Item> titleContains(String title) {
        return (root, query, cb) ->
                (title == null || title.isEmpty()) ? null : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }
}