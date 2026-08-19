package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;

    private String purpose; // "REGISTER" or "RESET_PASSWORD"
    private String lang; // "VN" or "EN"
}
