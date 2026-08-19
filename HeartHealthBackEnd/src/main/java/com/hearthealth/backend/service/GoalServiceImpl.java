package com.hearthealth.backend.service;

import com.hearthealth.backend.dto.*;
import com.hearthealth.backend.entity.*;
import com.hearthealth.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final UserRepository userRepository;
    private final HealthGoalRepository healthGoalRepository;
    private final DoctorAppointmentRepository doctorAppointmentRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;

    private User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new com.hearthealth.backend.exception.BadRequestException("Chưa cung cấp thông tin tài khoản (Email)");
        }
        String idStr = identifier.trim();
        return userRepository.findByEmail(idStr)
                .orElseThrow(() -> new com.hearthealth.backend.exception.UserNotFoundException("Tài khoản không tồn tại trên hệ thống"));
    }

    @Override
    public void saveGoalBP(GoalBPRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        Optional<HealthGoal> goalOpt = healthGoalRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        HealthGoal goal = goalOpt.orElseGet(() -> HealthGoal.builder().user(user).build());

        goal.setBpTarget(request.getBpTarget());
        goal.setActiveMins(request.getActiveMins());
        goal.setWeekRange(request.getWeekRange());
        parseAndSetDates(goal, request.getWeekRange());

        healthGoalRepository.save(goal);
    }

    @Override
    public void saveGoalNutrition(GoalNutritionRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        Optional<HealthGoal> goalOpt = healthGoalRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        HealthGoal goal = goalOpt.orElseGet(() -> HealthGoal.builder().user(user).build());

        goal.setFatTarget(request.getFatTarget());
        goal.setSugarTarget(request.getSugarTarget());
        goal.setWeightTarget(request.getWeightTarget());
        goal.setWeekRange(request.getWeekRange());
        parseAndSetDates(goal, request.getWeekRange());

        healthGoalRepository.save(goal);
    }

    @Override
    public void saveDoctorAppointment(DoctorAppointmentRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        LocalDate apptDate = LocalDate.now();
        if (request.getAppointmentDate() != null && !request.getAppointmentDate().trim().isEmpty()) {
            try {
                String str = request.getAppointmentDate().trim();
                if (str.contains("/")) {
                    String[] parts = str.split("/");
                    if (parts.length == 3) {
                        int p0 = Integer.parseInt(parts[0].trim());
                        int p1 = Integer.parseInt(parts[1].trim());
                        int p2 = Integer.parseInt(parts[2].trim());
                        if (p0 > 1000) {
                            apptDate = LocalDate.of(p0, p1, p2);
                        } else {
                            apptDate = LocalDate.of(p2, p1, p0);
                        }
                    } else if (parts.length == 2) {
                        int day = Integer.parseInt(parts[0].trim());
                        int month = Integer.parseInt(parts[1].trim());
                        int year = LocalDate.now().getYear();
                        apptDate = LocalDate.of(year, month, day);
                    }
                } else if (str.contains("-")) {
                    apptDate = LocalDate.parse(str);
                }
            } catch (Exception e) {
                System.err.println("Error parsing appointment date '" + request.getAppointmentDate() + "': " + e.getMessage());
            }
        }

        DoctorAppointment appointment = DoctorAppointment.builder()
                .user(user)
                .doctorName(request.getDoctorName())
                .appointmentType(request.getAppointmentType())
                .appointmentDate(apptDate)
                .appointmentTime(request.getAppointmentTime())
                .location(request.getLocation())
                .status("SCHEDULED")
                .build();

        DoctorAppointment saved = doctorAppointmentRepository.save(appointment);
        System.out.println(">>> Saved Doctor Appointment ID: " + saved.getId() + " for User: " + user.getId() + ", Date: " + apptDate);
    }

    @Override
    public void saveMedicationSchedule(MedicationRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        MedicationSchedule med = MedicationSchedule.builder()
                .user(user)
                .medicationName(request.getMedicationName())
                .description(request.getDescription())
                .timeOfDay(request.getTimeOfDay())
                .taken(false)
                .build();

        medicationScheduleRepository.save(med);
    }

    @Override
    public void toggleMedication(Long id) {
        MedicationSchedule med = medicationScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        boolean newTaken = !med.getTaken();
        med.setTaken(newTaken);
        if (newTaken) {
            med.setLastTakenDate(LocalDate.now());
        }
        medicationScheduleRepository.save(med);
    }

    @Override
    public RemindersResponse getReminders(String email) {
        User user = findUserByIdentifier(email);

        Optional<HealthGoal> goalOpt = healthGoalRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        List<DoctorAppointment> appts = doctorAppointmentRepository.findByUserIdOrderByIdDesc(user.getId());
        System.out.println(">>> Fetching reminders for User: " + email + ". Total doctor appointments found: " + appts.size());
        List<MedicationSchedule> meds = medicationScheduleRepository.findByUserId(user.getId());

        LocalDate today = LocalDate.now();

        // BP Goal
        String bpTarget = "--/--";
        Integer activeMins = 30;
        String bpWeekRange = "";
        boolean isBpGoalOverdue = true;

        if (goalOpt.isPresent()) {
            HealthGoal g = goalOpt.get();
            if (g.getBpTarget() != null && !g.getBpTarget().isEmpty()) {
                bpTarget = g.getBpTarget();
                activeMins = g.getActiveMins() != null ? g.getActiveMins() : 30;
                bpWeekRange = g.getWeekRange() != null ? g.getWeekRange() : "Tuần này";
                isBpGoalOverdue = g.getEndDate() != null && today.isAfter(g.getEndDate());
            }
        }

        // Nutrition Goal
        String fatTarget = "--";
        String sugarTarget = "--";
        String weightTarget = "--";
        String nutritionWeekRange = "";
        boolean isNutritionGoalOverdue = true;

        if (goalOpt.isPresent()) {
            HealthGoal g = goalOpt.get();
            if (g.getFatTarget() != null || g.getSugarTarget() != null || g.getWeightTarget() != null) {
                fatTarget = g.getFatTarget() != null ? g.getFatTarget() : "< 200";
                sugarTarget = g.getSugarTarget() != null ? g.getSugarTarget() : "90 - 130";
                weightTarget = g.getWeightTarget() != null ? String.valueOf(g.getWeightTarget()) : "--";
                nutritionWeekRange = g.getWeekRange() != null ? g.getWeekRange() : "Tuần này";
                isNutritionGoalOverdue = g.getEndDate() != null && today.isAfter(g.getEndDate());
            }
        }

        // Doctor Appointment List
        List<RemindersResponse.DoctorApptDto> doctorApptDtos = new ArrayList<>();
        Long doctorApptId = null;
        String doctorName = "--";
        String appointmentType = "--";
        String appointmentDate = "--";
        String appointmentTime = "--";
        String location = "--";
        boolean isDoctorApptOverdue = false;

        if (!appts.isEmpty()) {
            for (DoctorAppointment a : appts) {
                String formattedDate = "--";
                boolean isOverdue = false;
                if (a.getAppointmentDate() != null) {
                    formattedDate = a.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    isOverdue = today.isAfter(a.getAppointmentDate());
                }
                doctorApptDtos.add(RemindersResponse.DoctorApptDto.builder()
                        .id(a.getId())
                        .doctorName(a.getDoctorName())
                        .appointmentType(a.getAppointmentType())
                        .appointmentDate(formattedDate)
                        .appointmentTime(a.getAppointmentTime())
                        .location(a.getLocation())
                        .isOverdue(isOverdue)
                        .build());
            }

            // Find latest or next appointment for summary card
            DoctorAppointment appt = appts.get(0);
            for (DoctorAppointment a : appts) {
                if (a.getAppointmentDate() != null && !a.getAppointmentDate().isBefore(today)) {
                    appt = a;
                    break;
                }
            }
            doctorApptId = appt.getId();
            doctorName = appt.getDoctorName() != null ? appt.getDoctorName() : "--";
            appointmentType = appt.getAppointmentType() != null ? appt.getAppointmentType() : "--";
            if (appt.getAppointmentDate() != null) {
                appointmentDate = appt.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd/MM"));
                isDoctorApptOverdue = today.isAfter(appt.getAppointmentDate());
            }
            appointmentTime = appt.getAppointmentTime() != null ? appt.getAppointmentTime() : "--";
            location = appt.getLocation() != null ? appt.getLocation() : "--";
        }

        // Medications
        List<RemindersResponse.MedicationDto> medDtos = meds.stream().map(m -> {
            boolean taken = Boolean.TRUE.equals(m.getTaken());
            // Reset taken status if it was taken on a previous day
            if (taken && m.getLastTakenDate() != null && !m.getLastTakenDate().isEqual(today)) {
                taken = false;
            }
            return RemindersResponse.MedicationDto.builder()
                    .id(m.getId())
                    .name(m.getMedicationName())
                    .description(m.getDescription())
                    .timeOfDay(m.getTimeOfDay())
                    .taken(taken)
                    .build();
        }).collect(Collectors.toList());

        return RemindersResponse.builder()
                .bpTarget(bpTarget)
                .activeMins(activeMins)
                .bpWeekRange(bpWeekRange)
                .isBpGoalOverdue(isBpGoalOverdue)
                .fatTarget(fatTarget)
                .sugarTarget(sugarTarget)
                .weightTarget(weightTarget)
                .nutritionWeekRange(nutritionWeekRange)
                .isNutritionGoalOverdue(isNutritionGoalOverdue)
                .doctorApptId(doctorApptId)
                .doctorName(doctorName)
                .appointmentType(appointmentType)
                .appointmentDate(appointmentDate)
                .appointmentTime(appointmentTime)
                .appointmentLocation(location)
                .isDoctorApptOverdue(isDoctorApptOverdue)
                .doctorAppointments(doctorApptDtos)
                .medications(medDtos)
                .build();
    }

    private void parseAndSetDates(HealthGoal goal, String weekRange) {
        if (weekRange == null || !weekRange.contains("-")) return;
        try {
            String[] parts = weekRange.split("-");
            String startStr = parts[0].trim();
            String endStr = parts[1].trim();
            int currentYear = LocalDate.now().getYear();

            String[] startParts = startStr.split("/");
            String[] endParts = endStr.split("/");

            if (startParts.length == 2 && endParts.length == 2) {
                LocalDate start = LocalDate.of(currentYear, Integer.parseInt(startParts[1]), Integer.parseInt(startParts[0]));
                LocalDate end = LocalDate.of(currentYear, Integer.parseInt(endParts[1]), Integer.parseInt(endParts[0]));
                goal.setStartDate(start);
                goal.setEndDate(end);
            }
        } catch (Exception ignored) {}
    }
}
