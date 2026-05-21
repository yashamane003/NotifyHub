package com.notifyhub.api.service;

import com.notifyhub.api.dto.EmailSendRequest;
import com.notifyhub.api.entity.EmailLog;
import com.notifyhub.api.entity.EmailStatus;
import com.notifyhub.api.entity.EmailTemplate;
import com.notifyhub.api.entity.User;
import com.notifyhub.api.exception.ResourceNotFoundException;
import com.notifyhub.api.repository.EmailLogRepository;
import com.notifyhub.api.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository templateRepository;
    private final EmailLogRepository logRepository;
    private final DashboardService dashboardService; // we will define this next

    public String mergeVariables(String body, Map<String, String> variables) {
        if (body == null) return "";
        if (variables == null || variables.isEmpty()) return body;
        String result = body;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue() != null ? entry.getValue() : "";
            result = result.replace("{{" + key + "}}", value);
        }
        return result;
    }

    @Transactional
    public EmailLog sendEmailImmediately(EmailSendRequest request, User user) {
        EmailTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + request.getTemplateId()));

        String finalBody = mergeVariables(template.getBody(), request.getVariables());
        String finalSubject = template.getSubject(); // variables can be added to subject too! Let's merge subject as well
        finalSubject = mergeVariables(finalSubject, request.getVariables());

        // Create log entry in PENDING status
        EmailLog emailLog = EmailLog.builder()
                .recipient(request.getRecipient())
                .subject(finalSubject)
                .body(finalBody)
                .status(EmailStatus.PENDING)
                .template(template)
                .user(user)
                .build();
        
        emailLog = logRepository.save(emailLog);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getRecipient());
            message.setSubject(finalSubject);
            message.setText(finalBody);
            
            mailSender.send(message);

            emailLog.setStatus(EmailStatus.SENT);
            emailLog.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to {}", request.getRecipient());
        } catch (Exception ex) {
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setErrorMessage(ex.getMessage());
            log.error("Failed to send email to {}", request.getRecipient(), ex);
        }

        EmailLog savedLog = logRepository.save(emailLog);
        dashboardService.evictDashboardStats(); // clear stats cache
        return savedLog;
    }
}
