package com.edustudy.quiz.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSubmissionRequest {

    // Điểm tổng (tùy chọn) - dùng khi chấm nhanh 1 điểm cho cả bài (tương thích cũ)
    @Min(value = 0, message = "Điểm số tối thiểu là 0")
    private Integer teacherScore;

    // Lời phê chung cho cả bài
    private String teacherFeedback;

    // Chấm điểm & nhận xét cho TỪNG câu tự luận
    private List<QuestionGrade> questionGrades;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionGrade {
        private Long questionId;
        @Min(value = 0, message = "Điểm câu tối thiểu là 0")
        private Integer score;
        private String feedback;
    }
}
