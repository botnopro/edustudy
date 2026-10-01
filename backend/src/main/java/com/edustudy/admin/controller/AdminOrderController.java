package com.edustudy.admin.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.order.dto.OrderDto;
import com.edustudy.order.model.OrderStatus;
import com.edustudy.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin Orders", description = "Quản lý đơn hàng mua khóa học & Duyệt thanh toán tự động vào lớp")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "Lấy tất cả đơn hàng (lọc theo trạng thái, từ khóa)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(status, keyword)));
    }

    @Operation(summary = "Lấy đơn hàng theo trang (lọc theo trạng thái, từ khóa)")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<com.edustudy.common.PageResponse<OrderDto>>> getOrdersPaged(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersPage(status, keyword, page, size)));
    }

    @Operation(summary = "Thống kê tổng quan đơn hàng")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getOrdersStats() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersStats()));
    }

    @Operation(summary = "Admin xác nhận đã thanh toán -> Tự động duyệt học sinh vào lớp học ngay tức thì")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<OrderDto>> approveOrder(@PathVariable Long id) {
        OrderDto approved = orderService.approveOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(approved, "Đã xác nhận thanh toán thành công! Học sinh đã được tự động duyệt vào lớp học."));
    }

    @Operation(summary = "Admin hủy / từ chối đơn hàng")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.get("reason") : "Admin hủy đơn";
        return ResponseEntity.ok(ApiResponse.ok(orderService.cancelOrder(id, reason), "Đã hủy đơn hàng"));
    }

    @Operation(summary = "Đếm số đơn hàng đang chờ duyệt thanh toán")
    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.countPendingOrders()));
    }
}
