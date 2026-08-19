package com.hearthealth.backend.controller;

import com.hearthealth.backend.dto.*;
import com.hearthealth.backend.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/goals/reminders")
    public ResponseEntity<RemindersResponse> getReminders(
            @RequestParam(required = false) String email) {
        String identifier = email != null ? email.trim() : "";
        return ResponseEntity.ok(goalService.getReminders(identifier));
    }

    @PostMapping("/goals/bp")
    public ResponseEntity<Map<String, String>> saveGoalBP(@RequestBody GoalBPRequest request) {
        goalService.saveGoalBP(request);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Mục tiêu Huyết áp saved successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/goals/nutrition")
    public ResponseEntity<Map<String, String>> saveGoalNutrition(@RequestBody GoalNutritionRequest request) {
        goalService.saveGoalNutrition(request);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Mục tiêu Dinh dưỡng saved successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/schedules/doctor")
    public ResponseEntity<Map<String, String>> saveDoctorAppointment(@RequestBody DoctorAppointmentRequest request) {
        goalService.saveDoctorAppointment(request);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Lịch hẹn bác sĩ saved successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/schedules/medication")
    public ResponseEntity<Map<String, String>> saveMedicationSchedule(@RequestBody MedicationRequest request) {
        goalService.saveMedicationSchedule(request);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Đơn thuốc saved successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/schedules/medication/toggle")
    public ResponseEntity<Map<String, String>> toggleMedication(@RequestParam Long id) {
        goalService.toggleMedication(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Toggled medication status");
        return ResponseEntity.ok(res);
    }
}
