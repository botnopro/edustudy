package com.edustudy.admin.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.course.dto.CourseDto;
import com.edustudy.course.dto.CourseRequest;
import com.edustudy.course.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Courses", description = "Quản trị Thêm, Sửa, Xóa khóa học")
public class AdminCourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Lấy tất cả các khóa học trong hệ thống")
    public ApiResponse<List<CourseDto>> getAllCourses() {
        return ApiResponse.ok(courseService.getAllCoursesForAdmin());
    }

    @PostMapping
    @Operation(summary = "Tạo khóa học mới (Lớp 10, 11, 12...)")
    public ApiResponse<CourseDto> createCourse(@Valid @RequestBody CourseRequest request) {
        return ApiResponse.ok(courseService.createCourse(request), "Thêm khóa học thành công");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Chỉnh sửa thông tin khóa học")
    public ApiResponse<CourseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return ApiResponse.ok(courseService.updateCourse(id, request), "Cập nhật khóa học thành công");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa khóa học")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ApiResponse.ok(null, "Xóa khóa học thành công");
    }

    // ==========================================
    // LESSON MANAGEMENT PER COURSE
    // ==========================================

    @PostMapping("/{id}/lessons")
    @Operation(summary = "Thêm bài học mới vào khóa học (Video, tài liệu, thời lượng)")
    public ApiResponse<com.edustudy.course.dto.LessonDto> addLesson(
            @PathVariable Long id,
            @Valid @RequestBody com.edustudy.course.dto.LessonDto dto) {
        return ApiResponse.ok(courseService.addLessonToCourse(id, dto), "Thêm bài học thành công");
    }

    @PutMapping("/lessons/{lessonId}")
    @Operation(summary = "Chỉnh sửa bài học")
    public ApiResponse<com.edustudy.course.dto.LessonDto> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody com.edustudy.course.dto.LessonDto dto) {
        return ApiResponse.ok(courseService.updateLesson(lessonId, dto), "Cập nhật bài học thành công");
    }

    @DeleteMapping("/lessons/{lessonId}")
    @Operation(summary = "Xóa bài học khỏi khóa học")
    public ApiResponse<Void> deleteLesson(@PathVariable Long lessonId) {
        courseService.deleteLesson(lessonId);
        return ApiResponse.ok(null, "Xóa bài học thành công");
    }

    // ==========================================
    // COURSE LEADERBOARD
    // ==========================================

    @GetMapping("/{id}/leaderboard")
    @Operation(summary = "Bảng xếp hạng học sinh của khóa học")
    public ApiResponse<List<com.edustudy.course.dto.CourseStudentLeaderboardDto>> getCourseLeaderboard(@PathVariable Long id) {
        return ApiResponse.ok(courseService.getCourseLeaderboard(id));
    }

    // ==========================================
    // COURSE STUDENTS ROSTER
    // ==========================================

    @GetMapping("/{id}/students")
    @Operation(summary = "Lấy danh sách học sinh đang tham gia khóa học")
    public ApiResponse<List<com.edustudy.course.dto.CourseStudentDto>> getCourseStudents(@PathVariable Long id) {
        return ApiResponse.ok(courseService.getStudentsByCourseId(id));
    }

    @PostMapping("/{id}/students/{studentId}")
    @Operation(summary = "Admin thêm trực tiếp học sinh vào khóa học (vào học ngay tức thì)")
    public ApiResponse<com.edustudy.course.dto.CourseStudentDto> addStudentToCourse(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        return ApiResponse.ok(courseService.addStudentToCourse(id, studentId), "Đã thêm học sinh vào lớp học thành công");
    }

    @DeleteMapping("/{id}/students/{studentId}")
    @Operation(summary = "Admin xóa học sinh ra khỏi khóa học (thu hồi quyền vào học)")
    public ApiResponse<Void> removeStudentFromCourse(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        courseService.removeStudentFromCourse(id, studentId);
        return ApiResponse.ok(null, "Đã xóa học sinh khỏi khóa học");
    }
}
