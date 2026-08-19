package com.hearthealth.backend.repository;

import com.hearthealth.backend.entity.DoctorAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAppointmentRepository extends JpaRepository<DoctorAppointment, Long> {
    List<DoctorAppointment> findByUserIdOrderByIdDesc(Long userId);
    List<DoctorAppointment> findByUserIdOrderByAppointmentDateAsc(Long userId);
    Optional<DoctorAppointment> findFirstByUserIdOrderByAppointmentDateDesc(Long userId);
}
