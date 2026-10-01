package com.edustudy.order.service;

import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.config.PaymentProperties;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.order.dto.SepayWebhookRequest;
import com.edustudy.order.entity.Order;
import com.edustudy.order.entity.Payment;
import com.edustudy.order.model.OrderStatus;
import com.edustudy.order.repository.OrderRepository;
import com.edustudy.order.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayWebhookService {

    private final PaymentProperties paymentProperties;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;

    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(?i)(DH[A-Z0-9]{8}|ORD-[A-Z0-9]{4}-[A-Z0-9]{4})");

    /**
     * Xác thực chữ ký HMAC-SHA256 từ raw body và secret cấu hình
     */
    public boolean verifySignature(String rawBody, String signatureHeader, String timestampHeader) {
        String secret = paymentProperties.getSepay().getWebhookSecret();
        if (!StringUtils.hasText(secret)) {
            log.warn("SEPAY_WEBHOOK_SECRET is not configured or empty");
            return false;
        }

        if (!StringUtils.hasText(signatureHeader)) {
            log.warn("Missing SePay signature header");
            return false;
        }

        String cleanSig = signatureHeader.trim();
        if (cleanSig.toLowerCase().startsWith("sha256=")) {
            cleanSig = cleanSig.substring(7).trim();
        }

        // 1. Kiểm tra timestamp + "." + rawBody nếu có header timestamp
        if (StringUtils.hasText(timestampHeader)) {
            String data = timestampHeader.trim() + "." + rawBody;
            if (checkHmac(data, cleanSig, secret)) {
                return true;
            }
        }

        // 2. Kiểm tra rawBody trực tiếp
        if (checkHmac(rawBody, cleanSig, secret)) {
            return true;
        }

        // 3. Hỗ trợ trường hợp gửi kiểu Apikey <secret>
        if (cleanSig.startsWith("Apikey ")) {
            String apiKey = cleanSig.substring(7).trim();
            return MessageDigest.isEqual(
                    apiKey.getBytes(StandardCharsets.UTF_8),
                    secret.getBytes(StandardCharsets.UTF_8)
            );
        }

        return false;
    }

    private boolean checkHmac(String data, String expectedHex, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(hash);

            return MessageDigest.isEqual(
                    computedHex.toLowerCase().getBytes(StandardCharsets.UTF_8),
                    expectedHex.toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Error computing HMAC: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Xử lý webhook SePay theo đúng 7 bước yêu cầu, nằm trọn trong 1 transaction
     */
    @Transactional
    public ProcessWebhookResult processWebhook(String rawBody, SepayWebhookRequest request) {
        if (request == null || request.getId() == null) {
            log.warn("SePay webhook request or transaction ID is null");
            return new ProcessWebhookResult(true, "Transaction ID missing");
        }

        Long transactionId = request.getId();

        // Bước 2: Kiểm tra transaction id (chống xử lý duplicate)
        if (paymentRepository.existsBySepayTransactionId(transactionId)) {
            log.info("Transaction {} already processed. Skipping duplicate.", transactionId);
            return new ProcessWebhookResult(true, "Transaction already processed");
        }

        // Bước 3: Kiểm tra transferType == "in"
        String transferType = request.getTransferType() != null ? request.getTransferType().trim().toLowerCase() : "";
        if (!"in".equalsIgnoreCase(transferType)) {
            log.info("Ignored non-in transaction: {} type={}", transactionId, request.getTransferType());
            return new ProcessWebhookResult(true, "Ignored non-in transaction");
        }

        // Bước 4: Lấy code từ webhook và tìm Order
        String code = request.getCode();
        if (!StringUtils.hasText(code) && StringUtils.hasText(request.getContent())) {
            Matcher matcher = ORDER_CODE_PATTERN.matcher(request.getContent());
            if (matcher.find()) {
                code = matcher.group(1).toUpperCase();
            }
        }

        log.info("Received SePay transaction: {}", transactionId);
        log.info("Payment code: {}", code);

        if (!StringUtils.hasText(code)) {
            log.warn("Cannot extract order code from transaction {}", transactionId);
            return new ProcessWebhookResult(true, "Order code missing in transaction");
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(code.trim());
        if (orderOpt.isEmpty()) {
            log.warn("Order not found for code: {}", code);
            return new ProcessWebhookResult(true, "Order not found");
        }

        Order order = orderOpt.get();
        log.info("Order found: {}", order.getOrderCode());

        // Bước 5: Kiểm tra số tiền
        BigDecimal transferAmount = request.getTransferAmount() != null ? request.getTransferAmount() : BigDecimal.ZERO;
        log.info("Payment amount: {}", transferAmount);

        if (transferAmount.compareTo(order.getAmount()) != 0) {
            log.warn("Amount mismatch for order {}. Expected: {}, Received: {}",
                    order.getOrderCode(), order.getAmount(), transferAmount);
            return new ProcessWebhookResult(true, "Amount mismatch, payment not marked as PAID");
        }

        // Bước 6: Kiểm tra Order status == PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            log.info("Order {} is already in status {}, not processing again.",
                    order.getOrderCode(), order.getStatus());
            return new ProcessWebhookResult(true, "Order already processed");
        }

        // Bước 7: Tất cả hợp lệ -> Lưu Payment, chuyển Order -> PAID, kích hoạt Enrollment -> ACTIVE
        Payment payment = Payment.builder()
                .orderId(order.getId())
                .sepayTransactionId(transactionId)
                .gateway(request.getGateway())
                .accountNumber(request.getAccountNumber())
                .transferType(request.getTransferType())
                .transferAmount(transferAmount)
                .paymentCode(code)
                .content(request.getContent())
                .referenceCode(request.getReferenceCode())
                .transactionDate(request.getTransactionDate())
                .rawPayload(rawBody)
                .build();
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(Instant.now());
        order.setApprovedBy("SePay Webhook");
        orderRepository.save(order);
        log.info("Order marked as PAID: {}", order.getOrderCode());

        if (!enrollmentRepository.existsByUserIdAndCourseId(order.getUserId(), order.getCourseId())) {
            UserCourseEnrollment enrollment = UserCourseEnrollment.builder()
                    .userId(order.getUserId())
                    .userEmail(order.getUserEmail())
                    .courseId(order.getCourseId())
                    .courseTitle(order.getCourseTitle())
                    .activationCode("SEPAY_" + order.getOrderCode())
                    .activatedAt(Instant.now())
                    .expiresAt(Instant.now().plus(365, ChronoUnit.DAYS))
                    .progressPercent(0)
                    .status("ACTIVE")
                    .build();
            enrollmentRepository.save(enrollment);
            log.info("Enrollment created: {}/{}", order.getUserId(), order.getCourseId());

            courseRepository.findById(order.getCourseId()).ifPresent(c -> {
                c.setStudentCount((c.getStudentCount() != null ? c.getStudentCount() : 0) + 1);
                courseRepository.save(c);
            });
        }

        return new ProcessWebhookResult(true, "Payment processed successfully");
    }

    public record ProcessWebhookResult(boolean success, String message) {}
}
