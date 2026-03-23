package com.AITeacherHelper.service;

import com.AITeacherHelper.enums.QuestionType;
import com.AITeacherHelper.model.Assignment;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
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

        // Build prompt using plain String.format to avoid PromptTemplate brace conflicts with JSON
        return String.format("""
                You are an expert academic exam paper generator.
                Generate a well-structured question paper based on the following:

                - School: %s
                - Subject: %s
                - Class/Grade: %s
                - Topic/Description: %s
                - Total Questions: %d
                - Marks per Question: %d
                - Allowed Question Types: %s
                - Additional Instructions: %s

                DIFFICULTY DISTRIBUTION:
                - EASY: %d questions
                - MODERATE: %d questions
                - HARD: %d questions

                GROUPING RULES:
                - Group questions by type into sections (e.g., Section A for MCQ, Section B for Short Answer).
                - Each section must have a clear title and instruction line.
                - Each question must have: questionText, questionType, difficulty, marks.
                - Do NOT include difficulty or marks inside the question text itself.

                YOU MUST RESPOND WITH ONLY VALID JSON. NO EXTRA TEXT, NO MARKDOWN, NO CODE BLOCKS.
                The JSON must exactly follow this structure:
                {
                  "sections": [
                    {
                      "title": "Section A",
                      "instruction": "Attempt all questions",
                      "questions": [
                        {
                          "questionText": "What is photosynthesis?",
                          "questionType": "SHORT_ANSWER",
                          "difficulty": "EASY",
                          "marks": 2,
                          "imageUrl": null,
                          "answerKey": null
                        }
                      ]
                    }
                  ]
                }

                Valid questionType values: MCQ, SHORT_ANSWER, LONG_ANSWER, NUMERICAL, DIAGRAM_BASED, TRUE_FALSE, FILL_IN_THE_BLANK
                Valid difficulty values: EASY, MODERATE, HARD
                """,
                assignment.getSchoolName() != null ? assignment.getSchoolName() : "N/A",
                assignment.getSubject(),
                assignment.getStandardClass() != null ? assignment.getStandardClass() : "General",
                assignment.getDescription() != null ? assignment.getDescription() : "General topics",
                totalQuestions,
                marks,
                questionTypesStr,
                assignment.getAdditionalInstructions() != null ? assignment.getAdditionalInstructions() : "N/A",
                easy,
                moderate,
                hard
        );
    }

    private String buildRefinementPrompt(Assignment assignment) {
        String currentPaperJson = "[]";
        try {
            currentPaperJson = objectMapper.writeValueAsString(assignment.getSections());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize sections for refinement", e);
        }

        return String.format("""
                You are an expert academic editor.
                I have an existing question paper for %s (Class: %s).
                Modify it based on the teacher's request below.

                EXISTING PAPER (JSON):
                %s

                TEACHER'S REFINEMENT REQUEST:
                "%s"

                INSTRUCTIONS:
                - Apply the requested changes while maintaining academic tone and quality.
                - Keep unchanged sections exactly as they are.
                - If asked to add questions, maintain difficulty distribution.
                - Return the complete updated paper, not just the changes.

                YOU MUST RESPOND WITH ONLY VALID JSON. NO EXTRA TEXT, NO MARKDOWN, NO CODE BLOCKS.
                The JSON must exactly follow this structure:
                {
                  "sections": [
                    {
                      "title": "Section A",
                      "instruction": "Attempt all questions",
                      "questions": [
                        {
                          "questionText": "question here",
                          "questionType": "SHORT_ANSWER",
                          "difficulty": "EASY",
                          "marks": 2,
                          "imageUrl": null,
                          "answerKey": null
                        }
                      ]
                    }
                  ]
                }

                Valid questionType values: MCQ, SHORT_ANSWER, LONG_ANSWER, NUMERICAL, DIAGRAM_BASED, TRUE_FALSE, FILL_IN_THE_BLANK
                Valid difficulty values: EASY, MODERATE, HARD
                """,
                assignment.getSubject(),
                assignment.getStandardClass() != null ? assignment.getStandardClass() : "General",
                currentPaperJson,
                assignment.getRefinementInstructions()
        );
    }
}
