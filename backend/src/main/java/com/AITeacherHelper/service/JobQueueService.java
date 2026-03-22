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
            assignment.setRefinementInstructions(null); // clear previous refinement
        }
        assignment.setStatus(AssignmentStatus.GENERATING);
        assignment.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        String jobId = UUID.randomUUID().toString();
        JobTracker jobTracker = JobTracker.builder()
                .jobId(jobId)
                .assignmentId(assignmentId)
                .status(AssignmentStatus.GENERATING)
                .progress(0)
                .message(logMessage)
                .startedAt(LocalDateTime.now())
                .build();
        jobTrackerRepository.save(jobTracker);

        // Update assignment with jobId
        assignment.setJobId(jobId);
        assignmentRepository.save(assignment);

        rabbitTemplate.convertAndSend(exchange, generationRoutingKey, assignmentId);
        return jobId;
    }
}
