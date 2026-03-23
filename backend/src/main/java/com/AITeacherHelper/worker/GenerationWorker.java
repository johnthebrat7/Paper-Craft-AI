package com.AITeacherHelper.worker;

import com.AITeacherHelper.dto.response.AiGeneratedPaper;
import com.AITeacherHelper.dto.response.JobStatusResponse;
import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.model.JobTracker;
import com.AITeacherHelper.repository.AssignmentRepository;
import com.AITeacherHelper.repository.JobTrackerRepository;
import com.AITeacherHelper.service.NotificationService;
import com.AITeacherHelper.service.PromptBuilderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class GenerationWorker {

    private final AssignmentRepository assignmentRepository;
    private final JobTrackerRepository jobTrackerRepository;
    private final PromptBuilderService promptBuilderService;
    private final ChatClient chatClient;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "${app.rabbitmq.queues.generation}")
    public void processGeneration(String assignmentId) {
        log.info("Received generation request for Assignment ID: {}", assignmentId);

        // Use findFirstByAssignmentId to safely handle any accidental duplicate documents
        Optional<JobTracker> jobOptional = jobTrackerRepository.findFirstByAssignmentId(assignmentId);
        if (jobOptional.isEmpty()) {
            log.error("JobTracker not found for Assignment ID: {}", assignmentId);
            return;
        }

        JobTracker job = jobOptional.get();

        // Idempotency guard: if this job is already completed or failed, skip reprocessing.
        // This prevents duplicate work when RabbitMQ redelivers a message after a transient failure.
        if (job.getStatus() == AssignmentStatus.COMPLETED) {
            log.warn("Job {} already COMPLETED. Skipping.", job.getJobId());
            return;
        }

        try {
            updateJobStatus(job, 10, "Fetching assignment details...", AssignmentStatus.GENERATING);

            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found in database"));

            updateJobStatus(job, 25, "Building AI prompt...", AssignmentStatus.GENERATING);
            String prompt = promptBuilderService.buildPrompt(assignment);

            updateJobStatus(job, 50, "AI is generating your question paper...", AssignmentStatus.GENERATING);

            // Get raw string response from AI
            String rawResponse = chatClient.prompt(prompt)
                    .call()
                    .content();

            log.debug("Raw AI response: {}", rawResponse);

            if (rawResponse == null || rawResponse.isBlank()) {
                throw new RuntimeException("AI returned an empty response");
            }

            // Strip markdown code blocks if the model wraps JSON in ```json ... ```
            String cleanedResponse = rawResponse.trim();
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse
                        .replaceAll("^```json\\s*", "")
                        .replaceAll("^```\\s*", "")
                        .replaceAll("```\\s*$", "")
                        .trim();
            }

            // Parse the JSON manually
            AiGeneratedPaper generatedPaper = objectMapper.readValue(cleanedResponse, AiGeneratedPaper.class);

            if (generatedPaper == null || generatedPaper.getSections() == null || generatedPaper.getSections().isEmpty()) {
                throw new RuntimeException("AI returned an empty or malformed question paper");
            }

            updateJobStatus(job, 85, "Saving generated paper...", AssignmentStatus.GENERATING);

            assignment.setSections(generatedPaper.getSections());
            assignment.setStatus(AssignmentStatus.COMPLETED);
            assignment.setRefinementInstructions(null);
            assignment.setUpdatedAt(LocalDateTime.now());
            assignmentRepository.save(assignment);

            job.setCompletedAt(LocalDateTime.now());
            updateJobStatus(job, 100, "Question paper generated successfully!", AssignmentStatus.COMPLETED);

            log.info("Successfully completed AI generation for Assignment: {}", assignmentId);

        } catch (Exception e) {
            log.error("Critical error in GenerationWorker for Assignment {}: {}", assignmentId, e.getMessage(), e);

            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
            updateJobStatus(job, 0, "Generation failed: " + e.getMessage(), AssignmentStatus.FAILED);

            assignmentRepository.findById(assignmentId).ifPresent(a -> {
                a.setStatus(AssignmentStatus.FAILED);
                assignmentRepository.save(a);
            });
        }
    }

    private void updateJobStatus(JobTracker job, int progress, String message, AssignmentStatus status) {
        job.setProgress(progress);
        job.setMessage(message);
        job.setStatus(status);
        jobTrackerRepository.save(job);

        JobStatusResponse response = JobStatusResponse.builder()
                .jobId(job.getJobId())
                .assignmentId(job.getAssignmentId())
                .status(status)
                .progress(progress)
                .message(message)
                .build();
        notificationService.sendJobUpdate(job.getJobId(), response);
    }
}