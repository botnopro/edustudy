package com.edustudy.quiz.dto;

import com.edustudy.quiz.entity.Quiz;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDto {
    private Long id;
    private Long lessonId;
    private String lessonTitle;

    @NotBlank(message = "Tiêu đề bài kiểm tra không được để trống")
    private String title;

    private String description;
    private Integer timeLimitMinutes;
    private Integer passingScore;
    private Boolean isActive;
    private Boolean shuffleQuestions;
    private Boolean showAnswers;
    private Boolean showScore;
    private Integer sortOrder;
    private Integer questionCount;

    @Builder.Default
    private List<QuizQuestionDto> questions = new ArrayList<>();

    public static QuizDto fromEntity(Quiz quiz, boolean includeAnswers) {
        List<QuizQuestionDto> qDtos = quiz.getQuestions() != null
                ? quiz.getQuestions().stream().map(q -> QuizQuestionDto.fromEntity(q, includeAnswers)).toList()
                : new ArrayList<>();

        return QuizDto.builder()
                .id(quiz.getId())
                .lessonId(quiz.getLesson() != null ? quiz.getLesson().getId() : null)
                .lessonTitle(quiz.getLesson() != null ? quiz.getLesson().getTitle() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScore(quiz.getPassingScore())
                .isActive(quiz.getIsActive())
                .shuffleQuestions(quiz.getShuffleQuestions())
                .showAnswers(quiz.getShowAnswers())
                .showScore(quiz.getShowScore())
                .sortOrder(quiz.getSortOrder())
                .questionCount(qDtos.size())
                .questions(qDtos)
                .build();
    }
}
