package com.edustudy.category.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "10", "11", "12", "DGNL", "TSA", "9"

    @Column(nullable = false, length = 100)
    private String name; // e.g. "Lớp 12", "Lớp 11", "ĐGNL HSA", "ĐGTD Bách Khoa"

    @Column(length = 300)
    private String description;

    @Column(length = 50)
    private String icon; // e.g. "GraduationCap", "BookOpen", "Target"

    @Column(length = 50)
    private String badge; // e.g. "THPT", "ĐGNL", "Mới"

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
