package com.AITeacherHelper.dto.response;

import com.AITeacherHelper.model.embedded.Section;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AiGeneratedPaper {
    private List<Section> sections;
}
