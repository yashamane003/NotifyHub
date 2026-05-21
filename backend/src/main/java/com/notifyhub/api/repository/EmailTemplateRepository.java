package com.notifyhub.api.repository;

import com.notifyhub.api.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    List<EmailTemplate> findAllByOrderByCreatedAtDesc();
}
