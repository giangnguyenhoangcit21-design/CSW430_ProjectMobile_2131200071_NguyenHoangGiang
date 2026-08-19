package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class GoalNutritionRequest {
    private String email;

    private String weekRange;
    private String fatTarget;
    private String sugarTarget;
    private Double weightTarget;
}

