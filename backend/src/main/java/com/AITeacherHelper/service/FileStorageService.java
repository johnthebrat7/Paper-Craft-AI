package com.AITeacherHelper.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public String savePdf(byte[] content, String assignmentId) throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
        String filename = "assignment_" + assignmentId + "_" + UUID.randomUUID() + ".pdf";
        Files.write(this.root.resolve(filename), content);
        // In production, upload to S3/GCS and return the full URL
        return "/uploads/" + filename;
    }

    public void deleteFile(String filename) throws IOException {
        Path file = root.resolve(filename);
        Files.deleteIfExists(file);
    }
}
