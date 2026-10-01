package com.edustudy.course.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseStudentLeaderboardDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Instant activatedAt;
    private Integer quizzesCompleted;
    private Integer totalScore;
    private Double averagePercentage;
    private Integer rank;
}
