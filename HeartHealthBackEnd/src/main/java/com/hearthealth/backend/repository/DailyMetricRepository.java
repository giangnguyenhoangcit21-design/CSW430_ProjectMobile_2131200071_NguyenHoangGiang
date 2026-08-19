package com.hearthealth.backend.repository;

import com.hearthealth.backend.entity.DailyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMetricRepository extends JpaRepository<DailyMetric, Long> {
    List<DailyMetric> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<DailyMetric> findByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<DailyMetric> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM DailyMetric d WHERE d.user.id = :userId AND d.createdAt >= :startDate ORDER BY d.createdAt ASC")
    List<DailyMetric> findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);
}
