package com.edustudy.course.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(name = "chapter_name", nullable = false, length = 150)
    private String chapterName;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Builder.Default
    @Column(name = "is_free_preview", nullable = false)
    private Boolean isFreePreview = false;

    // Có thể là URL ngắn hoặc chuỗi base64 (data URI) của file PDF tải lên → dùng TEXT
    @Column(name = "material_url", columnDefinition = "TEXT")
    private String materialUrl;

    @Column(name = "material_name", length = 200)
    private String materialName;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
