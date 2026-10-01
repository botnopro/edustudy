package com.edustudy.teacher.dto;

import com.edustudy.teacher.Teacher;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDto {
    private Long id;
    private String name;
    private String title;
    private String subject;
    private String avatarUrl;
    private String bio;
    private Integer experienceYears;
    private Double rating;
    private Integer studentCount;
    private String achievements;
    private Integer sortOrder;
    private Boolean isActive;

    public static TeacherDto fromEntity(Teacher teacher) {
        if (teacher == null) return null;
        return TeacherDto.builder()
                .id(teacher.getId())
                .name(teacher.getName())
                .title(teacher.getTitle())
                .subject(teacher.getSubject())
                .avatarUrl(teacher.getAvatarUrl())
                .bio(teacher.getBio())
                .experienceYears(teacher.getExperienceYears())
                .rating(teacher.getRating())
                .studentCount(teacher.getStudentCount())
                .achievements(teacher.getAchievements())
                .sortOrder(teacher.getSortOrder())
                .isActive(teacher.getIsActive())
                .build();
    }
}
