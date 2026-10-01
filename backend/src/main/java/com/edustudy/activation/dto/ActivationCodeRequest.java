package com.edustudy.activation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class ActivationCodeRequest {
    private String code;

    @NotNull(message = "ID khóa học không được để trống")
    private Long courseId;

    private Integer maxUses = 1;
    private Instant expiresAt;
    private Boolean isActive = true;
    private String notes;
}
