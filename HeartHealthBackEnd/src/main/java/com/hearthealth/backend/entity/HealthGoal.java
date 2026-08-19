package com.hearthealth.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_goals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bp_target")
    private String bpTarget;

    @Column(name = "active_mins")
    private Integer activeMins;

    @Column(name = "fat_target")
    private String fatTarget;

    @Column(name = "sugar_target")
    private String sugarTarget;

    @Column(name = "weight_target")
    private Double weightTarget;

    @Column(name = "week_range")
    private String weekRange;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
