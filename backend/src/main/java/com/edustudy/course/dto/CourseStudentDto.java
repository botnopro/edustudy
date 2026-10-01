package com.edustudy.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudentDto {
    private Long enrollmentId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Integer gradeLevel;
    private String schoolName;
    private String activationCode;
    private Instant activatedAt;
    private Instant expiresAt;
    private Integer progressPercent;
    private Boolean active;
}
