package com.edustudy.activation.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_course_enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourseEnrollment extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "course_title", length = 200)
    private String courseTitle;

    @Column(name = "activation_code", length = 50)
    private String activationCode;

    @Builder.Default
    @Column(name = "activated_at", nullable = false)
    private Instant activatedAt = Instant.now();

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Builder.Default
    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
}
