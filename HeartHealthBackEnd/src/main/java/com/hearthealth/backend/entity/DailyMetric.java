package com.hearthealth.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "daily_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "sys_bp")
    private Integer sysBP;

    @Column(name = "dia_bp")
    private Integer diaBP;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "heart_rate")
    private Integer heartRate;

    private Integer spo2;

    private Integer cholesterol;

    @Column(name = "blood_sugar")
    private Double bloodSugar;

    private Double weight;

    private String source; // "SCREENING", "DAILY_UPDATE"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
