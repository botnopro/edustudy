package com.edustudy.content.repository;

import com.edustudy.content.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByIsActiveTrueOrderBySortOrderAsc();
    List<Testimonial> findAllByOrderBySortOrderAsc();
}
