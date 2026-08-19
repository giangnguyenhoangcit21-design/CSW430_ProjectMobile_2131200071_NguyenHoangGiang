package com.hearthealth.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 255)
    private String email;


    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String avatar;

    private Integer age;

    private String gender;

    @Column(name = "screening_completed", nullable = false)
    @Builder.Default
    private Boolean screeningCompleted = false;

    @Column(nullable = false)
    private String role; // "USER", "ADMIN"

    @Column(nullable = false)
    private String status; // "ACTIVE", "INACTIVE"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
