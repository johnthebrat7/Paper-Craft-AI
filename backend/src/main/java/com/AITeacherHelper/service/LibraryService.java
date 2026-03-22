package com.AITeacherHelper.service;

import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.model.LibraryItem;
import com.AITeacherHelper.repository.AssignmentRepository;
import com.AITeacherHelper.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryItemRepository libraryItemRepository;
    private final AssignmentRepository assignmentRepository;

    public LibraryItem saveAssignmentToLibrary(String assignmentId, String customTitle, String teacherEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (assignment.getStatus() != AssignmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot save an incomplete assignment to the library");
        }
        LibraryItem item = LibraryItem.builder()
                .teacherEmail(teacherEmail)
                .originalAssignmentId(assignment.getId())
                .title(customTitle != null ? customTitle : assignment.getSubject() + " Paper")
                .subject(assignment.getSubject())
                .standardClass(assignment.getStandardClass())
                .description(assignment.getDescription())
                .paperContent(assignment.getSections())
                .savedAt(LocalDateTime.now())
                .build();
        return libraryItemRepository.save(item);
    }

    public List<LibraryItem> getTeacherLibrary(String teacherEmail) {
        return libraryItemRepository.findByTeacherEmailOrderBySavedAtDesc(teacherEmail);
    }

    public void deleteFromLibrary(String libraryItemId, String teacherEmail) {
        LibraryItem item = libraryItemRepository.findById(libraryItemId)
                .orElseThrow(() -> new RuntimeException("Library item not found"));
        if (!item.getTeacherEmail().equals(teacherEmail)) {
            throw new RuntimeException("Unauthorized: You do not own this library item");
        }
        libraryItemRepository.delete(item);
    }
}
