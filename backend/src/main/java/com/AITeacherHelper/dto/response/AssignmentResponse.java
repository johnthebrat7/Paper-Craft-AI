package com.AITeacherHelper.dto.response;

import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.enums.QuestionType;
import com.AITeacherHelper.model.embedded.Section;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AssignmentResponse {
    private String id;
    private String title;
    private String description;
    private String teacherId;
    private AssignmentStatus status;
    private Integer totalMarks;
    private Integer numberOfQuestions;
    private Integer marksPerQuestion;
    private List<QuestionType> questionTypes;
    private List<Section> sections;
    private Boolean pdfGenerated;
    private String pdfUrl;
    private String jobId;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String schoolName;
    private String subject;
    private String standardClass;
    private String timeAllowed;
}
