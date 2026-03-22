package com.AITeacherHelper.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Section {
    private String title;           // e.g., "Section A"
    private String instruction;     // e.g., "Attempt all questions"
    private List<Question> questions;
}
