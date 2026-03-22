package com.AITeacherHelper.controller;

import com.AITeacherHelper.model.JobTracker;
import com.AITeacherHelper.repository.JobTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobStatusController {

    private final JobTrackerRepository jobTrackerRepository;

    @GetMapping("/{assignmentId}")
    public JobTracker getJobStatus(@PathVariable String assignmentId) {
        return jobTrackerRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new RuntimeException("Job not found for assignment: " + assignmentId));
    }
}
