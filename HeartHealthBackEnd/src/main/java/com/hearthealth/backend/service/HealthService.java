package com.hearthealth.backend.service;

import com.hearthealth.backend.dto.*;

public interface HealthService {
    HealthAssessmentResponse assessHealth(HealthAssessmentRequest request);
    void saveDailyMetric(DailyMetricRequest request);
    OverviewResponse getOverview(String phone);
    UserProfileResponse getUserProfile(String phone);
    UserProfileResponse updateUserProfile(UpdateProfileRequest request);
    java.util.List<DailyMetricDto> getMetricsHistory(String identifier, int days);
}
