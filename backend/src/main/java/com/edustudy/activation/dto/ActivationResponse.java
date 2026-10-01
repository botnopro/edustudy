package com.edustudy.activation.dto;

import com.edustudy.course.dto.CourseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivationResponse {
    private boolean success;
    private String message;
    private String activationCode;
    private CourseDto course;
    private Instant activatedAt;
    private Instant expiresAt;
}
