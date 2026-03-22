package com.AITeacherHelper.model.embedded;

import com.AITeacherHelper.enums.Difficulty;
import com.AITeacherHelper.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    private String questionText;
    private QuestionType questionType;
    private Difficulty difficulty;
    private Integer marks;
    private String imageUrl;
    private String answerKey; // Optional model answer for teacher reference
}
