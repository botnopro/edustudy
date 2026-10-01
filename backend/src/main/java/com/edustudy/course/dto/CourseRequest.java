package com.edustudy.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CourseRequest {

    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    private String title;

    private String slug;

    @NotBlank(message = "Khối lớp không được để trống (10, 11, 12, DGNL)")
    private String grade;

    @NotBlank(message = "Môn học không được để trống")
    private String subject;

    private Long teacherId;
    private String teacherName;

    @NotNull(message = "Giá khóa học không được để trống")
    private BigDecimal price;

    private BigDecimal originalPrice;
    private Integer discountPercent;
    private String thumbnailUrl;
    private String badge;
    private String description;
    private String targetAudience;
    private Integer totalLessons;
    private Integer totalHours;
    private Double rating;
    private Integer studentCount;
    private Boolean isActive = true;
    private Boolean isFeatured = false;
    private Integer sortOrder = 0;
    private String featuresList;
    private List<LessonDto> lessons;
}
