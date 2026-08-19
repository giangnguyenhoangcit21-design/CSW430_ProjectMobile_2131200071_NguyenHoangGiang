package com.hearthealth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String email;

    private String fullName;
    private Integer age;
    private String gender;
    private String comorbidities;
    private String medications;
    private String avatar;
}

