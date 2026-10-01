package com.edustudy.category.dto;

import com.edustudy.category.entity.Subject;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private Long id;

    @NotBlank(message = "Mã môn học không được để trống")
    private String code;

    @NotBlank(message = "Tên môn học không được để trống")
    private String name;

    private String description;
    private String icon;
    private String color;
    private Integer sortOrder;
    private Boolean isActive;
    private Long courseCount;

    public static SubjectDto fromEntity(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .code(subject.getCode())
                .name(subject.getName())
                .description(subject.getDescription())
                .icon(subject.getIcon())
                .color(subject.getColor())
                .sortOrder(subject.getSortOrder())
                .isActive(subject.getIsActive())
                .build();
    }
}
