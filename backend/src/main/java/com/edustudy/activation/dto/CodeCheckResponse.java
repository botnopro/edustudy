package com.edustudy.activation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeCheckResponse {
    private boolean valid;
    private String code;
    private Long courseId;
    private String courseTitle;
    private String teacherName;
    private String grade;
    private String subject;
    private String thumbnailUrl;
    private Instant expiresAt;
    private String statusMessage;
}
