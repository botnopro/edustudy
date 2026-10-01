package com.edustudy.order.dto;

import com.edustudy.order.entity.Order;
import com.edustudy.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderCode;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userPhone;
    private Long courseId;
    private String courseTitle;
    private String courseThumbnail;
    private BigDecimal amount;
    private OrderStatus status;
    private String transferContent;
    private String notes;
    private Instant createdAt;
    private Instant paidAt;
    private Instant expiresAt;
    private String approvedBy;
    private String qrUrl;

    public static OrderDto fromEntity(Order order) {
        return fromEntity(order, null);
    }

    public static OrderDto fromEntity(Order order, String customQrUrl) {
        if (order == null) return null;

        String qr = customQrUrl;
        if (qr == null) {
            long amtLong = order.getAmount() != null ? order.getAmount().longValue() : 0L;
            qr = String.format(
                    "https://img.vietqr.io/image/970422-0988888888-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                    amtLong,
                    order.getOrderCode() != null ? order.getOrderCode() : "ORDER",
                    "CONG%20TY%20GIAO%20DUC%20Edu%20STUDY"
            );
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUserId())
                .userFullName(order.getUserFullName())
                .userEmail(order.getUserEmail())
                .userPhone(order.getUserPhone())
                .courseId(order.getCourseId())
                .courseTitle(order.getCourseTitle())
                .courseThumbnail(order.getCourseThumbnail())
                .amount(order.getAmount())
                .status(order.getStatus())
                .transferContent(order.getTransferContent())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .expiresAt(order.getExpiresAt())
                .approvedBy(order.getApprovedBy())
                .qrUrl(qr)
                .build();
    }
}
