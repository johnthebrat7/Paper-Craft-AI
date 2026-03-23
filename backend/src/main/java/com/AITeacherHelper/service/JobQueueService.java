package com.AITeacherHelper.service;

import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.model.JobTracker;
import com.AITeacherHelper.repository.AssignmentRepository;
import com.AITeacherHelper.repository.JobTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobQueueService {

    private final RabbitTemplate rabbitTemplate;
    private final JobTrackerRepository jobTrackerRepository;
    private final AssignmentRepository assignmentRepository;

    @Value("${app.rabbitmq.exchanges.main}")
    private String exchange;

    @Value("${app.rabbitmq.routing-keys.generation}")
    private String generationRoutingKey;

    public String sendGenerationJob(String assignmentId) {
        return createAndEnqueueJob(assignmentId, "Job queued for AI generation", null);
    }

    public String sendRefinementJob(String assignmentId, String refinementPrompt) {
        return createAndEnqueueJob(assignmentId, "Job queued for refinement", refinementPrompt);
    }

    private String createAndEnqueueJob(String assignmentId, String logMessage, String refinementPrompt) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (refinementPrompt != null) {
            assignment.setRefinementInstructions(refinementPrompt);
        } else {
            assignment.setRefinementInstructions(null);
        }
        assignment.setStatus(AssignmentStatus.GENERATING);
        assignment.setUpdatedAt(LocalDateTime.now());

        // Reuse existing JobTracker if present, otherwise create new one
        JobTracker jobTracker = jobTrackerRepository.findFirstByAssignmentId(assignmentId)
                .orElse(JobTracker.builder()
                        .jobId(UUID.randomUUID().toString())
                        .assignmentId(assignmentId)
                        .startedAt(LocalDateTime.now())
                        .build());

        jobTracker.setStatus(AssignmentStatus.GENERATING);
        jobTracker.setProgress(0);
        jobTracker.setMessage(logMessage);
        jobTracker.setErrorMessage(null);
        jobTracker.setCompletedAt(null);
        jobTracker.setStartedAt(LocalDateTime.now());
        jobTrackerRepository.save(jobTracker);

        assignment.setJobId(jobTracker.getJobId());
        assignmentRepository.save(assignment);

        rabbitTemplate.convertAndSend(exchange, generationRoutingKey, assignmentId);
        return jobTracker.getJobId();
    }
}
