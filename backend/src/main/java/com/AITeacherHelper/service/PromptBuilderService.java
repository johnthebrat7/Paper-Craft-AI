package com.AITeacherHelper.service;

import com.AITeacherHelper.dto.response.AiGeneratedPaper;
import com.AITeacherHelper.enums.QuestionType;
import com.AITeacherHelper.model.Assignment;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PromptBuilderService {

    private final ObjectMapper objectMapper;

    public String buildPrompt(Assignment assignment) {
        if (assignment.getRefinementInstructions() != null && !assignment.getRefinementInstructions().isBlank()) {
            return buildRefinementPrompt(assignment);
        }
        return buildInitialGenerationPrompt(assignment);
    }

    private String buildInitialGenerationPrompt(Assignment assignment) {
        int totalQuestions = assignment.getNumberOfQuestions() != null ? assignment.getNumberOfQuestions() : 10;
        int marks = assignment.getMarksPerQuestion() != null ? assignment.getMarksPerQuestion() : 5;
        int easy = Math.max(1, (int) Math.round(totalQuestions * 0.4));
        int moderate = Math.max(1, (int) Math.round(totalQuestions * 0.4));
        int hard = Math.max(0, totalQuestions - easy - moderate);

        List<QuestionType> types = assignment.getQuestionTypes() != null
                ? assignment.getQuestionTypes()
                : Collections.singletonList(QuestionType.SHORT_ANSWER);
        String questionTypesStr = types.stream().map(QuestionType::name).collect(Collectors.joining(", "));

        var outputConverter = new BeanOutputConverter<>(AiGeneratedPaper.class);
        String formatInstructions = outputConverter.getFormat();

        String templateString = """
                You are an expert academic exam paper generator.
                Generate a well-structured question paper based on the following:

                - School: {schoolName}
                - Subject: {subject}
                - Class/Grade: {standardClass}
                - Topic/Description: {description}
                - Total Questions: {totalQuestions}
                - Marks per Question: {marks}
                - Allowed Question Types: {questionTypes}
                - Additional Instructions: {instructions}

                DIFFICULTY DISTRIBUTION:
                - EASY: {easy} questions
                - MODERATE: {moderate} questions
                - HARD: {hard} questions

                GROUPING:
                - Group questions by type into sections (e.g., Section A for MCQ, Section B for Short Answer).
                - Each section must have a clear title and instruction line.
                - Each question must include questionText, questionType, difficulty, and marks.
                - Do NOT include difficulty or marks inside the question text itself.

                {formatInstructions}
                """;

        PromptTemplate promptTemplate = new PromptTemplate(templateString);
        return promptTemplate.render(Map.ofEntries(
                Map.entry("schoolName", assignment.getSchoolName() != null ? assignment.getSchoolName() : "N/A"),
                Map.entry("subject", assignment.getSubject()),
                Map.entry("standardClass", assignment.getStandardClass() != null ? assignment.getStandardClass() : "General"),
                Map.entry("description", assignment.getDescription() != null ? assignment.getDescription() : "General topics"),
                Map.entry("totalQuestions", totalQuestions),
                Map.entry("marks", marks),
                Map.entry("questionTypes", questionTypesStr),
                Map.entry("instructions", assignment.getAdditionalInstructions() != null ? assignment.getAdditionalInstructions() : "N/A"),
                Map.entry("easy", easy),
                Map.entry("moderate", moderate),
                Map.entry("hard", hard),
                Map.entry("formatInstructions", formatInstructions)
        ));
    }

    private String buildRefinementPrompt(Assignment assignment) {
        String currentPaperJson = "[]";
        try {
            currentPaperJson = objectMapper.writeValueAsString(assignment.getSections());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize sections for refinement", e);
        }

        var outputConverter = new BeanOutputConverter<>(AiGeneratedPaper.class);
        String formatInstructions = outputConverter.getFormat();

        String templateString = """
                You are an expert academic editor.
                I have an existing question paper for {subject} (Class: {standardClass}).
                Modify it based on the teacher's request below.

                EXISTING PAPER (JSON):
                {currentPaperJson}

                TEACHER'S REFINEMENT REQUEST:
                "{refinementRequest}"

                INSTRUCTIONS:
                - Apply the requested changes while maintaining academic tone and quality.
                - Keep unchanged sections exactly as they are.
                - If asked to add questions, maintain difficulty distribution.
                - Return the complete updated paper, not just the changes.

                {formatInstructions}
                """;

        PromptTemplate promptTemplate = new PromptTemplate(templateString);
        return promptTemplate.render(Map.of(
                "subject", assignment.getSubject(),
                "standardClass", assignment.getStandardClass() != null ? assignment.getStandardClass() : "General",
                "currentPaperJson", currentPaperJson,
                "refinementRequest", assignment.getRefinementInstructions(),
                "formatInstructions", formatInstructions
        ));
    }
}
