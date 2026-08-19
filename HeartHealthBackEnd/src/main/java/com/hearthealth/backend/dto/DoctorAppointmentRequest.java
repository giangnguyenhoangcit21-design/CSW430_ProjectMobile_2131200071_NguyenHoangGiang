package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class DoctorAppointmentRequest {
    private String email;

    private String doctorName;
    private String appointmentType;
    private String appointmentDate;
    private String appointmentTime;
    private String location;
}

