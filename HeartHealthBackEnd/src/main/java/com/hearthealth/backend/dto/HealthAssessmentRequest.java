package com.hearthealth.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class HealthAssessmentRequest {
    private String email;

    private String fullName;
    private Integer age;
    private String gender;
    private String bloodPressure;
    private String heartRate;
    private String weight;
    private String cholesterol;
    private String chestPain;
    private String breathlessness;
    private String lang;
    private Map<String, Boolean> comorbidities;
}

