package com.AITeacherHelper.controller;

import com.AITeacherHelper.dto.request.LoginRequest;
import com.AITeacherHelper.dto.request.SignupRequest;
import com.AITeacherHelper.dto.response.ApiResponse;
import com.AITeacherHelper.dto.response.JwtResponse;
import com.AITeacherHelper.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(jwtResponse, "Login successful"));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.registerUser(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success(null, "User registered successfully!"));
    }
}
