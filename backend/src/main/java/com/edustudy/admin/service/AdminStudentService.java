package com.edustudy.admin.service;

import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.admin.dto.StudentDto;
import com.edustudy.admin.dto.StudentRequest;
import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.course.entity.Course;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.quiz.repository.QuizSubmissionRepository;
import com.edustudy.user.Role;
import com.edustudy.user.User;
import com.edustudy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStudentService {

    private final UserRepository userRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final QuizSubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents(String keyword, Integer gradeLevel) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> u.getRole() == Role.ROLE_STUDENT)
                .filter(u -> {
                    if (gradeLevel != null && !gradeLevel.equals(u.getGradeLevel())) {
                        return false;
                    }
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String kw = keyword.toLowerCase().trim();
                        boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(kw);
                        boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(kw);
                        boolean matchPhone = u.getPhone() != null && u.getPhone().contains(kw);
                        boolean matchSchool = u.getSchoolName() != null && u.getSchoolName().toLowerCase().contains(kw);
                        return matchName || matchEmail || matchPhone || matchSchool;
                    }
                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDtoSummary)
                .collect(Collectors.toList());
    }

    /** Lọc danh sách học sinh (chưa map DTO) theo từ khóa & khối lớp, sắp xếp mới nhất trước. */
    private List<User> filterStudents(String keyword, Integer gradeLevel) {
        String kw = keyword != null ? keyword.toLowerCase().trim() : "";
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_STUDENT)
                .filter(u -> gradeLevel == null || gradeLevel.equals(u.getGradeLevel()))
                .filter(u -> {
                    if (kw.isEmpty()) return true;
                    boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(kw);
                    boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(kw);
                    boolean matchPhone = u.getPhone() != null && u.getPhone().contains(kw);
                    boolean matchSchool = u.getSchoolName() != null && u.getSchoolName().toLowerCase().contains(kw);
                    return matchName || matchEmail || matchPhone || matchSchool;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Phân trang học sinh. Chỉ ánh xạ DTO (kèm đếm khóa học / bài làm) cho đúng 1 trang,
     * nên tránh được truy vấn N+1 trên toàn bộ danh sách -> tải nhanh hơn nhiều.
     */
    @Transactional(readOnly = true)
    public com.edustudy.common.PageResponse<StudentDto> getStudentsPage(String keyword, Integer gradeLevel, int page, int size) {
        List<User> filtered = filterStudents(keyword, gradeLevel);
        int total = filtered.size();
        int safeSize = size <= 0 ? 20 : size;
        int totalPages = (int) Math.ceil((double) total / safeSize);
        int safePage = Math.max(0, page);
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<StudentDto> content = (from >= to ? List.<User>of() : filtered.subList(from, to))
                .stream().map(this::mapToDtoSummary).collect(Collectors.toList());
        return com.edustudy.common.PageResponse.<StudentDto>builder()
                .content(content)
                .page(safePage)
                .size(safeSize)
                .totalElements(total)
                .totalPages(totalPages)
                .build();
    }

    /** Thống kê tổng quan học sinh phục vụ các thẻ KPI. */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getStudentsStats() {
        List<User> all = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_STUDENT)
                .collect(Collectors.toList());
        java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
        stats.put("total", (long) all.size());
        stats.put("active", all.stream().filter(u -> Boolean.TRUE.equals(u.getActive())).count());
        stats.put("grade12", all.stream().filter(u -> Integer.valueOf(12).equals(u.getGradeLevel())).count());
        stats.put("grade11", all.stream().filter(u -> Integer.valueOf(11).equals(u.getGradeLevel())).count());
        stats.put("grade10", all.stream().filter(u -> Integer.valueOf(10).equals(u.getGradeLevel())).count());
        return stats;
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + id));

        List<UserCourseEnrollment> enrollments = enrollmentRepository.findByUserIdOrderByActivatedAtDesc(id);
        long submissionsCount = submissionRepository.countByUserId(id);

        List<StudentDto.StudentEnrollmentDto> enrollmentDtos = enrollments.stream()
                .map(e -> StudentDto.StudentEnrollmentDto.builder()
                        .id(e.getId())
                        .courseId(e.getCourseId())
                        .courseTitle(e.getCourseTitle())
                        .activationCode(e.getActivationCode())
                        .activatedAt(e.getActivatedAt())
                        .expiresAt(e.getExpiresAt())
                        .progressPercent(e.getProgressPercent())
                        .build())
                .collect(Collectors.toList());

        return StudentDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .gradeLevel(user.getGradeLevel())
                .schoolName(user.getSchoolName())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .enrolledCoursesCount(enrollments.size())
                .quizSubmissionsCount((int) submissionsCount)
                .enrolledCourses(enrollmentDtos)
                .build();
    }

    @Transactional
    public StudentDto createStudent(StudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã được sử dụng");
        }

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "hocsinh" + (int)(Math.random() * 9000 + 1000);
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .password(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .avatarUrl(request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty() 
                        ? request.getAvatarUrl().trim() 
                        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_STUDENT)
                .gradeLevel(request.getGradeLevel() != null ? request.getGradeLevel() : 12)
                .schoolName(request.getSchoolName() != null ? request.getSchoolName().trim() : null)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        User saved = userRepository.save(user);
        log.info("Admin created student: {} ({})", saved.getFullName(), saved.getEmail());
        return mapToDtoSummary(saved);
    }

    @Transactional
    public StudentDto updateStudent(Long id, StudentRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + id));

        // Check email uniqueness if email changed
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã thuộc về người dùng khác");
            }
            user.setEmail(newEmail);
        }

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getGradeLevel() != null) user.setGradeLevel(request.getGradeLevel());
        if (request.getSchoolName() != null) user.setSchoolName(request.getSchoolName().trim());
        if (request.getActive() != null) user.setActive(request.getActive());

        // Password reset if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
            log.info("Admin reset password for user: {}", user.getEmail());
        }

        User updated = userRepository.save(user);
        return getStudentById(updated.getId());
    }

    @Transactional
    public void deleteStudent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + id));
        
        userRepository.delete(user);
        log.info("Admin deleted student account: {} ({})", user.getFullName(), user.getEmail());
    }

    @Transactional
    public void assignCourse(Long studentId, Long courseId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Học sinh không tồn tại"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND, "Khóa học không tồn tại"));

        if (enrollmentRepository.existsByUserIdAndCourseId(studentId, courseId)) {
            throw new AppException(ErrorCode.COURSE_ALREADY_ACTIVATED, "Học sinh đã kích hoạt khóa học này trước đó rồi");
        }

        UserCourseEnrollment enrollment = UserCourseEnrollment.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .activationCode("ADMIN_GRANT")
                .activatedAt(Instant.now())
                .expiresAt(Instant.now().plus(365, ChronoUnit.DAYS))
                .progressPercent(0)
                .build();

        enrollmentRepository.save(enrollment);
        course.setStudentCount((course.getStudentCount() != null ? course.getStudentCount() : 0) + 1);
        courseRepository.save(course);
        log.info("Admin granted course '{}' directly to student '{}'", course.getTitle(), user.getEmail());
    }

    @Transactional
    public void revokeCourse(Long studentId, Long courseId) {
        UserCourseEnrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Học sinh chưa đăng ký khóa học này"));

        enrollmentRepository.delete(enrollment);

        courseRepository.findById(courseId).ifPresent(c -> {
            c.setStudentCount(Math.max(0, (c.getStudentCount() != null ? c.getStudentCount() : 1) - 1));
            courseRepository.save(c);
        });

        log.info("Admin revoked course ID {} from student ID {}", courseId, studentId);
    }

    @Transactional
    public StudentDto toggleStudentStatus(Long studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + studentId));

        boolean newStatus = !Boolean.TRUE.equals(user.getActive());
        user.setActive(newStatus);
        user = userRepository.save(user);
        log.info("Admin toggled student {} status to active={}", user.getEmail(), newStatus);
        return mapToDtoSummary(user);
    }

    @Transactional
    public void resetStudentPassword(Long studentId, String newPassword) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy học sinh với ID: " + studentId));

        String rawPassword = (newPassword != null && !newPassword.isBlank()) ? newPassword.trim() : "Edu@123456";
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
        log.info("Admin reset password for student {} (ID: {})", user.getEmail(), user.getId());
    }

    private StudentDto mapToDtoSummary(User user) {
        List<UserCourseEnrollment> enrollments = enrollmentRepository.findByUserIdOrderByActivatedAtDesc(user.getId());
        long submissionsCount = submissionRepository.countByUserId(user.getId());

        return StudentDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .gradeLevel(user.getGradeLevel())
                .schoolName(user.getSchoolName())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .enrolledCoursesCount(enrollments.size())
                .quizSubmissionsCount((int) submissionsCount)
                .build();
    }
}
