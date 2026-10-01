package com.edustudy.course.service;

import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.course.dto.CourseDto;
import com.edustudy.course.dto.CourseRequest;
import com.edustudy.course.dto.LessonDto;
import com.edustudy.course.entity.Course;
import com.edustudy.course.entity.Lesson;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.course.repository.LessonRepository;
import com.edustudy.teacher.Teacher;
import com.edustudy.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import com.edustudy.security.SecurityUtils;
import com.edustudy.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final TeacherRepository teacherRepository;
    private final com.edustudy.activation.repository.UserCourseEnrollmentRepository enrollmentRepository;
    private final com.edustudy.quiz.repository.QuizSubmissionRepository submissionRepository;
    private final com.edustudy.user.UserRepository userRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (!StringUtils.hasText(input)) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getPublicCourses(String grade, String subject, String keyword) {
        String filterGrade = StringUtils.hasText(grade) && !grade.equalsIgnoreCase("ALL") ? grade.trim() : null;
        String filterSubject = StringUtils.hasText(subject) && !subject.equalsIgnoreCase("ALL") ? subject.trim() : null;
        String filterKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;

        if (filterGrade == null && filterSubject == null && filterKeyword == null) {
            return courseRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                    .map(CourseDto::fromEntity)
                    .toList();
        }

        if (filterGrade != null && filterSubject == null && filterKeyword == null) {
            return courseRepository.searchCourses(filterGrade, null, null).stream()
                    .map(CourseDto::fromEntity)
                    .toList();
        }

        return courseRepository.searchCourses(filterGrade, filterSubject, filterKeyword).stream()
                .map(CourseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getAllCoursesForAdmin() {
        return courseRepository.findAll().stream()
                .map(CourseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return CourseDto.fromEntity(course);
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return CourseDto.fromEntity(course);
    }

    @Transactional
    public CourseDto createCourse(CourseRequest request) {
        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId()).orElse(null);
        }

        String baseSlug = StringUtils.hasText(request.getSlug()) ? toSlug(request.getSlug()) : toSlug(request.getTitle());
        String slug = baseSlug;
        int counter = 1;
        while (courseRepository.findBySlugAndIsActiveTrue(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }

        String teacherName = request.getTeacherName();
        if (teacher != null && !StringUtils.hasText(teacherName)) {
            teacherName = teacher.getName();
        }

        Course course = Course.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .grade(request.getGrade().toUpperCase())
                .subject(request.getSubject().toUpperCase())
                .teacher(teacher)
                .teacherName(teacherName)
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .discountPercent(request.getDiscountPercent())
                .thumbnailUrl(request.getThumbnailUrl())
                .badge(request.getBadge())
                .description(request.getDescription())
                .targetAudience(request.getTargetAudience())
                .totalLessons(request.getTotalLessons() != null ? request.getTotalLessons() : 60)
                .totalHours(request.getTotalHours() != null ? request.getTotalHours() : 80)
                .rating(request.getRating() != null ? request.getRating() : 5.0)
                .studentCount(request.getStudentCount() != null ? request.getStudentCount() : 100)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .featuresList(request.getFeaturesList())
                .lessons(new ArrayList<>())
                .build();

        Course saved = courseRepository.save(course);

        if (request.getLessons() != null && !request.getLessons().isEmpty()) {
            List<Lesson> lessons = new ArrayList<>();
            for (LessonDto dto : request.getLessons()) {
                Lesson lesson = Lesson.builder()
                        .course(saved)
                        .chapterName(dto.getChapterName() != null ? dto.getChapterName() : "Chương 1")
                        .title(dto.getTitle())
                        .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 45)
                        .videoUrl(dto.getVideoUrl())
                        .isFreePreview(dto.getIsFreePreview() != null ? dto.getIsFreePreview() : false)
                        .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : lessons.size())
                        .build();
                lessons.add(lesson);
            }
            lessonRepository.saveAll(lessons);
            saved.setLessons(lessons);
        }

        return CourseDto.fromEntity(saved);
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId()).orElse(null);
            course.setTeacher(teacher);
            if (teacher != null && !StringUtils.hasText(request.getTeacherName())) {
                course.setTeacherName(teacher.getName());
            }
        }
        if (StringUtils.hasText(request.getTeacherName())) {
            course.setTeacherName(request.getTeacherName());
        }

        course.setTitle(request.getTitle().trim());
        course.setGrade(request.getGrade().toUpperCase());
        course.setSubject(request.getSubject().toUpperCase());
        course.setPrice(request.getPrice());
        course.setOriginalPrice(request.getOriginalPrice());
        course.setDiscountPercent(request.getDiscountPercent());
        if (request.getThumbnailUrl() != null) course.setThumbnailUrl(request.getThumbnailUrl());
        course.setBadge(request.getBadge());
        course.setDescription(request.getDescription());
        course.setTargetAudience(request.getTargetAudience());
        if (request.getTotalLessons() != null) course.setTotalLessons(request.getTotalLessons());
        if (request.getTotalHours() != null) course.setTotalHours(request.getTotalHours());
        if (request.getRating() != null) course.setRating(request.getRating());
        if (request.getStudentCount() != null) course.setStudentCount(request.getStudentCount());
        if (request.getIsActive() != null) course.setIsActive(request.getIsActive());
        if (request.getIsFeatured() != null) course.setIsFeatured(request.getIsFeatured());
        if (request.getSortOrder() != null) course.setSortOrder(request.getSortOrder());
        course.setFeaturesList(request.getFeaturesList());

        // Update lessons if provided
        if (request.getLessons() != null) {
            lessonRepository.deleteByCourseId(course.getId());
            List<Lesson> newLessons = new ArrayList<>();
            for (LessonDto dto : request.getLessons()) {
                Lesson lesson = Lesson.builder()
                        .course(course)
                        .chapterName(dto.getChapterName() != null ? dto.getChapterName() : "Chương 1")
                        .title(dto.getTitle())
                        .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 45)
                        .videoUrl(dto.getVideoUrl())
                        .isFreePreview(dto.getIsFreePreview() != null ? dto.getIsFreePreview() : false)
                        .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : newLessons.size())
                        .build();
                newLessons.add(lesson);
            }
            lessonRepository.saveAll(newLessons);
            course.setLessons(newLessons);
        }

        return CourseDto.fromEntity(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }
        courseRepository.deleteById(id);
    }

    // ==========================================
    // LESSON MANAGEMENT PER COURSE
    // ==========================================

    @Transactional
    public LessonDto addLessonToCourse(Long courseId, LessonDto dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        int nextOrder = lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId).size() + 1;

        Lesson lesson = Lesson.builder()
                .course(course)
                .chapterName(StringUtils.hasText(dto.getChapterName()) ? dto.getChapterName().trim() : "Chương 1")
                .title(dto.getTitle().trim())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 45)
                .videoUrl(dto.getVideoUrl())
                .isFreePreview(dto.getIsFreePreview() != null ? dto.getIsFreePreview() : false)
                .materialUrl(dto.getMaterialUrl())
                .materialName(dto.getMaterialName())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : nextOrder)
                .build();

        Lesson saved = lessonRepository.save(lesson);
        // update total lessons count
        course.setTotalLessons(lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId).size());
        courseRepository.save(course);

        return LessonDto.fromEntity(saved);
    }

    @Transactional
    public LessonDto updateLesson(Long lessonId, LessonDto dto) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài học ID: " + lessonId));

        if (StringUtils.hasText(dto.getChapterName())) lesson.setChapterName(dto.getChapterName().trim());
        if (StringUtils.hasText(dto.getTitle())) lesson.setTitle(dto.getTitle().trim());
        if (dto.getDurationMinutes() != null) lesson.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getVideoUrl() != null) lesson.setVideoUrl(dto.getVideoUrl());
        if (dto.getIsFreePreview() != null) lesson.setIsFreePreview(dto.getIsFreePreview());
        if (dto.getMaterialUrl() != null) lesson.setMaterialUrl(dto.getMaterialUrl());
        if (dto.getMaterialName() != null) lesson.setMaterialName(dto.getMaterialName());
        if (dto.getSortOrder() != null) lesson.setSortOrder(dto.getSortOrder());

        return LessonDto.fromEntity(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài học ID: " + lessonId));
        Long courseId = lesson.getCourse().getId();
        lessonRepository.delete(lesson);

        // update course count
        courseRepository.findById(courseId).ifPresent(c -> {
            c.setTotalLessons(lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId).size());
            courseRepository.save(c);
        });
    }

    // ==========================================
    // COURSE LEADERBOARD
    // ==========================================

    @Transactional(readOnly = true)
    public List<com.edustudy.course.dto.CourseStudentLeaderboardDto> getCourseLeaderboard(Long courseId) {
        List<com.edustudy.activation.entity.UserCourseEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId);
        List<Long> lessonIds = lessons.stream().map(Lesson::getId).toList();

        List<com.edustudy.course.dto.CourseStudentLeaderboardDto> result = new ArrayList<>();

        for (var en : enrollments) {
            var userOpt = userRepository.findById(en.getUserId());
            if (userOpt.isEmpty()) continue;
            var user = userOpt.get();

            // Calculate quiz score for this course's lessons
            int totalScore = 0;
            int totalPossible = 0;
            int quizzesCount = 0;

            if (!lessonIds.isEmpty()) {
                var submissions = submissionRepository.findAll().stream()
                        .filter(s -> s.getUserId().equals(user.getId()) && lessonIds.contains(s.getLessonId()))
                        .toList();

                for (var sub : submissions) {
                    totalScore += sub.getScore();
                    totalPossible += sub.getTotalPoints();
                    quizzesCount++;
                }
            }

            double avgPercent = totalPossible > 0 ? ((double) totalScore / totalPossible) * 100.0 : 0.0;

            result.add(com.edustudy.course.dto.CourseStudentLeaderboardDto.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .activatedAt(en.getActivatedAt())
                    .quizzesCompleted(quizzesCount)
                    .totalScore(totalScore)
                    .averagePercentage(Math.round(avgPercent * 10.0) / 10.0)
                    .build());
        }

        // Sort descending by total score, then average percentage
        result.sort((a, b) -> {
            int cmp = Integer.compare(b.getTotalScore(), a.getTotalScore());
            if (cmp != 0) return cmp;
            return Double.compare(b.getAveragePercentage(), a.getAveragePercentage());
        });

        // Set rank 1, 2, 3...
        for (int i = 0; i < result.size(); i++) {
            result.get(i).setRank(i + 1);
        }

        return result;
    }

    // ==========================================
    // COURSE STUDENTS ROSTER MANAGEMENT (ADMIN)
    // ==========================================

    @Transactional(readOnly = true)
    public List<com.edustudy.course.dto.CourseStudentDto> getStudentsByCourseId(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND, "Không tìm thấy khóa học"));

        List<com.edustudy.activation.entity.UserCourseEnrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
        List<com.edustudy.course.dto.CourseStudentDto> list = new ArrayList<>();

        for (var en : enrollments) {
            var userOpt = userRepository.findById(en.getUserId());
            if (userOpt.isEmpty()) continue;
            var user = userOpt.get();

            list.add(com.edustudy.course.dto.CourseStudentDto.builder()
                    .enrollmentId(en.getId())
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .avatarUrl(user.getAvatarUrl())
                    .gradeLevel(user.getGradeLevel())
                    .schoolName(user.getSchoolName())
                    .activationCode(en.getActivationCode())
                    .activatedAt(en.getActivatedAt())
                    .expiresAt(en.getExpiresAt())
                    .progressPercent(en.getProgressPercent() != null ? en.getProgressPercent() : 0)
                    .active(user.getActive())
                    .build());
        }

        // Sắp xếp học sinh mới tham gia nhất lên đầu
        list.sort((a, b) -> {
            if (a.getActivatedAt() == null || b.getActivatedAt() == null) return 0;
            return b.getActivatedAt().compareTo(a.getActivatedAt());
        });

        return list;
    }

    @Transactional
    public com.edustudy.course.dto.CourseStudentDto addStudentToCourse(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND, "Không tìm thấy khóa học"));

        var user = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + studentId));

        if (enrollmentRepository.existsByUserIdAndCourseId(studentId, courseId)) {
            throw new AppException(ErrorCode.COURSE_ALREADY_ACTIVATED, "Học sinh này đã tham gia khóa học này rồi!");
        }

        java.time.Instant now = java.time.Instant.now();
        java.time.Instant expiry = now.plus(365, java.time.temporal.ChronoUnit.DAYS);

        var enrollment = com.edustudy.activation.entity.UserCourseEnrollment.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .activationCode("ADMIN_DIRECT_ADD")
                .activatedAt(now)
                .expiresAt(expiry)
                .progressPercent(0)
                .build();

        var saved = enrollmentRepository.save(enrollment);

        // Đồng bộ số học sinh trong khóa học
        course.setStudentCount((course.getStudentCount() != null ? course.getStudentCount() : 0) + 1);
        courseRepository.save(course);

        return com.edustudy.course.dto.CourseStudentDto.builder()
                .enrollmentId(saved.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .gradeLevel(user.getGradeLevel())
                .schoolName(user.getSchoolName())
                .activationCode(saved.getActivationCode())
                .activatedAt(saved.getActivatedAt())
                .expiresAt(saved.getExpiresAt())
                .progressPercent(0)
                .active(user.getActive())
                .build();
    }

    @Transactional
    public void removeStudentFromCourse(Long courseId, Long studentId) {
        var enrollment = enrollmentRepository.findByUserIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Học sinh không có trong lớp học này"));

        enrollmentRepository.delete(enrollment);

        courseRepository.findById(courseId).ifPresent(c -> {
            c.setStudentCount(Math.max(0, (c.getStudentCount() != null ? c.getStudentCount() : 1) - 1));
            courseRepository.save(c);
        });
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseForLearning(Long courseId) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để vào học"));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseIdAndStatus(
                    currentUser.getId(), courseId, "ACTIVE"
            );
            if (!isEnrolled) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn chưa đăng ký hoặc chưa hoàn tất thanh toán khóa học này!");
            }
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return CourseDto.fromEntity(course);
    }
}
