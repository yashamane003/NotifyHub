package com.notifyhub.api.controller;

import com.notifyhub.api.dto.TemplateRequest;
import com.notifyhub.api.dto.TemplateResponse;
import com.notifyhub.api.entity.EmailTemplate;
import com.notifyhub.api.entity.User;
import com.notifyhub.api.exception.ResourceNotFoundException;
import com.notifyhub.api.repository.EmailTemplateRepository;
import com.notifyhub.api.repository.UserRepository;
import com.notifyhub.api.security.UserDetailsImpl;
import com.notifyhub.api.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final EmailTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final DashboardService dashboardService;

    private TemplateResponse mapToResponse(EmailTemplate template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .body(template.getBody())
                .createdAt(template.getCreatedAt())
                .userId(template.getUser() != null ? template.getUser().getId() : null)
                .creatorName(template.getUser() != null ? template.getUser().getName() : "System")
                .build();
    }

    @PostMapping
    public ResponseEntity<TemplateResponse> createTemplate(
            @Valid @RequestBody TemplateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User creator = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmailTemplate template = EmailTemplate.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .body(request.getBody())
                .user(creator)
                .build();

        template = templateRepository.save(template);
        dashboardService.evictDashboardStats();

        return ResponseEntity.ok(mapToResponse(template));
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAllTemplates() {
        List<TemplateResponse> templates = templateRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody TemplateRequest request) {
        
        EmailTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        template.setName(request.getName());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());

        template = templateRepository.save(template);
        dashboardService.evictDashboardStats();

        return ResponseEntity.ok(mapToResponse(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTemplate(@PathVariable Long id) {
        EmailTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        templateRepository.delete(template);
        dashboardService.evictDashboardStats();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Template deleted successfully");
        response.put("id", id);
        return ResponseEntity.ok(response);
    }
}
