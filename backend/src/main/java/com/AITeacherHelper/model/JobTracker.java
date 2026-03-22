package com.AITeacherHelper.model;

import com.AITeacherHelper.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "job_tracker")
public class JobTracker {
    @Id
    private String jobId;
    private String assignmentId;
    private AssignmentStatus status;
    private Integer progress;
    private String message;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
