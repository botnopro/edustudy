package com.edustudy.order.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.order.dto.CreateOrderRequest;
import com.edustudy.order.dto.CreateOrderResponse;
import com.edustudy.order.dto.OrderDto;
import com.edustudy.order.dto.OrderStatusResponse;
import com.edustudy.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Orders & Payment", description = "API đặt mua khóa học, tạo mã VietQR và kiểm tra thanh toán")
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Tạo đơn mua khóa học & nhận mã VietQR thanh toán (POST /api/orders)", security = @SecurityRequirement(name = "Bearer Authentication"))
    @PostMapping("/api/orders")
    public ResponseEntity<CreateOrderResponse> createOrderApi(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderSimple(request));
    }

    @Operation(summary = "Tạo đơn mua khóa học & nhận mã VietQR thanh toán (/api/v1/orders/checkout)", security = @SecurityRequirement(name = "Bearer Authentication"))
    @PostMapping("/api/v1/orders/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> createOrderCheckout(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.createOrder(request), "Tạo đơn hàng mua khóa học thành công"));
    }

    @Operation(summary = "Kiểm tra trạng thái đơn hàng (GET /api/orders/{orderCode}/status)", security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping({"/api/orders/{orderCode}/status", "/api/v1/orders/{orderCode}/status"})
    public ResponseEntity<OrderStatusResponse> getOrderStatus(@PathVariable String orderCode) {
        return ResponseEntity.ok(orderService.getOrderStatus(orderCode));
    }

    @Operation(summary = "Lấy danh sách đơn hàng đã mua của học sinh", security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping({"/api/orders/my-orders", "/api/v1/orders/my-orders"})
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders()));
    }

    @Operation(summary = "Kiểm tra chi tiết đơn hàng theo mã đơn")
    @GetMapping({"/api/orders/check/{orderCode}", "/api/v1/orders/check/{orderCode}"})
    public ResponseEntity<ApiResponse<OrderDto>> checkOrderStatus(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.checkOrderStatus(orderCode)));
    }
}
