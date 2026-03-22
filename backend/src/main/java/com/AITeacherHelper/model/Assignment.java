package com.AITeacherHelper.model;

import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.enums.QuestionType;
import com.AITeacherHelper.model.embedded.Section;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "assignments")
public class Assignment {
    @Id
    private String id;
    private String title;
    private String description;
    private String teacherId;       // teacher email (from JWT)
    private LocalDateTime dueDate;
    private List<QuestionType> questionTypes;
    private Integer numberOfQuestions;
    private Integer marksPerQuestion;
    private String additionalInstructions;
    private List<UploadedFile> uploadedFiles;
    private AssignmentStatus status;
    private List<Section> sections;
    private Integer totalMarks;
    private String jobId;
    private Boolean pdfGenerated;
    private String pdfUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String schoolName;
    private String subject;
    private String standardClass;
    private String timeAllowed;
    private String refinementInstructions;
}
