package com.notifyhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;
}
