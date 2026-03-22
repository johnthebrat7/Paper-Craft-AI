package com.AITeacherHelper.service;

import com.AITeacherHelper.dto.request.CreateAssignmentRequest;
import com.AITeacherHelper.dto.response.AssignmentResponse;
import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentResponse createAssignment(CreateAssignmentRequest request) {
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .teacherId(request.getTeacherId())
                .dueDate(request.getDueDate())
                .questionTypes(request.getQuestionTypes())
                .numberOfQuestions(request.getNumberOfQuestions())
                .marksPerQuestion(request.getMarksPerQuestion())
                .totalMarks(request.getNumberOfQuestions() * request.getMarksPerQuestion())
                .additionalInstructions(request.getAdditionalInstructions())
                .status(AssignmentStatus.DRAFT)
                .pdfGenerated(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .schoolName(request.getSchoolName() != null ? request.getSchoolName() : "N/A")
                .subject(request.getSubject())
                .standardClass(request.getStandardClass())
                .timeAllowed(request.getTimeAllowed())
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    public AssignmentResponse getAssignmentById(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return mapToResponse(assignment);
    }

    public Assignment getAssignmentEntity(String id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
    }

    // Returns only assignments for the authenticated teacher
    public List<AssignmentResponse> getAssignmentsForTeacher(String teacherEmail) {
        return assignmentRepository.findByTeacherIdOrderByCreatedAtDesc(teacherEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteAssignment(String id) {
        assignmentRepository.deleteById(id);
    }

    private AssignmentResponse mapToResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .teacherId(a.getTeacherId())
                .status(a.getStatus())
                .totalMarks(a.getTotalMarks())
                .numberOfQuestions(a.getNumberOfQuestions())
                .marksPerQuestion(a.getMarksPerQuestion())
                .questionTypes(a.getQuestionTypes())
                .sections(a.getSections())
                .pdfGenerated(a.getPdfGenerated())
                .pdfUrl(a.getPdfUrl())
                .jobId(a.getJobId())
                .dueDate(a.getDueDate())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .schoolName(a.getSchoolName())
                .subject(a.getSubject())
                .standardClass(a.getStandardClass())
                .timeAllowed(a.getTimeAllowed())
                .build();
    }
}
