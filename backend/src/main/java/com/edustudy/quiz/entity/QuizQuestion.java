package com.edustudy.quiz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Builder.Default
    @Column(name = "question_type", length = 30)
    private String questionType = "MULTIPLE_CHOICE";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl; // Supports image URLs or clipboard base64 data URLs

    @Column(name = "chart_config", columnDefinition = "TEXT")
    private String chartConfig; // JSON config for function curve or statistical chart

    @Column(name = "option_a", columnDefinition = "TEXT")
    private String optionA;

    @Column(name = "option_b", columnDefinition = "TEXT")
    private String optionB;

    @Column(name = "option_c", columnDefinition = "TEXT")
    private String optionC;

    @Column(name = "option_d", columnDefinition = "TEXT")
    private String optionD;

    @Column(name = "correct_answer", nullable = false, length = 255)
    private String correctAnswer; // "A", "B", "C", "D" or "TRUE"/"FALSE" or text answer

    @Column(columnDefinition = "TEXT")
    private String explanation; // Detailed solution with LaTeX formulas & steps

    @Builder.Default
    private Integer points = 10;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
