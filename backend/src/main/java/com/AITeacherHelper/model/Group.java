package com.AITeacherHelper.model;

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
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String teacherEmail;
    private String name;
    private String subject;
    private String standardClass;
    private List<String> studentEmails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
