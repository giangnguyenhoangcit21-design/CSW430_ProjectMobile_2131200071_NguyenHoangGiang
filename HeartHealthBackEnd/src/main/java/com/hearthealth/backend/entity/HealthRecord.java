package com.hearthealth.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer age;
    private String gender;
    
    @Column(name = "blood_pressure")
    private String bloodPressure;
    
    @Column(name = "heart_rate")
    private Integer heartRate;
    
    private Double weight;
    private Integer cholesterol;
    
    @Column(name = "chest_pain")
    private String chestPain;
    
    private String breathlessness;
    
    @Column(columnDefinition = "TEXT")
    private String comorbidities; // Stores JSON or comma-separated string
    
    @Column(name = "medications", columnDefinition = "TEXT")
    private String medications;

    @Column(name = "assessment_title")
    private String assessmentTitle;

    @Column(name = "assessment_color")
    private String assessmentColor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
