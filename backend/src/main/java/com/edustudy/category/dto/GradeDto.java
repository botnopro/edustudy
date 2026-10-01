package com.edustudy.category.dto;

import com.edustudy.category.entity.Grade;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeDto {
    private Long id;

    @NotBlank(message = "Mã khối lớp không được để trống")
    private String code;

    @NotBlank(message = "Tên khối lớp không được để trống")
    private String name;

    private String description;
    private String icon;
    private String badge;
    private Integer sortOrder;
    private Boolean isActive;
    private Long courseCount;

    public static GradeDto fromEntity(Grade grade) {
        return GradeDto.builder()
                .id(grade.getId())
                .code(grade.getCode())
                .name(grade.getName())
                .description(grade.getDescription())
                .icon(grade.getIcon())
                .badge(grade.getBadge())
                .sortOrder(grade.getSortOrder())
                .isActive(grade.getIsActive())
                .build();
    }
}
