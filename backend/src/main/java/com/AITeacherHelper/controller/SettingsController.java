package com.AITeacherHelper.controller;

import com.AITeacherHelper.dto.response.ApiResponse;
import com.AITeacherHelper.model.User;
import com.AITeacherHelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserRepository userRepository;

    public record UpdateProfileRequest(String name, String institution) {}

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(null); // Never expose password
        return ResponseEntity.ok(ApiResponse.success(user, "Profile retrieved"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.name());
        user.setInstitution(request.institution());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success(user, "Profile updated successfully"));
    }
}
