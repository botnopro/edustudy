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
public class CreateOrderResponse {
    private String orderCode;
    private BigDecimal amount;
    private OrderStatus status;
    private String qrUrl;
    private Instant expiresAt;

    public static CreateOrderResponse fromOrder(Order order, String qrUrl) {
        return CreateOrderResponse.builder()
                .orderCode(order.getOrderCode())
                .amount(order.getAmount())
                .status(order.getStatus())
                .qrUrl(qrUrl)
                .expiresAt(order.getExpiresAt())
                .build();
    }
}
