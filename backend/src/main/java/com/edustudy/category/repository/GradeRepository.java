package com.edustudy.category.repository;

import com.edustudy.category.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByIsActiveTrueOrderBySortOrderAsc();
    List<Grade> findAllByOrderBySortOrderAsc();
    Optional<Grade> findByCode(String code);
    boolean existsByCode(String code);
}
