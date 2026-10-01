package com.edustudy.category.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "TOAN", "VAT_LY", "HOA_HOC", "SINH_HOC", "TIENG_ANH", "NGU_VAN", "LICH_SU", "DIA_LY", "TIN_HOC"

    @Column(nullable = false, length = 100)
    private String name; // e.g. "Toán Học", "Vật Lý", "Hóa Học", "Sinh Học"

    @Column(length = 300)
    private String description;

    @Column(length = 50)
    private String icon; // e.g. "Calculator", "Zap", "FlaskConical", "Dna", "Globe", "BookMarked"

    @Column(length = 30)
    private String color; // e.g. "#EF4401", "#3B82F6", "#10B981"

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
