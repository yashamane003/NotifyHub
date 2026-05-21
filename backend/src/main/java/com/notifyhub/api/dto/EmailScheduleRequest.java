package com.notifyhub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class EmailScheduleRequest {

    @NotNull(message = "Template ID is required")
    private Long templateId;

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Recipient should be a valid email address")
    private String recipient;

    private Map<String, String> variables;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;
}
