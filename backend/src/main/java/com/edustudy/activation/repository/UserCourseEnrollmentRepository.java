package com.edustudy.activation.repository;

import com.edustudy.activation.entity.UserCourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseEnrollmentRepository extends JpaRepository<UserCourseEnrollment, Long> {
    Optional<UserCourseEnrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    Optional<UserCourseEnrollment> findByUserIdAndCourseIdAndStatus(Long userId, Long courseId, String status);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, String status);
    List<UserCourseEnrollment> findByUserIdOrderByActivatedAtDesc(Long userId);
    List<UserCourseEnrollment> findByCourseId(Long courseId);
    List<UserCourseEnrollment> findTop10ByOrderByActivatedAtDesc();
    long countByCourseId(Long courseId);
}
