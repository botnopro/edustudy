package com.edustudy.category.repository;

import com.edustudy.category.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByIsActiveTrueOrderBySortOrderAsc();
    List<Subject> findAllByOrderBySortOrderAsc();
    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);
}
