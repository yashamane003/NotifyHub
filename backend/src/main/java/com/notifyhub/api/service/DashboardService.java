package com.notifyhub.api.service;

import com.notifyhub.api.dto.DashboardStatsDto;
import com.notifyhub.api.entity.EmailStatus;
import com.notifyhub.api.repository.EmailLogRepository;
import com.notifyhub.api.repository.EmailTemplateRepository;
import com.notifyhub.api.repository.ScheduledEmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final EmailLogRepository logRepository;
    private final EmailTemplateRepository templateRepository;
    private final ScheduledEmailRepository scheduledEmailRepository;

    @Cacheable(value = "dashboardStats", key = "'all'", unless = "#result == null")
    public DashboardStatsDto getDashboardStats() {
        log.info("Fetching dashboard statistics from database (cache miss)...");
        
        long totalSent = logRepository.countByStatus(EmailStatus.SENT);
        long totalFailed = logRepository.countByStatus(EmailStatus.FAILED);
        long scheduledCount = scheduledEmailRepository.countByStatus(EmailStatus.PENDING);
        long templatesCount = templateRepository.count();

        return DashboardStatsDto.builder()
                .totalSent(totalSent)
                .totalFailed(totalFailed)
                .scheduledCount(scheduledCount)
                .templatesCount(templatesCount)
                .build();
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void evictDashboardStats() {
        log.info("Evicting dashboard stats cache due to new email activity or template update.");
    }
}
