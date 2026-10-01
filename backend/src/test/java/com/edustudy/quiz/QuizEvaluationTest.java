package com.edustudy.quiz;

import com.edustudy.quiz.entity.QuizQuestion;
import com.edustudy.quiz.service.QuizService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class QuizEvaluationTest {

    @Test
    @DisplayName("Multiple Choice: Khớp chính xác đáp án")
    void testMultipleChoice() {
        QuizQuestion q = QuizQuestion.builder()
                .questionType("MULTIPLE_CHOICE")
                .correctAnswer("B")
                .points(10)
                .build();

        var resCorrect = QuizService.evaluateQuestion(q, "B");
        assertTrue(resCorrect.isCorrect());
        assertEquals(10, resCorrect.pointsEarned());

        var resWrong = QuizService.evaluateQuestion(q, "C");
        assertFalse(resWrong.isCorrect());
        assertEquals(0, resWrong.pointsEarned());
    }

    @Test
    @DisplayName("True/False 4 options: Chuẩn công thức Bộ GD&ĐT 2025 (1 ý 10%, 2 ý 25%, 3 ý 50%, 4 ý 100%)")
    void testTrueFalse4_MinistryRule() {
        QuizQuestion q = QuizQuestion.builder()
                .questionType("TRUE_FALSE_4")
                .optionA("Ý a")
                .optionB("Ý b")
                .optionC("Ý c")
                .optionD("Ý d")
                .correctAnswer("T,F,T,T") // a: Đ, b: S, c: Đ, d: Đ
                .points(10)
                .build();

        // 4 ý đúng -> 100% = 10 điểm
        var res4 = QuizService.evaluateQuestion(q, "{\"a\":\"T\",\"b\":\"F\",\"c\":\"T\",\"d\":\"T\"}");
        assertTrue(res4.isCorrect());
        assertEquals(4, res4.subCorrectCount());
        assertEquals(10, res4.pointsEarned());

        // 3 ý đúng -> 50% = 5 điểm
        var res3 = QuizService.evaluateQuestion(q, "{\"a\":\"T\",\"b\":\"F\",\"c\":\"T\",\"d\":\"F\"}");
        assertFalse(res3.isCorrect());
        assertEquals(3, res3.subCorrectCount());
        assertEquals(5, res3.pointsEarned());

        // 2 ý đúng -> 25% = 3 điểm (làm tròn từ 2.5)
        var res2 = QuizService.evaluateQuestion(q, "{\"a\":\"T\",\"b\":\"T\",\"c\":\"T\",\"d\":\"F\"}");
        assertFalse(res2.isCorrect());
        assertEquals(2, res2.subCorrectCount());
        assertEquals(3, res2.pointsEarned());

        // 1 ý đúng -> 10% = 1 điểm
        var res1 = QuizService.evaluateQuestion(q, "{\"a\":\"T\",\"b\":\"T\",\"c\":\"F\",\"d\":\"F\"}");
        assertFalse(res1.isCorrect());
        assertEquals(1, res1.subCorrectCount());
        assertEquals(1, res1.pointsEarned());

        // 0 ý đúng -> 0 điểm
        var res0 = QuizService.evaluateQuestion(q, "{\"a\":\"F\",\"b\":\"T\",\"c\":\"F\",\"d\":\"F\"}");
        assertFalse(res0.isCorrect());
        assertEquals(0, res0.subCorrectCount());
        assertEquals(0, res0.pointsEarned());
    }

    @Test
    @DisplayName("Short Answer: Hỗ trợ đa đáp án tương đương (phân số, số thập phân dấu phẩy hoặc chấm)")
    void testShortAnswer() {
        QuizQuestion q = QuizQuestion.builder()
                .questionType("SHORT_ANSWER")
                .correctAnswer("0.5|0,5|1/2")
                .points(10)
                .build();

        // Học sinh gõ 0.5
        var res1 = QuizService.evaluateQuestion(q, "0.5");
        assertTrue(res1.isCorrect());
        assertEquals(10, res1.pointsEarned());

        // Học sinh gõ 0,5
        var res2 = QuizService.evaluateQuestion(q, " 0,5 ");
        assertTrue(res2.isCorrect());
        assertEquals(10, res2.pointsEarned());

        // Học sinh gõ 1/2
        var res3 = QuizService.evaluateQuestion(q, "1/2");
        assertTrue(res3.isCorrect());
        assertEquals(10, res3.pointsEarned());

        // Học sinh gõ sai
        var resWrong = QuizService.evaluateQuestion(q, "0.75");
        assertFalse(resWrong.isCorrect());
        assertEquals(0, resWrong.pointsEarned());
    }

    @Test
    @DisplayName("Essay: Ghi nhận bài giải của học sinh")
    void testEssay() {
        QuizQuestion q = QuizQuestion.builder()
                .questionType("ESSAY")
                .correctAnswer("Lời giải mẫu m = 3")
                .points(10)
                .build();

        var res = QuizService.evaluateQuestion(q, "Bài làm của em: Ta tính đạo hàm y'...");
        assertTrue(res.isCorrect());
        assertEquals(10, res.pointsEarned());
    }
}
