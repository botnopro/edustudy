package com.edustudy.order.repository;

import com.edustudy.order.entity.Order;
import com.edustudy.order.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(CAST(:keyword AS string) IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "OR LOWER(o.userFullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "OR LOWER(o.userEmail) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "OR LOWER(o.courseTitle) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "OR o.userPhone LIKE CONCAT('%', CAST(:keyword AS string), '%')) " +
           "ORDER BY o.createdAt DESC")
    List<Order> searchOrders(@Param("status") OrderStatus status, @Param("keyword") String keyword);

    Optional<Order> findFirstByUserIdAndCourseIdAndStatus(Long userId, Long courseId, OrderStatus status);
}
