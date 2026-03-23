package com.AITeacherHelper.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/toolkit")
@RequiredArgsConstructor
public class AIToolkitController {

    private final ChatClient chatClient;

    public record ToolkitRequest(String prompt) {}

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generate(@RequestBody ToolkitRequest request) {
        if (request.prompt() == null || request.prompt().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt cannot be empty"));
        }

        String systemPrompt = """
                You are an expert teacher's assistant. Help teachers by generating:
                - Quiz questions and assessments
                - Lesson plans and study guides
                - Rubrics and marking criteria
                - Practice problems and worksheets
                Be concise, academic, and well-structured in your response.
                """;

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(request.prompt())
                .call()
                .content();

        return ResponseEntity.ok(Map.of("response", response));
    }
}
