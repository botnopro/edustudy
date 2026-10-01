package com.edustudy.admin.dto;

import com.edustudy.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    private Integer gradeLevel;
    private String schoolName;
    private Boolean active;
    private Instant createdAt;
    private Integer enrolledCoursesCount;
    private Integer quizSubmissionsCount;
    private List<StudentEnrollmentDto> enrolledCourses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentEnrollmentDto {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String activationCode;
        private Instant activatedAt;
        private Instant expiresAt;
        private Integer progressPercent;
    }
}
