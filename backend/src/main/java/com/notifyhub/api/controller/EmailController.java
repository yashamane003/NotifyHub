package com.notifyhub.api.controller;

import com.notifyhub.api.dto.*;
import com.notifyhub.api.entity.*;
import com.notifyhub.api.exception.ResourceNotFoundException;
import com.notifyhub.api.repository.EmailLogRepository;
import com.notifyhub.api.repository.EmailTemplateRepository;
import com.notifyhub.api.repository.ScheduledEmailRepository;
import com.notifyhub.api.repository.UserRepository;
import com.notifyhub.api.security.UserDetailsImpl;
import com.notifyhub.api.service.DashboardService;
import com.notifyhub.api.service.EmailSenderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailSenderService emailSenderService;
    private final EmailLogRepository logRepository;
    private final ScheduledEmailRepository scheduledRepository;
    private final EmailTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final DashboardService dashboardService;

    private EmailHistoryDto mapToHistoryDto(EmailLog log) {
        return EmailHistoryDto.builder()
                .id(log.getId())
                .recipient(log.getRecipient())
                .subject(log.getSubject())
                .body(log.getBody())
                .status(log.getStatus())
                .sentAt(log.getSentAt())
                .errorMessage(log.getErrorMessage())
                .templateId(log.getTemplate() != null ? log.getTemplate().getId() : null)
                .templateName(log.getTemplate() != null ? log.getTemplate().getName() : "Immediate (No Template)")
                .senderName(log.getUser() != null ? log.getUser().getName() : "System")
                .build();
    }

    private ScheduledEmailResponse mapToScheduledResponse(ScheduledEmail email) {
        return ScheduledEmailResponse.builder()
                .id(email.getId())
                .recipient(email.getRecipient())
                .subject(email.getSubject())
                .body(email.getBody())
                .status(email.getStatus())
                .scheduledTime(email.getScheduledTime())
                .sentAt(email.getSentAt())
                .templateId(email.getTemplate() != null ? email.getTemplate().getId() : null)
                .templateName(email.getTemplate() != null ? email.getTemplate().getName() : "Custom Scheduled")
                .schedulerName(email.getUser() != null ? email.getUser().getName() : "System")
                .build();
    }

    @PostMapping("/send")
    public ResponseEntity<EmailHistoryDto> sendEmail(
            @Valid @RequestBody EmailSendRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmailLog log = emailSenderService.sendEmailImmediately(request, user);
        return ResponseEntity.ok(mapToHistoryDto(log));
    }

    @PostMapping("/schedule")
    public ResponseEntity<ScheduledEmailResponse> scheduleEmail(
            @Valid @RequestBody EmailScheduleRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmailTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + request.getTemplateId()));

        // Resolve body and subject with variables
        String finalBody = emailSenderService.mergeVariables(template.getBody(), request.getVariables());
        String finalSubject = emailSenderService.mergeVariables(template.getSubject(), request.getVariables());

        ScheduledEmail scheduledEmail = ScheduledEmail.builder()
                .recipient(request.getRecipient())
                .subject(finalSubject)
                .body(finalBody)
                .status(EmailStatus.PENDING)
                .scheduledTime(request.getScheduledTime())
                .template(template)
                .user(user)
                .build();

        scheduledEmail = scheduledRepository.save(scheduledEmail);
        dashboardService.evictDashboardStats();

        return ResponseEntity.ok(mapToScheduledResponse(scheduledEmail));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<ScheduledEmailResponse>> getScheduledEmails() {
        List<ScheduledEmailResponse> list = scheduledRepository.findAllByOrderByScheduledTimeDesc()
                .stream()
                .map(this::mapToScheduledResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmailHistoryDto>> getEmailHistory() {
        List<EmailHistoryDto> list = logRepository.findAllByOrderBySentAtDesc()
                .stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<EmailHistoryDto> getEmailHistoryDetail(@PathVariable Long id) {
        EmailLog log = logRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email log not found with ID: " + id));
        return ResponseEntity.ok(mapToHistoryDto(log));
    }
}
