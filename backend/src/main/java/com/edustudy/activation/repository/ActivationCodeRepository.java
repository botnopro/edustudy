package com.edustudy.activation.repository;

import com.edustudy.activation.entity.ActivationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivationCodeRepository extends JpaRepository<ActivationCode, Long> {
    Optional<ActivationCode> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<ActivationCode> findByCourseId(Long courseId);
    List<ActivationCode> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    List<ActivationCode> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);
    List<ActivationCode> findAllByOrderByCreatedAtDesc();
    long countByIsActiveTrue();
    long countByUsedCountGreaterThan(Integer usedCount);
}
