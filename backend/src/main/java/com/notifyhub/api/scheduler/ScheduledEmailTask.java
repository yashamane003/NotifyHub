package com.notifyhub.api.scheduler;

import com.notifyhub.api.entity.EmailLog;
import com.notifyhub.api.entity.EmailStatus;
import com.notifyhub.api.entity.ScheduledEmail;
import com.notifyhub.api.repository.EmailLogRepository;
import com.notifyhub.api.repository.ScheduledEmailRepository;
import com.notifyhub.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledEmailTask {

    private final ScheduledEmailRepository scheduledEmailRepository;
    private final EmailLogRepository emailLogRepository;
    private final JavaMailSender mailSender;
    private final DashboardService dashboardService;

    @Scheduled(cron = "0 * * * * *") // Check every minute
    @Transactional
    public void sendPendingEmails() {
        LocalDateTime now = LocalDateTime.now();
        List<ScheduledEmail> pendingEmails = scheduledEmailRepository
                .findAllByStatusAndScheduledTimeBefore(EmailStatus.PENDING, now);

        if (pendingEmails.isEmpty()) {
            return;
        }

        log.info("Found {} pending scheduled emails due for delivery.", pendingEmails.size());

        for (ScheduledEmail email : pendingEmails) {
            log.info("Processing scheduled email ID {} to recipient {}", email.getId(), email.getRecipient());
            
            // Create history log entry
            EmailLog logEntry = EmailLog.builder()
                    .recipient(email.getRecipient())
                    .subject(email.getSubject())
                    .body(email.getBody())
                    .template(email.getTemplate())
                    .user(email.getUser())
                    .build();

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email.getRecipient());
                message.setSubject(email.getSubject());
                message.setText(email.getBody());

                mailSender.send(message);

                // Update scheduled email record
                email.setStatus(EmailStatus.SENT);
                email.setSentAt(now);

                // Update history log entry
                logEntry.setStatus(EmailStatus.SENT);
                logEntry.setSentAt(now);
                log.info("Successfully sent scheduled email ID {}", email.getId());
            } catch (Exception ex) {
                // Update scheduled email record
                email.setStatus(EmailStatus.FAILED);
                email.setSentAt(now); // mark when process finished

                // Update history log entry
                logEntry.setStatus(EmailStatus.FAILED);
                logEntry.setErrorMessage(ex.getMessage());
                log.error("Failed to send scheduled email ID {}: {}", email.getId(), ex.getMessage());
            }

            scheduledEmailRepository.save(email);
            emailLogRepository.save(logEntry);
        }

        dashboardService.evictDashboardStats(); // clear dashboard stats cache
    }
}
