package com.edustudy.quiz.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.quiz.dto.QuizDto;
import com.edustudy.quiz.dto.QuizResultDto;
import com.edustudy.quiz.dto.QuizSubmitRequest;
import com.edustudy.quiz.service.QuizService;
import com.edustudy.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Quiz", description = "API làm bài tập và trắc nghiệm củng cố bài học")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @Operation(summary = "Lấy danh sách các bài quiz của bài học")
    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getLessonQuizzes(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizzesByLesson(lessonId, false)));
    }

    @Operation(summary = "Lấy chi tiết bài quiz để làm bài (đáp án đúng được ẩn)")
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizDetails(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizById(quizId, false)));
    }

    @Operation(summary = "Nộp bài quiz và nhận kết quả tức thì cùng lời giải chi tiết")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizSubmitRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            userId = 0L;
        }
        return ResponseEntity.ok(ApiResponse.ok(quizService.submitQuiz(quizId, userId, request), "Nộp bài thành công"));
    }

    @Operation(summary = "Lấy kết quả nộp bài gần nhất của học viên")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/quizzes/{quizId}/my-result")
    public ResponseEntity<ApiResponse<QuizResultDto>> getMyLatestResult(@PathVariable Long quizId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            userId = 0L;
        }
        return ResponseEntity.ok(ApiResponse.ok(quizService.getUserLatestResult(quizId, userId).orElse(null)));
    }
}
