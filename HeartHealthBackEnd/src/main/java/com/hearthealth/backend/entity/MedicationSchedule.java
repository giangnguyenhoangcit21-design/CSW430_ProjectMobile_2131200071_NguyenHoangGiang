package com.hearthealth.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "medication_name", nullable = false)
    private String medicationName;

    private String description;

    @Column(name = "time_of_day")
    private String timeOfDay; // "Sáng", "Trưa", "Chiều", "Tối"

    @Builder.Default
    private Boolean taken = false;

    @Column(name = "last_taken_date")
    private LocalDate lastTakenDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
