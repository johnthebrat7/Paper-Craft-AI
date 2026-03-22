package com.AITeacherHelper.dto.response;

import com.AITeacherHelper.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobStatusResponse {
    private String jobId;
    private String assignmentId;
    private AssignmentStatus status;
    private int progress;
    private String message;
}
