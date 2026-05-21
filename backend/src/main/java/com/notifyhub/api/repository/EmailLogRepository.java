package com.notifyhub.api.repository;

import com.notifyhub.api.entity.EmailLog;
import com.notifyhub.api.entity.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findAllByOrderBySentAtDesc();
    long countByStatus(EmailStatus status);
}
