package com.edustudy.quiz.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmission extends BaseEntity {

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    @Builder.Default
    @Column(nullable = false)
    private Boolean passed = false;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson; // e.g. {"1": "A", "2": "C"}

    // Điểm & nhận xét tự luận theo TỪNG câu: {"12": {"score": 8, "feedback": "..."}}
    @Column(name = "question_grades_json", columnDefinition = "TEXT")
    private String questionGradesJson;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "student_email")
    private String studentEmail;

    @Builder.Default
    @Column(name = "is_graded", nullable = false)
    private Boolean isGraded = true;

    @Column(name = "teacher_feedback", columnDefinition = "TEXT")
    private String teacherFeedback;

    @Column(name = "teacher_score")
    private Integer teacherScore;

    @Column(name = "graded_by")
    private String gradedBy;

    @Column(name = "graded_at")
    private java.time.LocalDateTime gradedAt;
}
