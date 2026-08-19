package com.hearthealth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewResponse {
    private String fullName;
    private String statusTitle;
    private String statusSubtitle;
    private String bloodPressure;
    private String heartRate;
    private String spo2;
    private String cholesterol;
    private String bloodSugar;
    private String weight;
    private String assessmentColor;
}
