package com.edustudy.category.controller;

import com.edustudy.category.dto.GradeDto;
import com.edustudy.category.dto.SubjectDto;
import com.edustudy.category.service.CategoryService;
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

@Tag(name = "Admin Categories", description = "API quản trị khối lớp & môn học dành cho Admin")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminCategoryController {

    private final CategoryService categoryService;

    // ==========================================
    // GRADES CRUD
    // ==========================================

    @Operation(summary = "Lấy toàn bộ khối lớp (kể cả ẩn) cho Admin")
    @GetMapping("/grades")
    public ResponseEntity<ApiResponse<List<GradeDto>>> getAllGrades() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllGradesForAdmin()));
    }

    @Operation(summary = "Tạo khối lớp mới")
    @PostMapping("/grades")
    public ResponseEntity<ApiResponse<GradeDto>> createGrade(@Valid @RequestBody GradeDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.createGrade(dto), "Tạo khối lớp thành công"));
    }

    @Operation(summary = "Cập nhật thông tin khối lớp")
    @PutMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<GradeDto>> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateGrade(id, dto), "Cập nhật khối lớp thành công"));
    }

    @Operation(summary = "Xóa khối lớp")
    @DeleteMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable Long id) {
        categoryService.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa khối lớp thành công"));
    }

    // ==========================================
    // SUBJECTS CRUD
    // ==========================================

    @Operation(summary = "Lấy toàn bộ môn học (kể cả ẩn) cho Admin")
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAllSubjects() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllSubjectsForAdmin()));
    }

    @Operation(summary = "Tạo môn học mới")
    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@Valid @RequestBody SubjectDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.createSubject(dto), "Tạo môn học thành công"));
    }

    @Operation(summary = "Cập nhật thông tin môn học")
    @PutMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectDto>> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateSubject(id, dto), "Cập nhật môn học thành công"));
    }

    @Operation(summary = "Xóa môn học")
    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        categoryService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa môn học thành công"));
    }
}
