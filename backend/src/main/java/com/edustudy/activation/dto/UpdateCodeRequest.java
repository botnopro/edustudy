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
public class UpdateCodeRequest {
    private String notes;
    private Instant expiresAt;
    private Integer maxUses;
    private Boolean isActive;
}
