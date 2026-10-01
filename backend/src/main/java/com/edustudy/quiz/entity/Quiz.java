package com.edustudy.quiz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.edustudy.common.BaseEntity;
import com.edustudy.course.entity.Lesson;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @JsonIgnore
    private Lesson lesson;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes = 15;

    @Builder.Default
    @Column(name = "passing_score")
    private Integer passingScore = 70; // percentage or points

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Xáo trộn thứ tự câu hỏi mỗi lần học sinh vào làm
    // Nullable ở DB để việc thêm cột vào bảng đã có dữ liệu (prod) không lỗi; code xử lý null = false
    @Builder.Default
    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions = false;

    // Hiện đáp án đúng & lời giải sau khi học sinh nộp bài; null = true (mặc định hiện)
    @Builder.Default
    @Column(name = "show_answers")
    private Boolean showAnswers = true;

    // Hiện điểm số cho học sinh sau khi nộp bài; null = true (mặc định hiện).
    // Khi tắt (false) thì ẩn luôn điểm, phần trăm, kết quả Đạt/Chưa đạt và đáp án.
    @Builder.Default
    @Column(name = "show_score")
    private Boolean showScore = true;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("sortOrder ASC")
    private List<QuizQuestion> questions = new ArrayList<>();
}
