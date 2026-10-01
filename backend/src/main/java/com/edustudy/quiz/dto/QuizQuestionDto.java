package com.edustudy.quiz.dto;

import com.edustudy.quiz.entity.QuizQuestion;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionDto {
    private Long id;
    private Long quizId;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    private String questionType;
    private String imageUrl;
    private String chartConfig;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer; // Hidden for students taking quiz, revealed upon submission/admin
    private String explanation; // Solution explanation with LaTeX and steps
    private Integer points;
    private Integer sortOrder;

    public static QuizQuestionDto fromEntity(QuizQuestion q, boolean includeAnswer) {
        return QuizQuestionDto.builder()
                .id(q.getId())
                .quizId(q.getQuiz() != null ? q.getQuiz().getId() : null)
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .imageUrl(q.getImageUrl())
                .chartConfig(q.getChartConfig())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctAnswer(includeAnswer ? q.getCorrectAnswer() : null)
                .explanation(includeAnswer ? q.getExplanation() : null)
                .points(q.getPoints())
                .sortOrder(q.getSortOrder())
                .build();
    }
}
