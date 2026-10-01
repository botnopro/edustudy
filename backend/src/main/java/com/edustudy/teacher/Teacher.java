package com.edustudy.teacher;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 150)
    private String title; // "Thủ khoa ĐH Sư Phạm Hà Nội", "Chuyên gia luyện thi Vật Lý"

    @Column(nullable = false, length = 50)
    private String subject; // "TOAN", "VAT_LY", "HOA_HOC", "SINH_HOC", "TIENG_ANH", "NGU_VAN"

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    @Column(name = "student_count")
    private Integer studentCount = 1000;

    @Column(length = 255)
    private String achievements;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
