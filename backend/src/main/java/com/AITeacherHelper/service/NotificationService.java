package com.AITeacherHelper.service;

import com.AITeacherHelper.dto.response.JobStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendJobUpdate(String jobId, JobStatusResponse status) {
        messagingTemplate.convertAndSend("/topic/job/" + jobId, status);
    }
}
