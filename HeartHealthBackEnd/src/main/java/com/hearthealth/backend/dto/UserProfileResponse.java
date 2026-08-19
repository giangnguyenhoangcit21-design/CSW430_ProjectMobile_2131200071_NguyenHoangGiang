package com.hearthealth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String email;

    private String fullName;
    private String avatar;
    private Integer age;
    private String gender;
    private String startDate;
    private String comorbidities;
    private Boolean isComorbiditiesLong;
    private String medications;
    private String assessmentTitle;
    private String assessmentColor;
}

