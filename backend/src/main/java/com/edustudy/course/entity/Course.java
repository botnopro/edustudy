package com.edustudy.course.entity;

import com.edustudy.common.BaseEntity;
import com.edustudy.teacher.Teacher;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(nullable = false, length = 20)
    private String grade; // "10", "11", "12", "DGNL"

    @Column(nullable = false, length = 50)
    private String subject; // "TOAN", "VAT_LY", "HOA_HOC", "SINH_HOC", "TIENG_ANH", "NGU_VAN", "TONG_HOP"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "teacher_name", length = 100)
    private String teacherName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(length = 50)
    private String badge; // "HOT", "NEW", "BEST_SELLER", "PRO_2026"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_audience", length = 300)
    private String targetAudience;

    @Builder.Default
    @Column(name = "total_lessons")
    private Integer totalLessons = 60;

    @Builder.Default
    @Column(name = "total_hours")
    private Integer totalHours = 80;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    @Column(name = "student_count")
    private Integer studentCount = 1250;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "features_list", columnDefinition = "TEXT")
    private String featuresList; // Semicolon or comma-separated list of highlights

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("sortOrder ASC")
    private List<Lesson> lessons = new ArrayList<>();
}
