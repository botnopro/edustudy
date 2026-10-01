package com.edustudy.admin.controller;

import com.edustudy.admin.dto.StudentDto;
import com.edustudy.admin.dto.StudentRequest;
import com.edustudy.admin.service.AdminStudentService;
import com.edustudy.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Students", description = "API quản trị Học sinh & Sinh viên toàn diện dành cho Admin")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminStudentController {

    private final AdminStudentService studentService;

    @Operation(summary = "Lấy danh sách tất cả học sinh / sinh viên")
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentDto>>> getAllStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer gradeLevel) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getAllStudents(keyword, gradeLevel)));
    }

    @Operation(summary = "Lấy danh sách học sinh theo trang (lọc theo từ khóa, khối lớp)")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<com.edustudy.common.PageResponse<StudentDto>>> getStudentsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer gradeLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentsPage(keyword, gradeLevel, page, size)));
    }

    @Operation(summary = "Thống kê tổng quan học sinh")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getStudentsStats() {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentsStats()));
    }

    @Operation(summary = "Lấy thông tin chi tiết học sinh kèm khóa học và lịch sử làm bài")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentById(id)));
    }

    @Operation(summary = "Thêm mới tài khoản học sinh")
    @PostMapping
    public ResponseEntity<ApiResponse<StudentDto>> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.createStudent(request), "Thêm học sinh thành công"));
    }

    @Operation(summary = "Cập nhật thông tin học sinh hoặc đổi mật khẩu")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.updateStudent(id, request), "Cập nhật học sinh thành công"));
    }

    @Operation(summary = "Xóa tài khoản học sinh")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa tài khoản học sinh thành công"));
    }

    @Operation(summary = "Gán trực tiếp khóa học cho học sinh (không cần mã kích hoạt)")
    @PostMapping("/{id}/assign-course/{courseId}")
    public ResponseEntity<ApiResponse<Void>> assignCourse(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        studentService.assignCourse(id, courseId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Gán khóa học thành công"));
    }

    @Operation(summary = "Thu hồi quyền truy cập khóa học của học sinh")
    @DeleteMapping("/{id}/revoke-course/{courseId}")
    public ResponseEntity<ApiResponse<Void>> revokeCourse(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        studentService.revokeCourse(id, courseId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Thu hồi khóa học thành công"));
    }

    @Operation(summary = "Khóa hoặc Mở khóa tài khoản học sinh")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<StudentDto>> toggleStudentStatus(@PathVariable Long id) {
        StudentDto updated = studentService.toggleStudentStatus(id);
        String msg = Boolean.TRUE.equals(updated.getActive()) ? "Mở khóa tài khoản thành công" : "Đã khóa tài khoản học sinh";
        return ResponseEntity.ok(ApiResponse.ok(updated, msg));
    }

    @Operation(summary = "Đặt lại mật khẩu cho học sinh")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetStudentPassword(
            @PathVariable Long id,
            @RequestBody(required = false) com.edustudy.admin.dto.ResetPasswordRequest request) {
        String newPass = (request != null) ? request.getNewPassword() : null;
        studentService.resetStudentPassword(id, newPass);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đặt lại mật khẩu học sinh thành công"));
    }
}
