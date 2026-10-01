package com.edustudy.activation.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "activation_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivationCode extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "Edu12-TOAN", "VIP2026-PHYSICS"

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "course_title", length = 200)
    private String courseTitle;

    @Builder.Default
    @Column(name = "max_uses", nullable = false)
    private Integer maxUses = 1;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "used_by_user_id")
    private Long usedByUserId;

    @Column(name = "used_by_email", length = 100)
    private String usedByEmail;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "batch_id", length = 50)
    private String batchId;

    @Column(length = 200)
    private String notes; // e.g. "Mã tặng kèm sách Công Phá Vật Lý 12"

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isExhausted() {
        return usedCount >= maxUses;
    }

    public boolean canRedeem() {
        return isActive && !isExpired() && !isExhausted();
    }
}
