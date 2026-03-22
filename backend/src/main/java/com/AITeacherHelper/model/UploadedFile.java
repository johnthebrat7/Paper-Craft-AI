package com.AITeacherHelper.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedFile {
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
}
