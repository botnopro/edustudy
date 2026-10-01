package com.edustudy.quiz.dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmissionAdminDto {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private Long lessonId;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private Integer score;
    private Integer totalPoints;
    private Boolean passed;
    private Double percentage;
    private Integer timeSpentSeconds;
    private String answersJson;
    private Boolean isGraded;
    private String teacherFeedback;
    private Integer teacherScore;
    private String gradedBy;
    private LocalDateTime gradedAt;
    private Instant createdAt;
    private String questionGradesJson; // điểm & nhận xét tự luận từng câu (để prefill form chấm)
    private List<QuizResultDto.QuizQuestionResultDto> questionResults;
}
