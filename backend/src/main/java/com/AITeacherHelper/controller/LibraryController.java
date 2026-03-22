package com.AITeacherHelper.controller;

import com.AITeacherHelper.dto.response.ApiResponse;
import com.AITeacherHelper.model.LibraryItem;
import com.AITeacherHelper.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    public record SaveToLibraryRequest(String assignmentId, String customTitle) {}

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<LibraryItem>> saveToLibrary(
            @RequestBody SaveToLibraryRequest request,
            Authentication authentication) {
        LibraryItem saved = libraryService.saveAssignmentToLibrary(request.assignmentId(), request.customTitle(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(saved, "Saved to library successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LibraryItem>>> getMyLibrary(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(libraryService.getTeacherLibrary(authentication.getName()), "Library retrieved"));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteLibraryItem(
            @PathVariable String itemId,
            Authentication authentication) {
        libraryService.deleteFromLibrary(itemId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Item deleted from library"));
    }
}
