package com.edustudy.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.course.entity.Course;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.order.dto.CreateOrderRequest;
import com.edustudy.order.entity.Order;
import com.edustudy.order.model.OrderStatus;
import com.edustudy.order.repository.OrderRepository;
import com.edustudy.security.JwtTokenProvider;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderAndAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserCourseEnrollmentRepository enrollmentRepository;

    private User student1;
    private User student2;
    private Course course;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        enrollmentRepository.deleteAll();
        orderRepository.deleteAll();

        student1 = userRepository.findByEmail("student_buyer_1@gmail.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("student_buyer_1@gmail.com")
                        .password("pass123")
                        .fullName("Student Buyer One")
                        .phone("0912345678")
                        .role(Role.ROLE_STUDENT)
                        .active(true)
                        .build())
        );

        student2 = userRepository.findByEmail("student_buyer_2@gmail.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("student_buyer_2@gmail.com")
                        .password("pass123")
                        .fullName("Student Buyer Two")
                        .phone("0987654321")
                        .role(Role.ROLE_STUDENT)
                        .active(true)
                        .build())
        );

        course = courseRepository.findBySlug("khoa-hoc-toan-12-order-test").orElseGet(() ->
                courseRepository.save(Course.builder()
                        .title("Khóa học Toán 12 Order Test")
                        .slug("khoa-hoc-toan-12-order-test")
                        .grade("12")
                        .subject("TOAN")
                        .price(new BigDecimal("350000"))
                        .isActive(true)
                        .build())
        );

        token1 = jwtTokenProvider.generateTokenForUser(student1.getId(), student1.getEmail(), student1.getRole().name());
        token2 = jwtTokenProvider.generateTokenForUser(student2.getId(), student2.getEmail(), student2.getRole().name());
    }

    @Test
    @DisplayName("API POST /api/orders tạo đơn hàng thành công và trả về đúng format")
    void testCreateOrderApi() throws Exception {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .courseId(course.getId())
                .phone("0912345678")
                .notes("Học sinh mua qua app")
                .build();

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token1)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCode").exists())
                .andExpect(jsonPath("$.amount").value(350000))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.qrUrl").exists())
                .andExpect(jsonPath("$.expiresAt").exists());
    }

    @Test
    @DisplayName("API GET /api/orders/{orderCode}/status - User sở hữu xem được trạng thái đơn hàng")
    void testGetOrderStatus_Owner() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .orderCode("DH99999999")
                .userId(student1.getId())
                .userEmail(student1.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .amount(new BigDecimal("350000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        mockMvc.perform(get("/api/orders/DH99999999/status")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCode").value("DH99999999"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("API GET /api/orders/{orderCode}/status - User khác xem đơn sẽ bị 403 Forbidden")
    void testGetOrderStatus_ForbiddenOtherUser() throws Exception {
        orderRepository.save(Order.builder()
                .orderCode("DH88888888")
                .userId(student1.getId())
                .userEmail(student1.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .amount(new BigDecimal("350000"))
                .status(OrderStatus.PENDING)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build());

        // student2 cố gắng xem đơn hàng của student1
        mockMvc.perform(get("/api/orders/DH88888888/status")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("API GET /api/courses/{courseId}/learn - Chưa có Enrollment ACTIVE bị 403 Forbidden")
    void testLearnCourse_ForbiddenWithoutEnrollment() throws Exception {
        mockMvc.perform(get("/api/courses/" + course.getId() + "/learn")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("API GET /api/courses/{courseId}/learn - Đã có Enrollment ACTIVE được phép truy cập (200 OK)")
    void testLearnCourse_SuccessWithActiveEnrollment() throws Exception {
        enrollmentRepository.save(UserCourseEnrollment.builder()
                .userId(student1.getId())
                .userEmail(student1.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .status("ACTIVE")
                .activatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/courses/" + course.getId() + "/learn")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(course.getId()));
    }
}
