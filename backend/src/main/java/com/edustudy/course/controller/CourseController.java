package com.edustudy.course.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.course.dto.CourseDto;
import com.edustudy.course.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/courses", "/api/v1/courses"})
@RequiredArgsConstructor
@Tag(name = "Courses Public & Learning", description = "Xem, tìm kiếm và vào học khóa học")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Lấy danh sách khóa học hiển thị cho khách (lọc theo lớp, môn, từ khóa)")
    public ApiResponse<List<CourseDto>> getCourses(
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(courseService.getPublicCourses(grade, subject, keyword));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết khóa học theo ID")
    public ApiResponse<CourseDto> getCourseById(@PathVariable Long id) {
        return ApiResponse.ok(courseService.getCourseById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Xem chi tiết khóa học theo slug")
    public ApiResponse<CourseDto> getCourseBySlug(@PathVariable String slug) {
        return ApiResponse.ok(courseService.getCourseBySlug(slug));
    }

    @GetMapping("/{id}/learn")
    @Operation(summary = "Truy cập nội dung học của khóa học (Backend kiểm tra Enrollment ACTIVE)", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ApiResponse<CourseDto> getCourseForLearning(@PathVariable Long id) {
        return ApiResponse.ok(courseService.getCourseForLearning(id));
    }
}
