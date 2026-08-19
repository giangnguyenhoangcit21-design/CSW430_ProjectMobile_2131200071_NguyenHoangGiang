package com.hearthealth.backend.repository;

import com.hearthealth.backend.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<HealthRecord> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
