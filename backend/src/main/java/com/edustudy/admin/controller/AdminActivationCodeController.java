package com.edustudy.admin.controller;

import com.edustudy.activation.ActivationService;
import com.edustudy.activation.dto.ActivationCodeRequest;
import com.edustudy.activation.dto.BatchGenerateRequest;
import com.edustudy.activation.entity.ActivationCode;
import com.edustudy.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/activation-codes")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Activation Codes", description = "Quản lý và tạo mã kích hoạt khóa học")
public class AdminActivationCodeController {

    private final ActivationService activationService;

    @GetMapping
    @Operation(summary = "Lấy tất cả các mã kích hoạt trong hệ thống (dùng cho xuất Excel)")
    public ApiResponse<List<ActivationCode>> getAllCodes() {
        return ApiResponse.ok(activationService.getAllCodes());
    }

    @GetMapping("/paged")
    @Operation(summary = "Lấy mã kích hoạt theo trang (lọc theo từ khóa, khóa học, trạng thái)")
    public ApiResponse<com.edustudy.common.PageResponse<ActivationCode>> getCodesPaged(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(activationService.getCodesPage(search, courseId, status, page, size));
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê tổng quan mã kích hoạt")
    public ApiResponse<java.util.Map<String, Long>> getCodesStats() {
        return ApiResponse.ok(activationService.getCodesStats());
    }

    @PostMapping
    @Operation(summary = "Tạo một mã kích hoạt đơn lẻ")
    public ApiResponse<ActivationCode> createCode(@Valid @RequestBody ActivationCodeRequest request) {
        return ApiResponse.ok(activationService.createCode(request), "Tạo mã kích hoạt thành công");
    }

    @PostMapping("/batch")
    @Operation(summary = "Tạo hàng loạt mã kích hoạt cho một khóa học")
    public ApiResponse<List<ActivationCode>> batchGenerate(@Valid @RequestBody BatchGenerateRequest request) {
        return ApiResponse.ok(activationService.batchGenerate(request), "Tạo hàng loạt mã kích hoạt thành công");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin mã kích hoạt (hạn dùng, ghi chú, trạng thái)")
    public ApiResponse<ActivationCode> updateCode(
            @PathVariable Long id,
            @Valid @RequestBody com.edustudy.activation.dto.UpdateCodeRequest request) {
        return ApiResponse.ok(activationService.updateCode(id, request), "Cập nhật mã kích hoạt thành công");
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Khóa hoặc Mở khóa mã kích hoạt")
    public ApiResponse<ActivationCode> toggleCodeStatus(@PathVariable Long id) {
        ActivationCode updated = activationService.toggleCodeStatus(id);
        String msg = Boolean.TRUE.equals(updated.getIsActive()) ? "Đã mở khóa mã kích hoạt" : "Đã tạm khóa mã kích hoạt";
        return ApiResponse.ok(updated, msg);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mã kích hoạt")
    public ApiResponse<Void> deleteCode(@PathVariable Long id) {
        activationService.deleteCode(id);
        return ApiResponse.ok(null, "Xóa mã thành công");
    }
}
