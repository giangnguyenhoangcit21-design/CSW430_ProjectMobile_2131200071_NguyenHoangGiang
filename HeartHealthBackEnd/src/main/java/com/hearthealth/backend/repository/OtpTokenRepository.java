package com.hearthealth.backend.repository;

import com.hearthealth.backend.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);


    @Transactional
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.email = :email AND o.purpose = :purpose")
    void deleteByEmailAndPurpose(String email, String purpose);



    @Transactional
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expirationTime < :now")
    void deleteByExpirationTimeBefore(LocalDateTime now);
}
