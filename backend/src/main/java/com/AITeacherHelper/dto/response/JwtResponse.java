package com.AITeacherHelper.dto.response;

import java.util.List;

public record JwtResponse(
    String token,
    String type,
    String email,
    String name,
    String institution,
    List<String> roles
) {
    public JwtResponse(String token, String email, String name, String institution, List<String> roles) {
        this(token, "Bearer", email, name, institution, roles);
    }
}
