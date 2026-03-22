package com.AITeacherHelper.controller;

import com.AITeacherHelper.dto.response.ApiResponse;
import com.AITeacherHelper.model.Group;
import com.AITeacherHelper.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    public record CreateGroupRequest(String name, String subject, String standardClass) {}
    public record AddStudentRequest(String studentEmail) {}

    @PostMapping
    public ResponseEntity<ApiResponse<Group>> createGroup(
            @RequestBody CreateGroupRequest request,
            Authentication authentication) {
        Group group = groupService.createGroup(authentication.getName(), request.name(), request.subject(), request.standardClass());
        return ResponseEntity.ok(ApiResponse.success(group, "Group created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Group>>> getMyGroups(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(groupService.getGroupsForTeacher(authentication.getName()), "Groups retrieved"));
    }

    @PostMapping("/{groupId}/students")
    public ResponseEntity<ApiResponse<Group>> addStudent(
            @PathVariable String groupId,
            @RequestBody AddStudentRequest request,
            Authentication authentication) {
        Group updatedGroup = groupService.addStudentToGroup(groupId, request.studentEmail(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(updatedGroup, "Student added successfully"));
    }
}
