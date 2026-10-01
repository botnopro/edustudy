package com.edustudy.order.service;

import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.config.PaymentProperties;
import com.edustudy.course.entity.Course;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.order.dto.CreateOrderRequest;
import com.edustudy.order.dto.CreateOrderResponse;
import com.edustudy.order.dto.OrderDto;
import com.edustudy.order.dto.OrderStatusResponse;
import com.edustudy.order.entity.Order;
import com.edustudy.order.model.OrderStatus;
import com.edustudy.order.repository.OrderRepository;
import com.edustudy.security.SecurityUtils;
import com.edustudy.security.UserPrincipal;
import com.edustudy.user.User;
import com.edustudy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final PaymentProperties paymentProperties;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Sinh mã đơn hàng duy nhất dạng DH8F42A1C7 (10 ký tự)
     */
    public String generateOrderCode() {
        StringBuilder sb = new StringBuilder("DH");
        for (int i = 0; i < 8; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Sinh link VietQR Quick Link chuẩn format từ cấu hình Environment Variables
     */
    public String generateVietQrUrl(Order order) {
        long amount = order.getAmount() != null ? order.getAmount().longValue() : 0L;
        String bankBin = paymentProperties.getBankBin();
        String bankAccount = paymentProperties.getBankAccount();
        String accountName = paymentProperties.getBankAccountName();
        String orderCode = order.getOrderCode();

        String encodedAddInfo = URLEncoder.encode(orderCode != null ? orderCode : "", StandardCharsets.UTF_8).replace("+", "%20");
        String encodedAccountName = URLEncoder.encode(accountName != null ? accountName : "", StandardCharsets.UTF_8).replace("+", "%20");

        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                bankBin, bankAccount, amount, encodedAddInfo, encodedAccountName
        );
    }

    @Transactional
    public OrderDto createOrder(CreateOrderRequest req) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thanh toán mua khóa học"));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Long courseId = req.getParsedCourseId();
        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId).orElse(null);
        }
        if (course == null && req.getRawCourseIdentifier() != null) {
            course = courseRepository.findBySlug(req.getRawCourseIdentifier()).orElse(null);
        }
        if (course == null) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND, "Không tìm thấy khóa học yêu cầu");
        }

        // Kiểm tra xem học sinh đã sở hữu khóa học này chưa
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new AppException(ErrorCode.COURSE_ALREADY_ACTIVATED, "Bạn đã đăng ký và sở hữu khóa học này rồi!");
        }

        Instant now = Instant.now();

        // Nếu đã có đơn PENDING chưa hết hạn cho khóa học này, tái sử dụng để tránh tạo nhiều đơn rác
        var existingPending = orderRepository.findFirstByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), OrderStatus.PENDING);
        if (existingPending.isPresent()) {
            Order existing = existingPending.get();
            if (existing.getExpiresAt() != null && existing.getExpiresAt().isAfter(now)) {
                String qr = generateVietQrUrl(existing);
                return OrderDto.fromEntity(existing, qr);
            }
            existing.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(existing);
        }

        String orderCode = generateOrderCode();
        while (orderRepository.findByOrderCode(orderCode).isPresent()) {
            orderCode = generateOrderCode();
        }

        Instant expiresAt = now.plus(15, ChronoUnit.MINUTES);
        String phone = StringUtils.hasText(req.getPhone()) ? req.getPhone().trim() : user.getPhone();

        Order order = Order.builder()
                .orderCode(orderCode)
                .userId(user.getId())
                .userFullName(user.getFullName())
                .userEmail(user.getEmail())
                .userPhone(phone)
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseThumbnail(course.getThumbnailUrl())
                .amount(course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO)
                .status(OrderStatus.PENDING)
                .transferContent(orderCode)
                .notes(req.getNotes())
                .expiresAt(expiresAt)
                .build();

        Order saved = orderRepository.save(order);
        String qrUrl = generateVietQrUrl(saved);

        log.info("Created order {} for user {} for course '{}', expires at {}",
                saved.getOrderCode(), user.getEmail(), course.getTitle(), expiresAt);

        return OrderDto.fromEntity(saved, qrUrl);
    }

    @Transactional
    public CreateOrderResponse createOrderSimple(CreateOrderRequest req) {
        OrderDto dto = createOrder(req);
        return CreateOrderResponse.builder()
                .orderCode(dto.getOrderCode())
                .amount(dto.getAmount())
                .status(dto.getStatus())
                .qrUrl(dto.getQrUrl())
                .expiresAt(dto.getExpiresAt())
                .build();
    }

    /**
     * API kiểm tra trạng thái đơn hàng (chỉ user sở hữu hoặc admin mới được xem)
     */
    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(String orderCode) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để kiểm tra trạng thái đơn hàng"));

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng với mã: " + orderCode));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !currentUser.getId().equals(order.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem thông tin đơn hàng này");
        }

        return OrderStatusResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .build();
    }

    /**
     * Admin xác nhận đã thanh toán -> tự động duyệt học sinh vào lớp học
     */
    @Transactional
    public OrderDto approveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đơn hàng này đã được xác nhận thanh toán trước đó rồi");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể duyệt đơn hàng đã bị hủy");
        }

        Course course = courseRepository.findById(order.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        User user = userRepository.findById(order.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserPrincipal adminUser = SecurityUtils.getCurrentUser().orElse(null);
        String approverName = adminUser != null ? adminUser.getEmail() : "Admin";

        if (!enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            Instant now = Instant.now();
            Instant expiry = now.plus(365, ChronoUnit.DAYS);

            UserCourseEnrollment enrollment = UserCourseEnrollment.builder()
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .activationCode("ORDER_" + order.getOrderCode())
                    .activatedAt(now)
                    .expiresAt(expiry)
                    .progressPercent(0)
                    .status("ACTIVE")
                    .build();

            enrollmentRepository.save(enrollment);

            course.setStudentCount((course.getStudentCount() != null ? course.getStudentCount() : 0) + 1);
            courseRepository.save(course);
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(Instant.now());
        order.setApprovedBy(approverName);
        Order saved = orderRepository.save(order);

        log.info("Admin '{}' approved order {} -> Student '{}' automatically enrolled into course '{}'",
                approverName, saved.getOrderCode(), user.getEmail(), course.getTitle());

        return OrderDto.fromEntity(saved, generateVietQrUrl(saved));
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể hủy đơn hàng đã thanh toán thành công");
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (StringUtils.hasText(reason)) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | Lý do hủy: " : "Lý do hủy: ") + reason);
        }

        Order saved = orderRepository.save(order);
        log.info("Order {} was cancelled. Reason: {}", saved.getOrderCode(), reason);
        return OrderDto.fromEntity(saved, generateVietQrUrl(saved));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders(OrderStatus status, String keyword) {
        List<Order> orders;
        if (!StringUtils.hasText(keyword)) {
            if (status != null) {
                orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
            } else {
                orders = orderRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            orders = orderRepository.searchOrders(status, keyword.trim());
        }
        return orders.stream().map(o -> OrderDto.fromEntity(o, generateVietQrUrl(o))).toList();
    }

    /** Phân trang đơn hàng (tận dụng truy vấn lọc sẵn có), chỉ map 1 trang về frontend. */
    @Transactional(readOnly = true)
    public com.edustudy.common.PageResponse<OrderDto> getOrdersPage(OrderStatus status, String keyword, int page, int size) {
        List<OrderDto> all = getAllOrders(status, keyword);
        return com.edustudy.common.PageResponse.of(all, page, size);
    }

    /** Thống kê tổng quan đơn hàng phục vụ các thẻ KPI (không phụ thuộc trang). */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getOrdersStats() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long completed = orderRepository.countByStatus(OrderStatus.PAID);
        long revenue = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PAID).stream()
                .mapToLong(o -> o.getAmount() != null ? o.getAmount().longValue() : 0L).sum();
        java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
        stats.put("pending", pending);
        stats.put("completed", completed);
        stats.put("revenue", revenue);
        return stats;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(o -> OrderDto.fromEntity(o, generateVietQrUrl(o)))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto checkOrderStatus(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng với mã: " + orderCode));
        return OrderDto.fromEntity(order, generateVietQrUrl(order));
    }

    @Transactional(readOnly = true)
    public long countPendingOrders() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }
}
