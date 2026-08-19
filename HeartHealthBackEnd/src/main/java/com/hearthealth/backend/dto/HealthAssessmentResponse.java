package com.hearthealth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthAssessmentResponse {
    private String title;
    private String subtitle;
    private String icon;
    private String color;
    private String glowBg;
    private String glowBorder;
    private List<String> recommendations;
}
