package com.edustudy.activation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActivateRequest {
    @NotBlank(message = "Vui lòng nhập mã kích hoạt")
    private String code;
}
