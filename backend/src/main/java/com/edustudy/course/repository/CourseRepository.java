package com.edustudy.course.repository;

import com.edustudy.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByIsActiveTrueOrderBySortOrderAsc();

    Optional<Course> findBySlug(String slug);

    Optional<Course> findBySlugAndIsActiveTrue(String slug);

    @Query("SELECT c FROM Course c WHERE c.isActive = true " +
           "AND (CAST(:grade AS string) IS NULL OR c.grade = :grade " +
           "     OR (c.grade = '12' AND :grade = 'LOP_12') OR (c.grade = 'LOP_12' AND :grade = '12') " +
           "     OR (c.grade = '11' AND :grade = 'LOP_11') OR (c.grade = 'LOP_11' AND :grade = '11') " +
           "     OR (c.grade = '10' AND :grade = 'LOP_10') OR (c.grade = 'LOP_10' AND :grade = '10')) " +
           "AND (CAST(:subject AS string) IS NULL OR c.subject = :subject) " +
           "AND (CAST(:keyword AS string) IS NULL OR (" +
           "     LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "     LOWER(c.teacherName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))) " +
           "ORDER BY c.sortOrder ASC")
    List<Course> searchCourses(@Param("grade") String grade,
                              @Param("subject") String subject,
                              @Param("keyword") String keyword);

    List<Course> findByGradeAndIsActiveTrueOrderBySortOrderAsc(String grade);

    List<Course> findByIsFeaturedTrueAndIsActiveTrueOrderBySortOrderAsc();

    long countByIsActiveTrue();
}
