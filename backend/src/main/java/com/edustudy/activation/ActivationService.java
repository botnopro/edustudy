package com.edustudy.activation;

import com.edustudy.activation.dto.*;
import com.edustudy.activation.entity.ActivationCode;
import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.ActivationCodeRepository;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.common.PageResponse;
import com.edustudy.course.dto.CourseDto;
import com.edustudy.course.entity.Course;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.security.SecurityUtils;
import com.edustudy.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivationService {

    private final ActivationCodeRepository codeRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Sinh mã kích hoạt ngẫu nhiên dạng chuẩn thẻ cào: PREFIX-XXXX-XXXX
     * Bộ ký tự loại bỏ 0, 1, I, O để tránh nhầm lẫn khi in ấn và nhập liệu.
     */
    public static String generateRandomCode(String prefix, int length) {
        String p = StringUtils.hasText(prefix) ? prefix.trim().toUpperCase() : "ACT";
        if (p.endsWith("-")) {
            p = p.substring(0, p.length() - 1);
        }
        StringBuilder sb = new StringBuilder(p).append("-");
        for (int i = 0; i < 4; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        sb.append("-");
        for (int i = 0; i < 4; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private String maskEmail(String email) {
        if (!StringUtils.hasText(email)) return "người khác";
        int atIdx = email.indexOf('@');
        if (atIdx <= 2) return "***" + email.substring(atIdx);
        return email.substring(0, 2) + "***" + email.substring(atIdx);
    }

    @Transactional(readOnly = true)
    public CodeCheckResponse checkCode(String codeStr) {
        if (!StringUtils.hasText(codeStr)) {
            return CodeCheckResponse.builder()
                    .valid(false)
                    .statusMessage("Vui lòng nhập mã kích hoạt")
                    .build();
        }

        String normalizedCode = codeStr.trim().toUpperCase();
        ActivationCode code = codeRepository.findByCodeIgnoreCase(normalizedCode)
                .orElse(null);

        if (code == null) {
            return CodeCheckResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .statusMessage("Mã kích hoạt không tồn tại trên hệ thống")
                    .build();
        }

        if (!code.getIsActive()) {
            return CodeCheckResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .statusMessage("Mã kích hoạt này hiện đang bị tạm khóa")
                    .build();
        }

        if (code.isExpired()) {
            return CodeCheckResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .statusMessage("Mã kích hoạt đã hết hạn sử dụng")
                    .build();
        }

        if (code.isExhausted()) {
            String usedInfo = StringUtils.hasText(code.getUsedByEmail())
                    ? " (đã được sử dụng bởi tài khoản " + maskEmail(code.getUsedByEmail()) + ")"
                    : "";
            return CodeCheckResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .statusMessage("Mã kích hoạt đã được sử dụng hết số lượt" + usedInfo + ". Mỗi mã chỉ áp dụng cho 01 tài khoản!")
                    .build();
        }

        Course course = courseRepository.findById(code.getCourseId()).orElse(null);

        return CodeCheckResponse.builder()
                .valid(true)
                .code(normalizedCode)
                .courseId(code.getCourseId())
                .courseTitle(course != null ? course.getTitle() : code.getCourseTitle())
                .teacherName(course != null ? course.getTeacherName() : "")
                .grade(course != null ? course.getGrade() : "")
                .subject(course != null ? course.getSubject() : "")
                .thumbnailUrl(course != null ? course.getThumbnailUrl() : "")
                .expiresAt(code.getExpiresAt())
                .statusMessage("Mã hợp lệ. Bạn có thể kích hoạt khóa học này ngay!")
                .build();
    }

    @Transactional
    public ActivationResponse activateCourse(ActivateRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập trước khi kích hoạt khóa học"));

        String normalizedCode = request.getCode().trim().toUpperCase();
        ActivationCode code = codeRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVATION_CODE_INVALID));

        if (!code.getIsActive()) {
            throw new AppException(ErrorCode.ACTIVATION_CODE_INVALID, "Mã kích hoạt hiện đang bị tạm khóa");
        }
        if (code.isExpired()) {
            throw new AppException(ErrorCode.ACTIVATION_CODE_EXPIRED);
        }
        if (code.isExhausted()) {
            String usedInfo = StringUtils.hasText(code.getUsedByEmail())
                    ? " (đã được sử dụng bởi tài khoản " + maskEmail(code.getUsedByEmail()) + ")"
                    : "";
            throw new AppException(ErrorCode.ACTIVATION_CODE_EXHAUSTED,
                    "Mã kích hoạt này đã được sử dụng hết số lượt" + usedInfo + "! Mỗi mã chỉ có giá trị sử dụng cho 01 tài khoản duy nhất.");
        }

        Course course = courseRepository.findById(code.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (enrollmentRepository.existsByUserIdAndCourseId(currentUser.getId(), course.getId())) {
            throw new AppException(ErrorCode.COURSE_ALREADY_ACTIVATED, "Bạn đã kích hoạt khóa học này rồi! Vui lòng vào mục 'Khóa học của tôi' để bắt đầu học.");
        }

        // Increment code usage and record audit trail of who redeemed this code
        code.setUsedCount(code.getUsedCount() + 1);
        code.setUsedByUserId(currentUser.getId());
        code.setUsedByEmail(currentUser.getEmail());
        code.setUsedAt(Instant.now());
        codeRepository.save(code);

        // Course student count +1
        course.setStudentCount(course.getStudentCount() + 1);
        courseRepository.save(course);

        // Create enrollment
        Instant now = Instant.now();
        Instant expiry = now.plus(365, ChronoUnit.DAYS); // 1 year access by default

        UserCourseEnrollment enrollment = UserCourseEnrollment.builder()
                .userId(currentUser.getId())
                .userEmail(currentUser.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .activationCode(normalizedCode)
                .activatedAt(now)
                .expiresAt(expiry)
                .progressPercent(0)
                .build();

        enrollmentRepository.save(enrollment);

        return ActivationResponse.builder()
                .success(true)
                .message("Kích hoạt khóa học thành công! Chúc bạn học tập hiệu quả cùng EduStudy.")
                .activationCode(normalizedCode)
                .course(CourseDto.fromEntity(course))
                .activatedAt(now)
                .expiresAt(expiry)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getMyCourses() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<UserCourseEnrollment> enrollments = enrollmentRepository.findByUserIdOrderByActivatedAtDesc(userId);
        List<Long> courseIds = enrollments.stream().map(UserCourseEnrollment::getCourseId).toList();
        List<Course> courses = courseRepository.findAllById(courseIds);

        return courses.stream().map(CourseDto::fromEntity).toList();
    }

    // Admin methods
    @Transactional(readOnly = true)
    public List<ActivationCode> getAllCodes() {
        return codeRepository.findAllByOrderByCreatedAtDesc();
    }

    /** Trạng thái phái sinh của một mã, khớp với bộ lọc phía frontend. */
    private boolean matchesStatus(ActivationCode c, String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return true;
        boolean exhausted = c.getUsedCount() != null && c.getMaxUses() != null && c.getUsedCount() >= c.getMaxUses();
        boolean expired = c.getExpiresAt() != null && !c.getExpiresAt().isAfter(Instant.now());
        boolean locked = Boolean.FALSE.equals(c.getIsActive());
        return switch (status.toUpperCase()) {
            case "AVAILABLE" -> !exhausted && !expired && !locked;
            case "USED" -> exhausted;
            case "LOCKED" -> locked;
            case "EXPIRED" -> expired;
            default -> true;
        };
    }

    /**
     * Phân trang + lọc mã kích hoạt phía server. Chỉ tải base 1 lần rồi lọc/cắt trang,
     * nên payload trả về chỉ gồm 1 trang (hiển thị nhanh kể cả khi có hàng nghìn mã).
     */
    @Transactional(readOnly = true)
    public PageResponse<ActivationCode> getCodesPage(String search, Long courseId, String status, int page, int size) {
        String kw = search != null ? search.trim().toLowerCase() : "";
        List<ActivationCode> filtered = codeRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> courseId == null || courseId.equals(c.getCourseId()))
                .filter(c -> matchesStatus(c, status))
                .filter(c -> {
                    if (kw.isEmpty()) return true;
                    return (c.getCode() != null && c.getCode().toLowerCase().contains(kw))
                            || (c.getCourseTitle() != null && c.getCourseTitle().toLowerCase().contains(kw))
                            || (c.getUsedByEmail() != null && c.getUsedByEmail().toLowerCase().contains(kw))
                            || (c.getNotes() != null && c.getNotes().toLowerCase().contains(kw));
                })
                .toList();
        return PageResponse.of(filtered, page, size);
    }

    /** Thống kê tổng quan trên toàn bộ mã (phục vụ các thẻ KPI). */
    @Transactional(readOnly = true)
    public Map<String, Long> getCodesStats() {
        List<ActivationCode> all = codeRepository.findAll();
        Instant now = Instant.now();
        long total = all.size();
        long available = all.stream().filter(c ->
                (c.getUsedCount() == null || c.getMaxUses() == null || c.getUsedCount() < c.getMaxUses())
                && Boolean.TRUE.equals(c.getIsActive())
                && (c.getExpiresAt() == null || c.getExpiresAt().isAfter(now))).count();
        long used = all.stream().filter(c ->
                c.getUsedCount() != null && c.getMaxUses() != null && c.getUsedCount() >= c.getMaxUses()).count();
        long lockedOrExpired = all.stream().filter(c ->
                Boolean.FALSE.equals(c.getIsActive())
                || (c.getExpiresAt() != null && !c.getExpiresAt().isAfter(now))).count();
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("available", available);
        stats.put("used", used);
        stats.put("lockedOrExpired", lockedOrExpired);
        return stats;
    }

    @Transactional
    public ActivationCode createCode(ActivationCodeRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        String codeStr = StringUtils.hasText(request.getCode())
                ? request.getCode().trim().toUpperCase()
                : generateRandomCode("ACT-", 8);

        // If generated code accidentally exists, regenerate securely
        while (codeRepository.existsByCodeIgnoreCase(codeStr)) {
            codeStr = generateRandomCode("ACT-", 8);
        }

        ActivationCode code = ActivationCode.builder()
                .code(codeStr)
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .maxUses(request.getMaxUses() != null && request.getMaxUses() > 0 ? request.getMaxUses() : 1)
                .usedCount(0)
                .expiresAt(request.getExpiresAt() != null ? request.getExpiresAt() : Instant.now().plus(365, ChronoUnit.DAYS))
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .notes(request.getNotes())
                .build();

        return codeRepository.save(code);
    }

    @Transactional
    public List<ActivationCode> batchGenerate(BatchGenerateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        int qty = request.getQuantity() != null ? Math.min(request.getQuantity(), 100) : 5;
        String prefix = StringUtils.hasText(request.getPrefix()) ? request.getPrefix().trim() : "ACT-";
        Instant expiresAt = request.getExpiresAt() != null ? request.getExpiresAt() : Instant.now().plus(365, ChronoUnit.DAYS);
        String batchId = "BATCH-" + System.currentTimeMillis();

        List<ActivationCode> list = new ArrayList<>();
        for (int i = 0; i < qty; i++) {
            String codeStr = generateRandomCode(prefix, 8);
            while (codeRepository.existsByCodeIgnoreCase(codeStr)) {
                codeStr = generateRandomCode(prefix, 8);
            }

            ActivationCode code = ActivationCode.builder()
                    .code(codeStr)
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .maxUses(request.getMaxUsesPerCode() != null && request.getMaxUsesPerCode() > 0 ? request.getMaxUsesPerCode() : 1)
                    .usedCount(0)
                    .expiresAt(expiresAt)
                    .isActive(true)
                    .batchId(batchId)
                    .notes(request.getNotes())
                    .build();

            list.add(code);
        }

        return codeRepository.saveAll(list);
    }

    @Transactional
    public ActivationCode updateCode(Long id, UpdateCodeRequest request) {
        ActivationCode code = codeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVATION_CODE_INVALID, "Không tìm thấy mã kích hoạt ID: " + id));

        if (request.getMaxUses() != null && request.getMaxUses() > 0) {
            code.setMaxUses(request.getMaxUses());
        }
        if (request.getExpiresAt() != null) {
            code.setExpiresAt(request.getExpiresAt());
        }
        if (request.getIsActive() != null) {
            code.setIsActive(request.getIsActive());
        }
        if (request.getNotes() != null) {
            code.setNotes(request.getNotes());
        }

        return codeRepository.save(code);
    }

    @Transactional
    public ActivationCode toggleCodeStatus(Long id) {
        ActivationCode code = codeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVATION_CODE_INVALID, "Không tìm thấy mã kích hoạt ID: " + id));

        code.setIsActive(code.getIsActive() == null || !code.getIsActive());
        return codeRepository.save(code);
    }

    @Transactional
    public void deleteCode(Long id) {
        codeRepository.deleteById(id);
    }
}
