package com.notifyhub.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponse {
    private Long id;
    private String name;
    private String subject;
    private String body;
    private LocalDateTime createdAt;
    private Long userId;
    private String creatorName;
}
