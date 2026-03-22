package com.AITeacherHelper.model;

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
@Document(collection = "library_items")
public class LibraryItem {
    @Id
    private String id;
    private String teacherEmail;
    private String originalAssignmentId;
    private String title;
    private String subject;
    private String standardClass;
    private String description;
    private List<Section> paperContent;
    private LocalDateTime savedAt;
}
