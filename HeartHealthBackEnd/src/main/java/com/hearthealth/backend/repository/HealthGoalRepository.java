package com.hearthealth.backend.repository;

import com.hearthealth.backend.entity.HealthGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthGoalRepository extends JpaRepository<HealthGoal, Long> {
    List<HealthGoal> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<HealthGoal> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
