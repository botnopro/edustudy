package com.edustudy.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.course.entity.Course;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.order.dto.SepayWebhookRequest;
import com.edustudy.order.entity.Order;
import com.edustudy.order.model.OrderStatus;
import com.edustudy.order.repository.OrderRepository;
import com.edustudy.order.repository.PaymentRepository;
import com.edustudy.user.Role;
import com.edustudy.user.User;
import com.edustudy.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SepayWebhookIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCourseEnrollmentRepository enrollmentRepository;

    private static final String TEST_SECRET = "test-sepay-secret-key-123456";

    private User testUser;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        orderRepository.deleteAll();

        testUser = userRepository.findByEmail("test_student@gmail.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("test_student@gmail.com")
                        .password("hashed_password_123")
                        .fullName("Học Sinh Test")
                        .phone("0901234567")
                        .role(Role.ROLE_STUDENT)
                        .active(true)
                        .build())
        );

        testCourse = courseRepository.findBySlug("khoa-hoc-toan-12-test").orElseGet(() ->
                courseRepository.save(Course.builder()
                        .title("Khóa học Toán 12 Test")
                        .slug("khoa-hoc-toan-12-test")
                        .grade("12")
                        .subject("TOAN")
                        .price(new BigDecimal("299000"))
                        .isActive(true)
                        .build())
        );
    }

    private String calculateHmac(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(TEST_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    @Test
    @DisplayName("Test 1 — Thanh toán hợp lệ: đúng code + đúng amount -> Order PAID & Enrollment ACTIVE")
    void test1_ValidPayment_Success() throws Exception {
        String orderCode = "DH8F42A1C7";
        Order order = orderRepository.save(Order.builder()
                .orderCode(orderCode)
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .courseId(testCourse.getId())
                .courseTitle(testCourse.getTitle())
                .amount(new BigDecimal("299000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92704L)
                .gateway("Vietcombank")
                .transactionDate("2026-09-25 15:20:00")
                .accountNumber("123456789")
                .code(orderCode)
                .content(orderCode + " thanh toan")
                .transferType("in")
                .transferAmount(new BigDecimal("299000"))
                .referenceCode("FT123456")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);
        String signature = calculateHmac(rawBody);

        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        Order updatedOrder = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals(OrderStatus.PAID, updatedOrder.getStatus());
        assertNotNull(updatedOrder.getPaidAt());

        assertTrue(paymentRepository.existsBySepayTransactionId(92704L));
        assertTrue(enrollmentRepository.existsByUserIdAndCourseIdAndStatus(testUser.getId(), testCourse.getId(), "ACTIVE"));
    }

    @Test
    @DisplayName("Test 2 — Sai số tiền: Order = 299000, Webhook = 100000 -> không PAID, không Enrollment")
    void test2_AmountMismatch_NoPaidNoEnrollment() throws Exception {
        String orderCode = "DH8F42A1C8";
        Order order = orderRepository.save(Order.builder()
                .orderCode(orderCode)
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .courseId(testCourse.getId())
                .courseTitle(testCourse.getTitle())
                .amount(new BigDecimal("299000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92705L)
                .gateway("MBBank")
                .transactionDate("2026-09-25 15:21:00")
                .accountNumber("123456789")
                .code(orderCode)
                .content(orderCode + " sai tien")
                .transferType("in")
                .transferAmount(new BigDecimal("100000"))
                .referenceCode("FT123457")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);
        String signature = calculateHmac(rawBody);

        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        Order updatedOrder = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals(OrderStatus.PENDING, updatedOrder.getStatus());
        assertNull(updatedOrder.getPaidAt());

        assertFalse(enrollmentRepository.existsByUserIdAndCourseId(testUser.getId(), testCourse.getId()));
    }

    @Test
    @DisplayName("Test 3 — Sai Order Code: DHXXXXXXXX -> không tìm thấy Order -> không Enrollment")
    void test3_InvalidOrderCode_NotFound() throws Exception {
        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92706L)
                .gateway("VietinBank")
                .transactionDate("2026-09-25 15:22:00")
                .accountNumber("123456789")
                .code("DHXXXXXXXX")
                .content("DHXXXXXXXX chuyen khoan")
                .transferType("in")
                .transferAmount(new BigDecimal("299000"))
                .referenceCode("FT123458")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);
        String signature = calculateHmac(rawBody);

        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        assertFalse(enrollmentRepository.existsByUserIdAndCourseId(testUser.getId(), testCourse.getId()));
    }

    @Test
    @DisplayName("Test 4 — Duplicate webhook: gửi cùng transaction ID 2 lần -> chỉ tạo 1 Payment, 1 Enrollment")
    void test4_DuplicateWebhook_OnlyOnePaymentAndOneEnrollment() throws Exception {
        String orderCode = "DH8F42A1C9";
        orderRepository.save(Order.builder()
                .orderCode(orderCode)
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .courseId(testCourse.getId())
                .courseTitle(testCourse.getTitle())
                .amount(new BigDecimal("299000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92704L)
                .gateway("Vietcombank")
                .transactionDate("2026-09-25 15:20:00")
                .accountNumber("123456789")
                .code(orderCode)
                .content(orderCode + " thanh toan lan 1")
                .transferType("in")
                .transferAmount(new BigDecimal("299000"))
                .referenceCode("FT123456")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);
        String signature = calculateHmac(rawBody);

        // Lần 1
        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        // Lần 2 (Duplicate transaction)
        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        assertEquals(1, paymentRepository.findAll().stream().filter(p -> p.getSepayTransactionId().equals(92704L)).count());
        assertEquals(1, enrollmentRepository.findByCourseId(testCourse.getId()).size());
    }

    @Test
    @DisplayName("Test 5 — Sai signature: Webhook có signature sai -> HTTP 401 Unauthorized -> không xử lý payment")
    void test5_InvalidSignature_Returns401() throws Exception {
        String orderCode = "DH8F42A1D0";
        orderRepository.save(Order.builder()
                .orderCode(orderCode)
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .courseId(testCourse.getId())
                .courseTitle(testCourse.getTitle())
                .amount(new BigDecimal("299000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92708L)
                .gateway("ACB")
                .transactionDate("2026-09-25 15:23:00")
                .accountNumber("123456789")
                .code(orderCode)
                .content(orderCode + " hacker hack")
                .transferType("in")
                .transferAmount(new BigDecimal("299000"))
                .referenceCode("FT123460")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", "wrong_fake_signature_hex_123456")
                        .content(rawBody))
                .andExpect(status().isUnauthorized());

        assertFalse(paymentRepository.existsBySepayTransactionId(92708L));
        assertFalse(enrollmentRepository.existsByUserIdAndCourseId(testUser.getId(), testCourse.getId()));
    }

    @Test
    @DisplayName("Test 6 — Outgoing transaction: transferType = 'out' -> không xử lý payment, không Enrollment")
    void test6_OutgoingTransaction_Ignored() throws Exception {
        String orderCode = "DH8F42A1D1";
        orderRepository.save(Order.builder()
                .orderCode(orderCode)
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .courseId(testCourse.getId())
                .courseTitle(testCourse.getTitle())
                .amount(new BigDecimal("299000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        SepayWebhookRequest request = SepayWebhookRequest.builder()
                .id(92709L)
                .gateway("Techcombank")
                .transactionDate("2026-09-25 15:24:00")
                .accountNumber("123456789")
                .code(orderCode)
                .content(orderCode + " chuyen tien ra")
                .transferType("out")
                .transferAmount(new BigDecimal("299000"))
                .referenceCode("FT123461")
                .build();

        String rawBody = objectMapper.writeValueAsString(request);
        String signature = calculateHmac(rawBody);

        mockMvc.perform(post("/api/webhooks/sepay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-SePay-Signature", signature)
                        .content(rawBody))
                .andExpect(status().isOk());

        assertFalse(paymentRepository.existsBySepayTransactionId(92709L));
        assertFalse(enrollmentRepository.existsByUserIdAndCourseId(testUser.getId(), testCourse.getId()));
    }
}
