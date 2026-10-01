package com.edustudy.course.dto;

import com.edustudy.course.entity.Course;
import com.edustudy.teacher.dto.TeacherDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Long id;
    private String title;
    private String slug;
    private String grade;
    private String subject;
    private Long teacherId;
    private String teacherName;
    private TeacherDto teacher;
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
    private Boolean isActive;
    private Boolean isFeatured;
    private Integer sortOrder;
    private String featuresList;
    @Builder.Default
    private List<LessonDto> lessons = new ArrayList<>();

    public static CourseDto fromEntity(Course course) {
        if (course == null) return null;
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .grade(course.getGrade())
                .subject(course.getSubject())
                .teacherId(course.getTeacher() != null ? course.getTeacher().getId() : null)
                .teacherName(course.getTeacherName())
                .teacher(course.getTeacher() != null ? TeacherDto.fromEntity(course.getTeacher()) : null)
                .price(course.getPrice())
                .originalPrice(course.getOriginalPrice())
                .discountPercent(course.getDiscountPercent())
                .thumbnailUrl(course.getThumbnailUrl())
                .badge(course.getBadge())
                .description(course.getDescription())
                .targetAudience(course.getTargetAudience())
                .totalLessons(course.getTotalLessons())
                .totalHours(course.getTotalHours())
                .rating(course.getRating())
                .studentCount(course.getStudentCount())
                .isActive(course.getIsActive())
                .isFeatured(course.getIsFeatured())
                .sortOrder(course.getSortOrder())
                .featuresList(course.getFeaturesList())
                .lessons(course.getLessons() != null ?
                        course.getLessons().stream().map(LessonDto::fromEntity).toList() : new ArrayList<>())
                .build();
    }
}
