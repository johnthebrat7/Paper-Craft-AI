package com.AITeacherHelper.service;

import com.AITeacherHelper.dto.request.LoginRequest;
import com.AITeacherHelper.dto.request.SignupRequest;
import com.AITeacherHelper.dto.response.JwtResponse;
import com.AITeacherHelper.model.User;
import com.AITeacherHelper.repository.UserRepository;
import com.AITeacherHelper.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        // Fetch full user for name/institution
        User user = userRepository.findByEmail(userPrincipal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt, user.getEmail(), user.getName(), user.getInstitution(), roles);
    }

    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.email())) {
            throw new RuntimeException("Email is already in use!");
        }
        User user = User.builder()
                .name(signUpRequest.name())
                .email(signUpRequest.email())
                .password(encoder.encode(signUpRequest.password()))
                .institution(signUpRequest.institution())
                .roles(List.of("ROLE_USER"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
    }
}
