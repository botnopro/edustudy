package com.edustudy.activation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class BatchGenerateRequest {
    @NotNull(message = "ID khóa học không được để trống")
    private Long courseId;

    @Min(value = 1, message = "Số lượng mã phải từ 1 trở lên")
    @Max(value = 100, message = "Số lượng mã tối đa là 100 mã một lần")
    private Integer quantity = 5;

    private String prefix; // e.g. "QANDA12-"
    private Integer maxUsesPerCode = 1;
    private Instant expiresAt;
    private String notes;
}
