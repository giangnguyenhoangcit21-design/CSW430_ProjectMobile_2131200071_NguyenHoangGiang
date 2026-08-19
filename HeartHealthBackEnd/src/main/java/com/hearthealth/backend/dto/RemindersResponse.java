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
public class RemindersResponse {

    // BP Goal
    private String bpTarget;
    private Integer activeMins;
    private String bpWeekRange;
    private Boolean isBpGoalOverdue;

    // Nutrition Goal
    private String fatTarget;
    private String sugarTarget;
    private String weightTarget;
    private String nutritionWeekRange;
    private Boolean isNutritionGoalOverdue;

    // Doctor Appointment (Latest summary)
    private Long doctorApptId;
    private String doctorName;
    private String appointmentType;
    private String appointmentDate;
    private String appointmentTime;
    private String appointmentLocation;
    private Boolean isDoctorApptOverdue;

    // Full Doctor Appointments List
    private List<DoctorApptDto> doctorAppointments;

    // Medication List
    private List<MedicationDto> medications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorApptDto {
        private Long id;
        private String doctorName;
        private String appointmentType;
        private String appointmentDate;
        private String appointmentTime;
        private String location;
        private Boolean isOverdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationDto {
        private Long id;
        private String name;
        private String description;
        private String timeOfDay;
        private Boolean taken;
    }
}
