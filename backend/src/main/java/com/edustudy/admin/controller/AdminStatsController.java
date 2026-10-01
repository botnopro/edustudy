package com.edustudy.admin.controller;

import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.ActivationCodeRepository;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.common.ApiResponse;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.teacher.TeacherRepository;
import com.edustudy.user.Role;
import com.edustudy.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Stats", description = "Thống kê tổng quan hệ thống")
public class AdminStatsController {

    private final CourseRepository courseRepository;
    private final ActivationCodeRepository codeRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    @Data
    @Builder
    public static class AdminOverviewStats {
        private long totalCourses;
        private long totalTeachers;
        private long totalStudents;
        private long totalActivationCodes;
        private long totalActivations;
        private List<UserCourseEnrollment> recentActivations;
    }

    @GetMapping
    @Operation(summary = "Lấy các chỉ số tổng quan cho Dashboard quản trị")
    public ApiResponse<AdminOverviewStats> getOverviewStats() {
        AdminOverviewStats stats = AdminOverviewStats.builder()
                .totalCourses(courseRepository.count())
                .totalTeachers(teacherRepository.count())
                .totalStudents(userRepository.countByRole(Role.ROLE_STUDENT))
                .totalActivationCodes(codeRepository.count())
                .totalActivations(enrollmentRepository.count())
                .recentActivations(enrollmentRepository.findTop10ByOrderByActivatedAtDesc())
                .build();
        return ApiResponse.ok(stats);
    }
}
