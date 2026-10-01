package com.edustudy.teacher.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeacherRequest {
    @NotBlank(message = "Tên giáo viên không được để trống")
    private String name;

    private String title;

    @NotBlank(message = "Môn học không được để trống")
    private String subject;

    private String avatarUrl;
    private String bio;
    private Integer experienceYears;
    private Double rating;
    private Integer studentCount;
    private String achievements;
    private Integer sortOrder;
    private Boolean isActive = true;
}
