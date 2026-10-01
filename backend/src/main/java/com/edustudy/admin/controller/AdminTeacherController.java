package com.edustudy.admin.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.teacher.TeacherService;
import com.edustudy.teacher.dto.TeacherDto;
import com.edustudy.teacher.dto.TeacherRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/teachers")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Teachers", description = "Quản trị Thêm, Sửa, Xóa giáo viên")
public class AdminTeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Lấy tất cả danh sách giáo viên")
    public ApiResponse<List<TeacherDto>> getAllTeachers() {
        return ApiResponse.ok(teacherService.getAllTeachersForAdmin());
    }

    @PostMapping
    @Operation(summary = "Thêm giáo viên mới")
    public ApiResponse<TeacherDto> createTeacher(@Valid @RequestBody TeacherRequest request) {
        return ApiResponse.ok(teacherService.createTeacher(request), "Thêm giáo viên thành công");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin giáo viên")
    public ApiResponse<TeacherDto> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        return ApiResponse.ok(teacherService.updateTeacher(id, request), "Cập nhật thông tin giáo viên thành công");
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Khóa hoặc Mở khóa hoạt động của giáo viên")
    public ApiResponse<TeacherDto> toggleTeacherStatus(@PathVariable Long id) {
        TeacherDto updated = teacherService.toggleTeacherStatus(id);
        String msg = Boolean.TRUE.equals(updated.getIsActive()) ? "Đã kích hoạt hồ sơ giáo viên" : "Đã tạm ẩn hồ sơ giáo viên";
        return ApiResponse.ok(updated, msg);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giáo viên")
    public ApiResponse<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.ok(null, "Xóa giáo viên thành công");
    }
}
