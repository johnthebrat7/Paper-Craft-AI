package com.AITeacherHelper.controller;

import com.AITeacherHelper.dto.request.CreateAssignmentRequest;
import com.AITeacherHelper.dto.request.RefineAssignmentRequest;
import com.AITeacherHelper.dto.response.AssignmentResponse;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.service.AssignmentService;
import com.AITeacherHelper.service.JobQueueService;
import com.AITeacherHelper.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final PdfService pdfService;
    private final JobQueueService jobQueueService;

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        // Override teacherId with authenticated email for security
        request.setTeacherId(authentication.getName());
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<Map<String, String>> triggerGeneration(
            @PathVariable String id,
            Authentication authentication) {
        // Verify ownership
        AssignmentResponse assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getTeacherId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }
        String jobId = jobQueueService.sendGenerationJob(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Generation process started");
        response.put("jobId", jobId);
        response.put("assignmentId", id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/refine")
    public ResponseEntity<Map<String, String>> refineAssignment(
            @PathVariable String id,
            @RequestBody RefineAssignmentRequest request,
            Authentication authentication) {
        AssignmentResponse assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getTeacherId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }
        String jobId = jobQueueService.sendRefinementJob(id, request.getPrompt());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Refinement process started");
        response.put("jobId", jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(
            @PathVariable String id,
            Authentication authentication) {
        AssignmentResponse assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getTeacherId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(assignment);
    }

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(Authentication authentication) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForTeacher(authentication.getName()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAssignmentPdf(
            @PathVariable String id,
            Authentication authentication) {
        try {
            Assignment assignment = assignmentService.getAssignmentEntity(id);
            if (!assignment.getTeacherId().equals(authentication.getName())) {
                return ResponseEntity.status(403).build();
            }
            byte[] pdfBytes = pdfService.generateAssignmentPdf(assignment);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignment_" + id + ".pdf\"")
                    .body(new ByteArrayResource(pdfBytes));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAssignment(
            @PathVariable String id,
            Authentication authentication) {
        AssignmentResponse assignment = assignmentService.getAssignmentById(id);
        if (!assignment.getTeacherId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
    }
}
