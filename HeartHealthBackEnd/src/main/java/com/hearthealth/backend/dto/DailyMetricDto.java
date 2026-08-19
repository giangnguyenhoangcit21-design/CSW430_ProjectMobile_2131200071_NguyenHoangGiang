package com.hearthealth.backend.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class DailyMetricDto {
    private Integer sysBP;
    private Integer diaBP;
    private Integer heartRate;
    private Double weight;
    private Double bloodSugar;
    private Integer cholesterol;
    private Integer spo2;
    private LocalDateTime date;
}
