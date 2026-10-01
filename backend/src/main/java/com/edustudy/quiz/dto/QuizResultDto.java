package com.edustudy.quiz.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDto {
    private Long submissionId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer totalPoints;
    private Integer correctCount;
    private Integer totalQuestions;
    private Double percentage;
    private Boolean passed;
    private Integer timeSpentSeconds;
    private Map<Long, String> userAnswers;
    private List<QuizQuestionDto> questionsWithExplanations;

    // Field for direct student UI review
    private List<QuizQuestionResultDto> questionResults;

    // Teacher essay grading & feedback
    private Boolean isGraded;
    private String teacherFeedback;
    private Integer teacherScore;
    private String gradedBy;
    private java.time.LocalDateTime gradedAt;

    // Cài đặt hiển thị: có cho học sinh xem đáp án đúng & lời giải sau khi nộp không
    @Builder.Default
    private Boolean showAnswers = true;

    // Cài đặt hiển thị: có cho học sinh xem điểm số sau khi nộp không.
    // Khi false: ẩn điểm, phần trăm, kết quả và đáp án (frontend chỉ báo "đã nộp").
    @Builder.Default
    private Boolean showScore = true;

    // Alias for frontend compatibility (matches maxScore in student runner)
    public Integer getMaxScore() {
        return totalPoints;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizQuestionResultDto {
        private Long questionId;
        private String questionText;
        private String questionType;
        private String imageUrl;
        private String chartConfig;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String userAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private String explanation;
        private Integer pointsEarned;
        private Integer maxPoints;
        private Map<String, Boolean> subResults;
        private Integer subCorrectCount;
        private String essayAnswer;

        // Chấm tự luận theo từng câu
        private String teacherComment;   // nhận xét riêng của giáo viên cho câu này
        private Boolean pendingGrade;     // true nếu câu tự luận chưa được chấm
    }
}
