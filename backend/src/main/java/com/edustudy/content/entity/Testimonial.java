package com.edustudy.content.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial extends BaseEntity {

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(length = 150)
    private String school; // e.g. "Chuyên Sư Phạm Hà Nội", "THPT Lê Hồng Phong"

    @Column(length = 100)
    private String score; // e.g. "29.25 Khối A00 (Toán 9.8, Lý 9.75, Hóa 9.7)"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "target_exam", length = 100)
    private String targetExam; // "Thủ khoa ĐH Ngoại Thương", "Đỗ Y Hà Nội"

    @Column(name = "course_name", length = 200)
    private String courseName; // "Khóa PRO-X Luyện thi THPT QG"

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
