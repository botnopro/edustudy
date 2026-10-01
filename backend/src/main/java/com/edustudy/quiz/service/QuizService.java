package com.edustudy.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.course.entity.Lesson;
import com.edustudy.course.repository.LessonRepository;
import com.edustudy.quiz.dto.GradeSubmissionRequest;
import com.edustudy.quiz.dto.QuizDto;
import com.edustudy.quiz.dto.QuizQuestionDto;
import com.edustudy.quiz.dto.QuizResultDto;
import com.edustudy.quiz.dto.QuizSubmissionAdminDto;
import com.edustudy.quiz.dto.QuizSubmitRequest;
import com.edustudy.quiz.entity.Quiz;
import com.edustudy.quiz.entity.QuizQuestion;
import com.edustudy.quiz.entity.QuizSubmission;
import com.edustudy.quiz.repository.QuizQuestionRepository;
import com.edustudy.quiz.repository.QuizRepository;
import com.edustudy.quiz.repository.QuizSubmissionRepository;
import com.edustudy.user.User;
import com.edustudy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // ==========================================
    // PUBLIC / STUDENT QUERY
    // ==========================================

    @Transactional(readOnly = true)
    public List<QuizDto> getQuizzesByLesson(Long lessonId, boolean forAdmin) {
        return quizRepository.findByLessonIdAndIsActiveTrueOrderBySortOrderAsc(lessonId).stream()
                .map(q -> maybeShuffle(QuizDto.fromEntity(q, forAdmin), q, forAdmin))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizDto getQuizById(Long quizId, boolean forAdmin) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        return maybeShuffle(QuizDto.fromEntity(quiz, forAdmin), quiz, forAdmin);
    }

    /** Xáo trộn thứ tự câu hỏi cho học sinh nếu đề bật chế độ này. */
    private QuizDto maybeShuffle(QuizDto dto, Quiz quiz, boolean forAdmin) {
        if (!forAdmin && Boolean.TRUE.equals(quiz.getShuffleQuestions())
                && dto.getQuestions() != null && dto.getQuestions().size() > 1) {
            List<QuizQuestionDto> shuffled = new ArrayList<>(dto.getQuestions());
            Collections.shuffle(shuffled);
            dto.setQuestions(shuffled);
        }
        return dto;
    }

    // ==========================================
    // CHẤM ĐIỂM TOÀN DIỆN CHO 4 DẠNG CÂU HỎI
    // ==========================================

    public static QuestionEvaluationResult evaluateQuestion(QuizQuestion q, String userAns) {
        if (q == null) return new QuestionEvaluationResult(false, 0, 0, null, 0, "");
        int maxPoints = q.getPoints() != null ? q.getPoints() : 10;
        String type = q.getQuestionType() != null ? q.getQuestionType().toUpperCase() : "MULTIPLE_CHOICE";

        if (userAns == null || userAns.trim().isEmpty()) {
            return new QuestionEvaluationResult(false, 0, maxPoints, null, 0, "");
        }

        String cleanUser = userAns.trim();
        String cleanCorrect = q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim() : "";

        // 1. DẠNG ĐÚNG / SAI 4 Ý (TRUE_FALSE_4) - CHUẨN ĐỀ THI 2025 CỦA BỘ GD&ĐT
        if ("TRUE_FALSE_4".equals(type) || "TRUE_FALSE".equals(type)) {
            boolean is4Option = StringUtils.hasText(q.getOptionA()) || StringUtils.hasText(q.getOptionB())
                    || cleanCorrect.contains(",") || cleanCorrect.contains(":") || cleanCorrect.length() == 4;

            if (is4Option) {
                Map<String, Boolean> correctMap = parseTrueFalse4Map(cleanCorrect);
                Map<String, Boolean> userMap = parseTrueFalse4Map(cleanUser);

                Map<String, Boolean> subResults = new HashMap<>();
                int correctSubCount = 0;
                String[] keys = {"a", "b", "c", "d"};

                for (String k : keys) {
                    if (correctMap.containsKey(k)) {
                        boolean cVal = correctMap.get(k);
                        boolean uVal = userMap.getOrDefault(k, !cVal);
                        boolean match = (cVal == uVal);
                        subResults.put(k, match);
                        if (match) correctSubCount++;
                    }
                }

                // CÔNG THỨC BỘ GD&ĐT: 1 ý = 10%, 2 ý = 25%, 3 ý = 50%, 4 ý = 100%
                double multiplier = 0.0;
                if (correctSubCount == 4) multiplier = 1.0;
                else if (correctSubCount == 3) multiplier = 0.5;
                else if (correctSubCount == 2) multiplier = 0.25;
                else if (correctSubCount == 1) multiplier = 0.1;

                int earned = (int) Math.round(maxPoints * multiplier);
                boolean isFullyCorrect = (correctSubCount == 4);

                return new QuestionEvaluationResult(isFullyCorrect, earned, maxPoints, subResults, correctSubCount, cleanUser);
            } else {
                // Đúng sai 1 ý
                boolean uTrue = isTrueValue(cleanUser);
                boolean cTrue = isTrueValue(cleanCorrect);
                boolean isCorrect = (uTrue == cTrue);
                return new QuestionEvaluationResult(isCorrect, isCorrect ? maxPoints : 0, maxPoints, null, isCorrect ? 1 : 0, cleanUser);
            }
        }

        // 2. DẠNG TRẢ LỜI NGẮN (SHORT_ANSWER) - HỖ TRỢ ĐA ĐÁP ÁN TƯƠNG ĐƯƠNG (VD: 0.5 | 1/2 | 0,5)
        if ("SHORT_ANSWER".equals(type)) {
            String[] allowedAnswers = cleanCorrect.split("[|;,]");
            String normalizedUser = normalizeAnswerString(cleanUser);
            boolean match = false;
            for (String allowed : allowedAnswers) {
                if (normalizedUser.equalsIgnoreCase(normalizeAnswerString(allowed))) {
                    match = true;
                    break;
                }
            }
            return new QuestionEvaluationResult(match, match ? maxPoints : 0, maxPoints, null, match ? 1 : 0, cleanUser);
        }

        // 3. DẠNG TỰ LUẬN (ESSAY) - chờ giáo viên chấm điểm, tạm thời 0 điểm
        if ("ESSAY".equals(type)) {
            return new QuestionEvaluationResult(false, 0, maxPoints, null, 0, cleanUser);
        }

        // 4. DẠNG TRẮC NGHIỆM 4 LỰA CHỌN (MULTIPLE_CHOICE)
        boolean match = cleanUser.equalsIgnoreCase(cleanCorrect);
        return new QuestionEvaluationResult(match, match ? maxPoints : 0, maxPoints, null, match ? 1 : 0, cleanUser);
    }

    public static boolean checkAnswerCorrectness(QuizQuestion q, String userAns) {
        return evaluateQuestion(q, userAns).isCorrect();
    }

    public static Map<String, Boolean> parseTrueFalse4Map(String raw) {
        Map<String, Boolean> map = new HashMap<>();
        if (!StringUtils.hasText(raw)) return map;

        String s = raw.trim();

        // 1. JSON format: {"a":"T", "b":"F", ...}
        if (s.startsWith("{") && s.endsWith("}")) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode node = mapper.readTree(s);
                String[] keys = {"a", "b", "c", "d"};
                for (String k : keys) {
                    if (node.has(k)) {
                        map.put(k, isTrueValue(node.get(k).asText()));
                    }
                }
                if (!map.isEmpty()) return map;
            } catch (Exception ignored) {}
        }

        // 2. Key-value format: a:Đ, b:S, c:Đ, d:Đ
        if (s.contains("a:") || s.contains("a=") || s.contains("A:") || s.contains("A=")) {
            String[] parts = s.split("[,;\\s]+");
            for (String part : parts) {
                String[] kv = part.split("[:=]");
                if (kv.length == 2) {
                    String k = kv[0].trim().toLowerCase();
                    if (k.startsWith("a") || k.startsWith("b") || k.startsWith("c") || k.startsWith("d")) {
                        map.put(k.substring(0, 1), isTrueValue(kv[1].trim()));
                    }
                }
            }
            if (!map.isEmpty()) return map;
        }

        // 3. Comma-separated: T, F, T, T hoặc Đ, S, Đ, Đ
        if (s.contains(",")) {
            String[] parts = s.split(",");
            String[] keys = {"a", "b", "c", "d"};
            for (int i = 0; i < Math.min(parts.length, 4); i++) {
                map.put(keys[i], isTrueValue(parts[i].trim()));
            }
            return map;
        }

        // 4. Character sequence: TFTF hoặc ĐSĐĐ
        if (s.length() >= 4) {
            String[] keys = {"a", "b", "c", "d"};
            for (int i = 0; i < 4; i++) {
                map.put(keys[i], isTrueValue(String.valueOf(s.charAt(i))));
            }
            return map;
        }

        return map;
    }

    public static boolean isTrueValue(String val) {
        if (val == null) return false;
        String v = val.trim().toUpperCase();
        return v.startsWith("T") || v.startsWith("Đ") || v.startsWith("D") || v.equals("1") || v.equals("TRUE") || v.equals("RIGHT");
    }

    public static String normalizeAnswerString(String val) {
        if (val == null) return "";
        return val.trim()
                .replaceAll("\\s+", "")
                .replace(',', '.')
                .toLowerCase();
    }

    public record QuestionEvaluationResult(
            boolean isCorrect,
            int pointsEarned,
            int maxPoints,
            Map<String, Boolean> subResults,
            int subCorrectCount,
            String userAnswer
    ) {}

    private static boolean isEssay(QuizQuestion q) {
        return q != null && "ESSAY".equalsIgnoreCase(q.getQuestionType());
    }

    private JsonNode parseGradesNode(String json) {
        if (!StringUtils.hasText(json)) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Xây danh sách kết quả từng câu, overlay điểm/nhận xét tự luận đã chấm (nếu có).
     */
    private List<QuizResultDto.QuizQuestionResultDto> buildQuestionResults(
            List<QuizQuestion> questions, Map<Long, String> userAnswers, JsonNode grades) {
        List<QuizResultDto.QuizQuestionResultDto> results = new ArrayList<>();
        for (QuizQuestion q : questions) {
            String userAns = userAnswers.get(q.getId());
            QuestionEvaluationResult eval = evaluateQuestion(q, userAns);
            int maxPts = q.getPoints() != null ? q.getPoints() : 10;

            int pointsEarned = eval.pointsEarned();
            Boolean isCorrect = eval.isCorrect();
            String teacherComment = null;
            Boolean pendingGrade = null;

            if (isEssay(q)) {
                JsonNode g = grades != null ? grades.get(String.valueOf(q.getId())) : null;
                if (g != null && g.has("score") && !g.get("score").isNull()) {
                    pointsEarned = Math.min(maxPts, Math.max(0, g.get("score").asInt()));
                    teacherComment = g.has("feedback") && !g.get("feedback").isNull() ? g.get("feedback").asText() : null;
                    isCorrect = pointsEarned >= maxPts;
                    pendingGrade = false;
                } else {
                    pointsEarned = 0;
                    isCorrect = null;
                    pendingGrade = true;
                }
            }

            results.add(QuizResultDto.QuizQuestionResultDto.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .questionType(q.getQuestionType())
                    .imageUrl(q.getImageUrl())
                    .chartConfig(q.getChartConfig())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .userAnswer(userAns != null ? userAns : "")
                    .correctAnswer(q.getCorrectAnswer())
                    .isCorrect(isCorrect)
                    .explanation(q.getExplanation())
                    .pointsEarned(pointsEarned)
                    .maxPoints(maxPts)
                    .subResults(eval.subResults())
                    .subCorrectCount(eval.subCorrectCount())
                    .essayAnswer(userAns)
                    .teacherComment(teacherComment)
                    .pendingGrade(pendingGrade)
                    .build());
        }
        return results;
    }

    /** Ẩn đáp án đúng & lời giải khỏi kết quả nếu đề cấu hình không cho xem. */
    private void hideAnswersIfNeeded(List<QuizResultDto.QuizQuestionResultDto> results, boolean showAnswers) {
        if (showAnswers) return;
        for (QuizResultDto.QuizQuestionResultDto r : results) {
            r.setCorrectAnswer(null);
            r.setExplanation(null);
            r.setSubResults(null);
        }
    }

    /**
     * Ẩn điểm số từng câu (đúng/sai, điểm đạt) khi đề cấu hình không cho học sinh xem điểm.
     * Phần đáp án đã được ẩn riêng qua hideAnswersIfNeeded.
     */
    private void hideScoreIfNeeded(List<QuizResultDto.QuizQuestionResultDto> results, boolean showScore) {
        if (showScore) return;
        for (QuizResultDto.QuizQuestionResultDto r : results) {
            r.setIsCorrect(null);
            r.setPointsEarned(null);
            r.setSubResults(null);
            r.setSubCorrectCount(null);
        }
    }

    // ==========================================
    // SUBMIT QUIZ
    // ==========================================

    @Transactional
    public QuizResultDto submitQuiz(Long quizId, Long userId, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        List<QuizQuestion> questions = quiz.getQuestions();
        if (questions == null || questions.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bài kiểm tra này chưa có câu hỏi");
        }

        Map<Long, String> userAnswers = request.getAnswers() != null ? request.getAnswers() : Collections.emptyMap();

        List<QuizResultDto.QuizQuestionResultDto> questionResults = buildQuestionResults(questions, userAnswers, null);
        int score = questionResults.stream().mapToInt(r -> r.getPointsEarned() != null ? r.getPointsEarned() : 0).sum();
        int totalPoints = questionResults.stream().mapToInt(r -> r.getMaxPoints() != null ? r.getMaxPoints() : 0).sum();
        int correctCount = (int) questionResults.stream().filter(r -> Boolean.TRUE.equals(r.getIsCorrect())).count();

        double percentage = totalPoints > 0 ? ((double) score / totalPoints) * 100.0 : 0.0;
        int passTarget = quiz.getPassingScore() != null ? quiz.getPassingScore() : 70;
        boolean passed = percentage >= passTarget;

        String answersJson = "";
        try {
            answersJson = objectMapper.writeValueAsString(userAnswers);
        } catch (Exception e) {
            log.warn("Failed to serialize answers JSON: {}", e.getMessage());
        }

        // Determine whether this quiz contains ESSAY question(s) needing teacher grading
        boolean hasEssay = questions.stream().anyMatch(q -> "ESSAY".equalsIgnoreCase(q.getQuestionType()));
        boolean isGraded = !hasEssay;

        User studentUser = userRepository.findById(userId).orElse(null);
        String studentName = studentUser != null ? studentUser.getFullName() : null;
        String studentEmail = studentUser != null ? studentUser.getEmail() : null;

        QuizSubmission submission = QuizSubmission.builder()
                .quizId(quiz.getId())
                .lessonId(quiz.getLesson().getId())
                .userId(userId)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .score(score)
                .totalPoints(totalPoints)
                .passed(passed)
                .isGraded(isGraded)
                .answersJson(answersJson)
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .build();

        submission = submissionRepository.save(submission);

        boolean showScore = !Boolean.FALSE.equals(quiz.getShowScore());
        // Ẩn điểm thì ẩn luôn đáp án
        boolean showAnswers = showScore && !Boolean.FALSE.equals(quiz.getShowAnswers());
        hideAnswersIfNeeded(questionResults, showAnswers);
        hideScoreIfNeeded(questionResults, showScore);

        List<QuizQuestionDto> questionsWithExplanations = questions.stream()
                .map(q -> QuizQuestionDto.fromEntity(q, showAnswers))
                .toList();

        return QuizResultDto.builder()
                .submissionId(submission.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .score(showScore ? score : null)
                .totalPoints(totalPoints)
                .correctCount(showScore ? correctCount : null)
                .totalQuestions(questions.size())
                .percentage(showScore ? Math.round(percentage * 10.0) / 10.0 : null)
                .passed(showScore ? passed : null)
                .isGraded(submission.getIsGraded())
                .teacherFeedback(submission.getTeacherFeedback())
                .teacherScore(showScore ? submission.getTeacherScore() : null)
                .gradedBy(submission.getGradedBy())
                .gradedAt(submission.getGradedAt())
                .showAnswers(showAnswers)
                .showScore(showScore)
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .userAnswers(userAnswers)
                .questionsWithExplanations(questionsWithExplanations)
                .questionResults(questionResults)
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<QuizResultDto> getUserLatestResult(Long quizId, Long userId) {
        return submissionRepository.findFirstByQuizIdAndUserIdOrderByCreatedAtDesc(quizId, userId)
                .map(sub -> {
                    Quiz quiz = quizRepository.findById(quizId).orElse(null);
                    if (quiz == null) return null;

                    Map<Long, String> userAnswers = new HashMap<>();
                    try {
                        if (sub.getAnswersJson() != null) {
                            userAnswers = objectMapper.readValue(sub.getAnswersJson(), new TypeReference<Map<Long, String>>() {});
                        }
                    } catch (Exception ignored) {}

                    boolean showScore = !Boolean.FALSE.equals(quiz.getShowScore());
                    boolean showAnswers = showScore && !Boolean.FALSE.equals(quiz.getShowAnswers());

                    List<QuizQuestionDto> questionsWithExplanations = quiz.getQuestions().stream()
                            .map(q -> QuizQuestionDto.fromEntity(q, showAnswers))
                            .toList();

                    JsonNode grades = parseGradesNode(sub.getQuestionGradesJson());
                    List<QuizResultDto.QuizQuestionResultDto> questionResults =
                            buildQuestionResults(quiz.getQuestions(), userAnswers, grades);
                    int correctCount = (int) questionResults.stream()
                            .filter(r -> Boolean.TRUE.equals(r.getIsCorrect())).count();
                    hideAnswersIfNeeded(questionResults, showAnswers);
                    hideScoreIfNeeded(questionResults, showScore);

                    double percentage = sub.getTotalPoints() > 0 ? ((double) sub.getScore() / sub.getTotalPoints()) * 100.0 : 0.0;

                    return QuizResultDto.builder()
                            .submissionId(sub.getId())
                            .quizId(quiz.getId())
                            .quizTitle(quiz.getTitle())
                            .score(showScore ? sub.getScore() : null)
                            .totalPoints(sub.getTotalPoints())
                            .correctCount(showScore ? correctCount : null)
                            .totalQuestions(quiz.getQuestions().size())
                            .percentage(showScore ? Math.round(percentage * 10.0) / 10.0 : null)
                            .passed(showScore ? sub.getPassed() : null)
                            .isGraded(sub.getIsGraded())
                            .teacherFeedback(sub.getTeacherFeedback())
                            .teacherScore(showScore ? sub.getTeacherScore() : null)
                            .gradedBy(sub.getGradedBy())
                            .gradedAt(sub.getGradedAt())
                            .showAnswers(showAnswers)
                            .showScore(showScore)
                            .timeSpentSeconds(sub.getTimeSpentSeconds())
                            .userAnswers(userAnswers)
                            .questionsWithExplanations(questionsWithExplanations)
                            .questionResults(questionResults)
                            .build();
                });
    }

    // ==========================================
    // ADMIN QUIZ CRUD
    // ==========================================

    @Transactional
    public QuizDto createQuiz(Long lessonId, QuizDto dto) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài học ID: " + lessonId));

        Quiz quiz = Quiz.builder()
                .lesson(lesson)
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .timeLimitMinutes(dto.getTimeLimitMinutes() != null ? dto.getTimeLimitMinutes() : 15)
                .passingScore(dto.getPassingScore() != null ? dto.getPassingScore() : 70)
                .shuffleQuestions(dto.getShuffleQuestions() != null ? dto.getShuffleQuestions() : false)
                .showAnswers(dto.getShowAnswers() != null ? dto.getShowAnswers() : true)
                .showScore(dto.getShowScore() != null ? dto.getShowScore() : true)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        return QuizDto.fromEntity(quizRepository.save(quiz), true);
    }

    @Transactional
    public QuizDto updateQuiz(Long quizId, QuizDto dto) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        quiz.setTitle(dto.getTitle().trim());
        quiz.setDescription(dto.getDescription());
        if (dto.getTimeLimitMinutes() != null) quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        if (dto.getPassingScore() != null) quiz.setPassingScore(dto.getPassingScore());
        if (dto.getShuffleQuestions() != null) quiz.setShuffleQuestions(dto.getShuffleQuestions());
        if (dto.getShowAnswers() != null) quiz.setShowAnswers(dto.getShowAnswers());
        if (dto.getShowScore() != null) quiz.setShowScore(dto.getShowScore());
        if (dto.getSortOrder() != null) quiz.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) quiz.setIsActive(dto.getIsActive());

        return QuizDto.fromEntity(quizRepository.save(quiz), true);
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));
        quizRepository.delete(quiz);
    }

    // ==========================================
    // ADMIN QUESTION CRUD & SMART BATCH IMPORT
    // ==========================================

    @Transactional
    public QuizQuestionDto addQuestion(Long quizId, QuizQuestionDto dto) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        QuizQuestion question = QuizQuestion.builder()
                .quiz(quiz)
                .questionText(dto.getQuestionText().trim())
                .questionType(dto.getQuestionType() != null ? dto.getQuestionType() : "MULTIPLE_CHOICE")
                .imageUrl(dto.getImageUrl())
                .chartConfig(dto.getChartConfig())
                .optionA(dto.getOptionA())
                .optionB(dto.getOptionB())
                .optionC(dto.getOptionC())
                .optionD(dto.getOptionD())
                .correctAnswer(dto.getCorrectAnswer() != null ? dto.getCorrectAnswer().trim() : "A")
                .explanation(dto.getExplanation())
                .points(dto.getPoints() != null ? dto.getPoints() : 10)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : quiz.getQuestions().size() + 1)
                .build();

        return QuizQuestionDto.fromEntity(questionRepository.save(question), true);
    }

    @Transactional
    public List<QuizQuestionDto> addQuestionsBatch(Long quizId, List<QuizQuestionDto> dtoList) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        int startSort = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;
        List<QuizQuestion> questionsToSave = new ArrayList<>();

        for (int i = 0; i < dtoList.size(); i++) {
            QuizQuestionDto dto = dtoList.get(i);
            QuizQuestion question = QuizQuestion.builder()
                    .quiz(quiz)
                    .questionText(dto.getQuestionText() != null ? dto.getQuestionText().trim() : "")
                    .questionType(dto.getQuestionType() != null ? dto.getQuestionType() : "MULTIPLE_CHOICE")
                    .imageUrl(dto.getImageUrl())
                    .chartConfig(dto.getChartConfig())
                    .optionA(dto.getOptionA())
                    .optionB(dto.getOptionB())
                    .optionC(dto.getOptionC())
                    .optionD(dto.getOptionD())
                    .correctAnswer(dto.getCorrectAnswer() != null ? dto.getCorrectAnswer().trim() : "A")
                    .explanation(dto.getExplanation())
                    .points(dto.getPoints() != null ? dto.getPoints() : 10)
                    .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : (startSort + i + 1))
                    .build();
            questionsToSave.add(question);
        }

        List<QuizQuestion> saved = questionRepository.saveAll(questionsToSave);
        return saved.stream().map(q -> QuizQuestionDto.fromEntity(q, true)).toList();
    }

    @Transactional
    public QuizQuestionDto updateQuestion(Long questionId, QuizQuestionDto dto) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy câu hỏi ID: " + questionId));

        question.setQuestionText(dto.getQuestionText().trim());
        if (dto.getQuestionType() != null) question.setQuestionType(dto.getQuestionType());
        question.setImageUrl(dto.getImageUrl());
        question.setChartConfig(dto.getChartConfig());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        if (dto.getCorrectAnswer() != null) question.setCorrectAnswer(dto.getCorrectAnswer().trim());
        question.setExplanation(dto.getExplanation());
        if (dto.getPoints() != null) question.setPoints(dto.getPoints());
        if (dto.getSortOrder() != null) question.setSortOrder(dto.getSortOrder());

        return QuizQuestionDto.fromEntity(questionRepository.save(question), true);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy câu hỏi ID: " + questionId));
        questionRepository.delete(question);
    }

    // ==========================================
    // TEACHER ESSAY GRADING & SUBMISSIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<QuizSubmissionAdminDto> getQuizSubmissions(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + quizId));

        return submissionRepository.findByQuizIdOrderByCreatedAtDesc(quizId).stream()
                .map(sub -> mapToAdminDto(sub, quiz))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizSubmissionAdminDto getSubmissionDetail(Long submissionId) {
        QuizSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài nộp ID: " + submissionId));

        Quiz quiz = quizRepository.findById(sub.getQuizId()).orElse(null);
        return mapToAdminDto(sub, quiz);
    }

    @Transactional
    public QuizSubmissionAdminDto gradeSubmission(Long submissionId, GradeSubmissionRequest request, String teacherEmail) {
        QuizSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài nộp ID: " + submissionId));

        Quiz quiz = quizRepository.findById(sub.getQuizId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài kiểm tra ID: " + sub.getQuizId()));

        List<GradeSubmissionRequest.QuestionGrade> perQuestion = request.getQuestionGrades();
        int newScore;

        if (perQuestion != null && !perQuestion.isEmpty()) {
            // Chấm theo TỪNG câu: điểm khách quan (tự chấm) + tổng điểm tự luận giáo viên chấm
            Map<Long, String> userAnswers = new HashMap<>();
            try {
                if (sub.getAnswersJson() != null) {
                    userAnswers = objectMapper.readValue(sub.getAnswersJson(), new TypeReference<Map<Long, String>>() {});
                }
            } catch (Exception ignored) {}

            Map<Long, QuizQuestion> qById = new HashMap<>();
            for (QuizQuestion q : quiz.getQuestions()) qById.put(q.getId(), q);

            // Điểm các câu KHÔNG phải tự luận (chấm tự động)
            int objective = 0;
            long essayCount = 0;
            for (QuizQuestion q : quiz.getQuestions()) {
                if (isEssay(q)) {
                    essayCount++;
                } else {
                    objective += evaluateQuestion(q, userAnswers.get(q.getId())).pointsEarned();
                }
            }

            // Điểm tự luận theo từng câu do giáo viên nhập
            int essayTotal = 0;
            Map<String, Map<String, Object>> gradesMap = new LinkedHashMap<>();
            for (GradeSubmissionRequest.QuestionGrade g : perQuestion) {
                if (g == null || g.getQuestionId() == null) continue;
                QuizQuestion q = qById.get(g.getQuestionId());
                int maxPts = q != null && q.getPoints() != null ? q.getPoints() : 10;
                int s = g.getScore() != null ? Math.min(maxPts, Math.max(0, g.getScore())) : 0;
                essayTotal += s;
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("score", s);
                entry.put("feedback", g.getFeedback() != null ? g.getFeedback() : "");
                gradesMap.put(String.valueOf(g.getQuestionId()), entry);
            }

            newScore = Math.min(sub.getTotalPoints(), objective + essayTotal);
            try {
                sub.setQuestionGradesJson(objectMapper.writeValueAsString(gradesMap));
            } catch (Exception e) {
                log.warn("Failed to serialize question grades JSON: {}", e.getMessage());
            }
            // Đã chấm xong khi mọi câu tự luận đều có điểm
            sub.setIsGraded(gradesMap.size() >= essayCount);
        } else {
            // Tương thích cũ: chấm nhanh 1 điểm tổng cho cả bài
            newScore = request.getTeacherScore() != null ? request.getTeacherScore() : sub.getScore();
            if (newScore > sub.getTotalPoints()) newScore = sub.getTotalPoints();
            if (newScore < 0) newScore = 0;
            sub.setIsGraded(true);
        }

        sub.setScore(newScore);
        sub.setTeacherScore(newScore);
        sub.setTeacherFeedback(request.getTeacherFeedback());
        sub.setGradedBy(teacherEmail != null ? teacherEmail : "Giáo viên bộ môn");
        sub.setGradedAt(java.time.LocalDateTime.now());

        double percentage = sub.getTotalPoints() > 0 ? ((double) newScore / sub.getTotalPoints()) * 100.0 : 0.0;
        int passTarget = quiz.getPassingScore() != null ? quiz.getPassingScore() : 70;
        sub.setPassed(percentage >= passTarget);

        QuizSubmission saved = submissionRepository.save(sub);
        return mapToAdminDto(saved, quiz);
    }

    private QuizSubmissionAdminDto mapToAdminDto(QuizSubmission sub, Quiz quiz) {
        double percentage = sub.getTotalPoints() > 0 ? ((double) sub.getScore() / sub.getTotalPoints()) * 100.0 : 0.0;

        List<QuizResultDto.QuizQuestionResultDto> questionResults = new ArrayList<>();
        if (quiz != null && quiz.getQuestions() != null) {
            Map<Long, String> userAnswers = new HashMap<>();
            try {
                if (sub.getAnswersJson() != null) {
                    userAnswers = objectMapper.readValue(sub.getAnswersJson(), new TypeReference<Map<Long, String>>() {});
                }
            } catch (Exception ignored) {}

            JsonNode grades = parseGradesNode(sub.getQuestionGradesJson());
            questionResults = buildQuestionResults(quiz.getQuestions(), userAnswers, grades);
        }

        return QuizSubmissionAdminDto.builder()
                .id(sub.getId())
                .quizId(sub.getQuizId())
                .quizTitle(quiz != null ? quiz.getTitle() : "Bài kiểm tra")
                .lessonId(sub.getLessonId())
                .userId(sub.getUserId())
                .studentName(sub.getStudentName() != null ? sub.getStudentName() : ("Học sinh #" + sub.getUserId()))
                .studentEmail(sub.getStudentEmail() != null ? sub.getStudentEmail() : "")
                .score(sub.getScore())
                .totalPoints(sub.getTotalPoints())
                .passed(sub.getPassed())
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .timeSpentSeconds(sub.getTimeSpentSeconds())
                .answersJson(sub.getAnswersJson())
                .isGraded(sub.getIsGraded())
                .teacherFeedback(sub.getTeacherFeedback())
                .teacherScore(sub.getTeacherScore())
                .gradedBy(sub.getGradedBy())
                .gradedAt(sub.getGradedAt())
                .createdAt(sub.getCreatedAt())
                .questionGradesJson(sub.getQuestionGradesJson())
                .questionResults(questionResults)
                .build();
    }
}
