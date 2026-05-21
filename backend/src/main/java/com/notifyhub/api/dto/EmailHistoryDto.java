package com.notifyhub.api.dto;

import com.notifyhub.api.entity.EmailStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailHistoryDto {
    private Long id;
    private String recipient;
    private String subject;
    private String body;
    private EmailStatus status;
    private LocalDateTime sentAt;
    private String errorMessage;
    private Long templateId;
    private String templateName;
    private String senderName;
}
