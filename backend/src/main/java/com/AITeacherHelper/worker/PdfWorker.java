package com.AITeacherHelper.worker;

import com.AITeacherHelper.enums.AssignmentStatus;
import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.repository.AssignmentRepository;
import com.AITeacherHelper.service.FileStorageService;
import com.AITeacherHelper.service.PdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PdfWorker {

    private final AssignmentRepository assignmentRepository;
    private final PdfService pdfService;
    private final FileStorageService fileStorageService;

    @RabbitListener(queues = "${app.rabbitmq.queues.pdf}")
    public void processPdfGeneration(String assignmentId) {
        log.info("Starting PDF generation for assignment: {}", assignmentId);
        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

            if (assignment.getSections() == null || assignment.getSections().isEmpty()) {
                log.warn("Assignment {} has no sections; skipping PDF generation", assignmentId);
                return;
            }

            byte[] pdfBytes = pdfService.generateAssignmentPdf(assignment);
            String pdfUrl = fileStorageService.savePdf(pdfBytes, assignmentId);

            assignment.setPdfGenerated(true);
            assignment.setPdfUrl(pdfUrl);
            assignmentRepository.save(assignment);

            log.info("PDF generated and saved for assignment: {}", assignmentId);
        } catch (Exception e) {
            log.error("Failed to generate PDF for assignment: {}", assignmentId, e);
            assignmentRepository.findById(assignmentId).ifPresent(a -> {
                a.setPdfGenerated(false);
                assignmentRepository.save(a);
            });
        }
    }
}
