package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class DailyMetricRequest {
    private String email;

    private Integer sysBP;
    private Integer diaBP;
    private String bloodPressure;
    private Integer heartRate;
    private Integer spo2;
    private Integer cholesterol;
    private Double bloodSugar;
    private Double weight;
}

