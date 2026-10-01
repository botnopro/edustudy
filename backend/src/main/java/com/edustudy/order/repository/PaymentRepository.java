package com.edustudy.order.repository;

import com.edustudy.order.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsBySepayTransactionId(Long sepayTransactionId);
    Optional<Payment> findBySepayTransactionId(Long sepayTransactionId);
}
