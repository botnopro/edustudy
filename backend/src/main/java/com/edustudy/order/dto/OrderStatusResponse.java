package com.edustudy.order.dto;

import com.edustudy.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusResponse {
    private String orderCode;
    private OrderStatus status;
}
