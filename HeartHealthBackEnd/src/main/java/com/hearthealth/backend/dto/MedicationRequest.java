package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class MedicationRequest {
    private String email;

    private String medicationName;
    private String description;
    private String timeOfDay;
}

