package com.hearthealth.backend.service;

import com.hearthealth.backend.dto.*;

public interface GoalService {
    void saveGoalBP(GoalBPRequest request);
    void saveGoalNutrition(GoalNutritionRequest request);
    void saveDoctorAppointment(DoctorAppointmentRequest request);
    void saveMedicationSchedule(MedicationRequest request);
    void toggleMedication(Long id);
    RemindersResponse getReminders(String email);
}
