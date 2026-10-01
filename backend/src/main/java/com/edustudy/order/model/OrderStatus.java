package com.edustudy.order.model;

public enum OrderStatus {
    PENDING,    // Chờ thanh toán
    PAID,       // Đã thanh toán & Đã kích hoạt khóa học
    CANCELLED   // Đã hủy / Hết hạn
}
