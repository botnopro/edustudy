package com.edustudy.course.dto;

import com.edustudy.course.entity.Lesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {
    private Long id;
    private String chapterName;
    private String title;
    private Integer durationMinutes;
    private String videoUrl;
    private Boolean isFreePreview;
    private String materialUrl;
    private String materialName;
    private Integer sortOrder;

    public static LessonDto fromEntity(Lesson lesson) {
        if (lesson == null) return null;
        return LessonDto.builder()
                .id(lesson.getId())
                .chapterName(lesson.getChapterName())
                .title(lesson.getTitle())
                .durationMinutes(lesson.getDurationMinutes())
                .videoUrl(lesson.getVideoUrl())
                .isFreePreview(lesson.getIsFreePreview())
                .materialUrl(lesson.getMaterialUrl())
                .materialName(lesson.getMaterialName())
                .sortOrder(lesson.getSortOrder())
                .build();
    }
}
