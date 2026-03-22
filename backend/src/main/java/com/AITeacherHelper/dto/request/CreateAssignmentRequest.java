package com.AITeacherHelper.dto.request;

import com.AITeacherHelper.enums.QuestionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateAssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Teacher ID is required")
    private String teacherId;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @NotNull(message = "At least one question type is required")
    private List<QuestionType> questionTypes;

    @Min(value = 1, message = "Number of questions must be at least 1")
    @NotNull
    private Integer numberOfQuestions;

    @Min(value = 1, message = "Marks per question must be at least 1")
    @NotNull
    private Integer marksPerQuestion;

    private String additionalInstructions;
    private String schoolName;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String standardClass;

    @NotBlank(message = "Time allowed is required")
    private String timeAllowed;
}
