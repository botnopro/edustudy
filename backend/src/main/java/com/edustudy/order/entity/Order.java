package com.edustudy.order.entity;

import com.edustudy.common.BaseEntity;
import com.edustudy.order.model.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_code", columnList = "order_code", unique = true),
        @Index(name = "idx_order_user_id", columnList = "user_id"),
        @Index(name = "idx_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_full_name", length = 100)
    private String userFullName;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "user_phone", length = 30)
    private String userPhone;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "course_title", length = 200)
    private String courseTitle;

    @Column(name = "course_thumbnail", length = 500)
    private String courseThumbnail;

    @Column(nullable = false, precision = 12, scale = 2)
    private java.math.BigDecimal amount; // VNĐ

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "transfer_content", length = 100)
    private String transferContent; // Cú pháp: HOCPHI ORD1234

    @Column(length = 500)
    private String notes;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;
}
