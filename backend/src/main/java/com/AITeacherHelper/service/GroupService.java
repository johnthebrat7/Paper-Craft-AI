package com.AITeacherHelper.service;

import com.AITeacherHelper.model.Group;
import com.AITeacherHelper.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class    GroupService {

    private final GroupRepository groupRepository;

    public Group createGroup(String teacherEmail, String name, String subject, String standardClass) {
        Group group = Group.builder()
                .teacherEmail(teacherEmail)
                .name(name)
                .subject(subject)
                .standardClass(standardClass)
                .studentEmails(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return groupRepository.save(group);
    }

    public List<Group> getGroupsForTeacher(String teacherEmail) {
        return groupRepository.findByTeacherEmail(teacherEmail);
    }

    public Group addStudentToGroup(String groupId, String studentEmail, String teacherEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        if (!group.getTeacherEmail().equals(teacherEmail)) {
            throw new RuntimeException("Unauthorized: You do not own this group");
        }
        if (!group.getStudentEmails().contains(studentEmail)) {
            group.getStudentEmails().add(studentEmail);
            group.setUpdatedAt(LocalDateTime.now());
            return groupRepository.save(group);
        }
        return group;
    }
}
