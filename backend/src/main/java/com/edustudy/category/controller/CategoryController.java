package com.edustudy.category.controller;

import com.edustudy.category.dto.GradeDto;
import com.edustudy.category.dto.SubjectDto;
import com.edustudy.category.service.CategoryService;
import com.edustudy.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Categories", description = "API danh mục khối lớp & môn học công khai")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Lấy danh sách các khối lớp đang hoạt động")
    @GetMapping("/grades")
    public ResponseEntity<ApiResponse<List<GradeDto>>> getActiveGrades() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getActiveGrades()));
    }

    @Operation(summary = "Lấy danh sách các môn học đang hoạt động")
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getActiveSubjects() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getActiveSubjects()));
    }
}
