package com.edustudy.quiz.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.quiz.dto.QuizDto;
import com.edustudy.quiz.dto.QuizQuestionDto;
import com.edustudy.quiz.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Quiz", description = "API quản trị bài kiểm tra & câu hỏi trắc nghiệm bài học")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminQuizController {

    private final QuizService quizService;

    // ==========================================
    // QUIZ CRUD
    // ==========================================

    @Operation(summary = "Lấy danh sách các bài quiz của bài học cho Admin (kèm đầy đủ câu hỏi và đáp án)")
    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getLessonQuizzesForAdmin(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizzesByLesson(lessonId, true)));
    }

    @Operation(summary = "Lấy chi tiết bài quiz cho Admin")
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizForAdmin(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizById(quizId, true)));
    }

    @Operation(summary = "Tạo bài quiz mới cho bài học")
    @PostMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<ApiResponse<QuizDto>> createQuiz(
            @PathVariable Long lessonId,
            @Valid @RequestBody QuizDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.createQuiz(lessonId, dto), "Tạo bài kiểm tra thành công"));
    }

    @Operation(summary = "Cập nhật thông tin bài quiz")
    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<QuizDto>> updateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.updateQuiz(quizId, dto), "Cập nhật bài kiểm tra thành công"));
    }

    @Operation(summary = "Xóa bài quiz")
    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa bài kiểm tra thành công"));
    }

    // ==========================================
    // QUESTION CRUD
    // ==========================================

    @Operation(summary = "Thêm câu hỏi mới vào bài quiz (hỗ trợ công thức LaTeX, ảnh, biểu đồ)")
    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<ApiResponse<QuizQuestionDto>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizQuestionDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.addQuestion(quizId, dto), "Thêm câu hỏi thành công"));
    }

    @Operation(summary = "Thêm hàng loạt câu hỏi vào bài quiz (nhập đề tự động từ Word / Text)")
    @PostMapping("/quizzes/{quizId}/questions/batch")
    public ResponseEntity<ApiResponse<List<QuizQuestionDto>>> addQuestionsBatch(
            @PathVariable Long quizId,
            @RequestBody List<QuizQuestionDto> dtoList) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.addQuestionsBatch(quizId, dtoList), "Nhập danh sách câu hỏi thành công"));
    }

    @Operation(summary = "Cập nhật câu hỏi")
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuizQuestionDto>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody QuizQuestionDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.updateQuestion(questionId, dto), "Cập nhật câu hỏi thành công"));
    }

    @Operation(summary = "Xóa câu hỏi")
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa câu hỏi thành công"));
    }

    // ==========================================
    // ESSAY GRADING & SUBMISSIONS REVIEW
    // ==========================================

    @Operation(summary = "Lấy danh sách các bài nộp của bài quiz để giáo viên chấm điểm")
    @GetMapping("/quizzes/{quizId}/submissions")
    public ResponseEntity<ApiResponse<List<com.edustudy.quiz.dto.QuizSubmissionAdminDto>>> getQuizSubmissions(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizSubmissions(quizId)));
    }

    @Operation(summary = "Lấy chi tiết bài nộp của học sinh (kèm câu trả lời tự luận và trắc nghiệm)")
    @GetMapping("/quizzes/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<com.edustudy.quiz.dto.QuizSubmissionAdminDto>> getSubmissionDetail(@PathVariable Long submissionId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getSubmissionDetail(submissionId)));
    }

    @Operation(summary = "Giáo viên chấm điểm bài tự luận và gửi lời phê/nhận xét")
    @PutMapping("/quizzes/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<com.edustudy.quiz.dto.QuizSubmissionAdminDto>> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody com.edustudy.quiz.dto.GradeSubmissionRequest request,
            org.springframework.security.core.Authentication authentication) {
        String teacherEmail = authentication != null ? authentication.getName() : "Giáo viên";
        return ResponseEntity.ok(ApiResponse.ok(
                quizService.gradeSubmission(submissionId, request, teacherEmail),
                "Chấm điểm và gửi nhận xét thành công"
        ));
    }
}
