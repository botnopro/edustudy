package com.edustudy.quiz.repository;

import com.edustudy.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonIdAndIsActiveTrueOrderBySortOrderAsc(Long lessonId);
    List<Quiz> findByLessonIdOrderBySortOrderAsc(Long lessonId);
    long countByLessonId(Long lessonId);
}
