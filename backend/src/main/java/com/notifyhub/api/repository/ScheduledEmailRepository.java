package com.notifyhub.api.repository;

import com.notifyhub.api.entity.EmailStatus;
import com.notifyhub.api.entity.ScheduledEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduledEmailRepository extends JpaRepository<ScheduledEmail, Long> {
    List<ScheduledEmail> findAllByOrderByScheduledTimeDesc();
    List<ScheduledEmail> findAllByStatusAndScheduledTimeBefore(EmailStatus status, LocalDateTime dateTime);
    long countByStatus(EmailStatus status);
}
