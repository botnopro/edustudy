package com.edustudy.quiz.repository;

import com.edustudy.quiz.entity.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
    List<QuizSubmission> findByQuizIdAndUserIdOrderByCreatedAtDesc(Long quizId, Long userId);
    Optional<QuizSubmission> findFirstByQuizIdAndUserIdOrderByCreatedAtDesc(Long quizId, Long userId);
    List<QuizSubmission> findByQuizIdOrderByCreatedAtDesc(Long quizId);
    List<QuizSubmission> findAllByOrderByCreatedAtDesc();
    long countByUserId(Long userId);
}
