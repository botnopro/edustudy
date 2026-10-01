package com.edustudy.content.repository;

import com.edustudy.content.entity.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqItemRepository extends JpaRepository<FaqItem, Long> {
    List<FaqItem> findByIsActiveTrueOrderBySortOrderAsc();
    List<FaqItem> findByCategoryAndIsActiveTrueOrderBySortOrderAsc(String category);
    List<FaqItem> findAllByOrderBySortOrderAsc();
}
