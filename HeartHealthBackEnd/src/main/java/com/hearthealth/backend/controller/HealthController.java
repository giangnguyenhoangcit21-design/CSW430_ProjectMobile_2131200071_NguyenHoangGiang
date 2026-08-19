package com.hearthealth.backend.controller;

import com.hearthealth.backend.dto.DailyMetricRequest;
import com.hearthealth.backend.dto.HealthAssessmentRequest;
import com.hearthealth.backend.dto.HealthAssessmentResponse;
import com.hearthealth.backend.dto.OverviewResponse;
import com.hearthealth.backend.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @PostMapping("/assess")
    public ResponseEntity<HealthAssessmentResponse> assessHealth(@RequestBody HealthAssessmentRequest request) {
        return ResponseEntity.ok(healthService.assessHealth(request));
    }

    @PostMapping("/daily-metrics")
    public ResponseEntity<Map<String, String>> saveDailyMetric(@RequestBody DailyMetricRequest request) {
        healthService.saveDailyMetric(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Daily metrics saved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview")
    public ResponseEntity<OverviewResponse> getOverview(
            @RequestParam(required = false) String email) {
        String identifier = email != null ? email.trim() : "";
        return ResponseEntity.ok(healthService.getOverview(identifier));
    }

    @GetMapping("/profile")
    public ResponseEntity<com.hearthealth.backend.dto.UserProfileResponse> getUserProfile(
            @RequestParam(required = false) String email) {
        String identifier = email != null ? email.trim() : "";
        return ResponseEntity.ok(healthService.getUserProfile(identifier));
    }

    @PostMapping("/profile/update")
    public ResponseEntity<com.hearthealth.backend.dto.UserProfileResponse> updateUserProfile(
            @RequestBody com.hearthealth.backend.dto.UpdateProfileRequest request) {
        return ResponseEntity.ok(healthService.updateUserProfile(request));
    }

    @GetMapping("/metrics-history")
    public ResponseEntity<java.util.List<com.hearthealth.backend.dto.DailyMetricDto>> getMetricsHistory(
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "7") int days) {
        String identifier = email != null ? email.trim() : "";
        return ResponseEntity.ok(healthService.getMetricsHistory(identifier, days));
    }
}
