package com.edustudy.config;

import com.edustudy.activation.entity.ActivationCode;
import com.edustudy.activation.repository.ActivationCodeRepository;
import com.edustudy.content.entity.Banner;
import com.edustudy.content.entity.FaqItem;
import com.edustudy.content.entity.Testimonial;
import com.edustudy.content.repository.BannerRepository;
import com.edustudy.content.repository.FaqItemRepository;
import com.edustudy.content.repository.TestimonialRepository;
import com.edustudy.course.entity.Course;
import com.edustudy.course.entity.Lesson;
import com.edustudy.course.repository.CourseRepository;
import com.edustudy.course.repository.LessonRepository;
import com.edustudy.teacher.Teacher;
import com.edustudy.teacher.TeacherRepository;
import com.edustudy.user.Role;
import com.edustudy.user.User;
import com.edustudy.user.UserRepository;
import com.edustudy.category.entity.Grade;
import com.edustudy.category.entity.Subject;
import com.edustudy.category.repository.GradeRepository;
import com.edustudy.category.repository.SubjectRepository;
import com.edustudy.activation.entity.UserCourseEnrollment;
import com.edustudy.activation.repository.UserCourseEnrollmentRepository;
import com.edustudy.quiz.entity.Quiz;
import com.edustudy.quiz.entity.QuizQuestion;
import com.edustudy.quiz.repository.QuizQuestionRepository;
import com.edustudy.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ActivationCodeRepository codeRepository;
    private final BannerRepository bannerRepository;
    private final FaqItemRepository faqItemRepository;
    private final TestimonialRepository testimonialRepository;
    private final GradeRepository gradeRepository;
    private final SubjectRepository subjectRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
                ensureAdminAccount();
                ensureAdminAccount("admin2@edustudy.com", "Admin@2026", "Quản trị viên 2", "0977778888");
                ensureStudentAccount("hocsinh@edustudy.com", "student123", "Nguyễn Minh Anh", "0912345678", 12,
                                "THPT Chuyên Hà Nội - Amsterdam",
                                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80");
        seedBaseData();
        seedQuizzes();
        seedGrade11BatchExams();
        seedRealStudents();
        updateRealVideoLessons();
        seedGrade10PromoBanner();
    }

        private void ensureAdminAccount() {
                String adminEmail = "admin@edustudy.com";
                User admin = userRepository.findByEmail(adminEmail).orElse(null);

                if (admin == null) {
                        admin = User.builder()
                                        .email(adminEmail)
                                        .password(passwordEncoder.encode("admin123"))
                                        .fullName("Quản trị viên Hệ thống")
                                        .phone("0988889999")
                                        .role(Role.ROLE_ADMIN)
                                        .active(true)
                                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                                        .build();
                        userRepository.save(admin);
                        log.info("Admin account created: {}", adminEmail);
                        return;
                }

                if (!Boolean.TRUE.equals(admin.getActive())) {
                        admin.setActive(true);
                        admin.setRole(Role.ROLE_ADMIN);
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        userRepository.save(admin);
                        log.info("Admin account reactivated and password reset: {}", adminEmail);
                }
        }

        /**
         * Ensures an additional admin account exists. Idempotent: creates it if missing,
         * otherwise only re-activates + resets the password if the account was deactivated.
         */
        private void ensureAdminAccount(String email, String rawPassword, String fullName, String phone) {
                User admin = userRepository.findByEmail(email).orElse(null);

                if (admin == null) {
                        admin = User.builder()
                                        .email(email)
                                        .password(passwordEncoder.encode(rawPassword))
                                        .fullName(fullName)
                                        .phone(phone)
                                        .role(Role.ROLE_ADMIN)
                                        .active(true)
                                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                                        .build();
                        userRepository.save(admin);
                        log.info("Admin account created: {}", email);
                        return;
                }

                if (!Boolean.TRUE.equals(admin.getActive())) {
                        admin.setActive(true);
                        admin.setRole(Role.ROLE_ADMIN);
                        admin.setPassword(passwordEncoder.encode(rawPassword));
                        userRepository.save(admin);
                        log.info("Admin account reactivated and password reset: {}", email);
                }
        }

        /**
         * Ensures a sample student account exists independently of the {@code count > 0}
         * guard in {@link #seedBaseData()}. Idempotent: creates it if missing, otherwise
         * only re-activates + resets the password if the account was deactivated.
         */
        private void ensureStudentAccount(String email, String rawPassword, String fullName, String phone,
                        Integer gradeLevel, String schoolName, String avatarUrl) {
                User student = userRepository.findByEmail(email).orElse(null);

                if (student == null) {
                        student = User.builder()
                                        .email(email)
                                        .password(passwordEncoder.encode(rawPassword))
                                        .fullName(fullName)
                                        .phone(phone)
                                        .gradeLevel(gradeLevel)
                                        .schoolName(schoolName)
                                        .role(Role.ROLE_STUDENT)
                                        .active(true)
                                        .avatarUrl(avatarUrl)
                                        .build();
                        userRepository.save(student);
                        log.info("Student account created: {}", email);
                        return;
                }

                if (!Boolean.TRUE.equals(student.getActive())) {
                        student.setActive(true);
                        student.setRole(Role.ROLE_STUDENT);
                        student.setPassword(passwordEncoder.encode(rawPassword));
                        userRepository.save(student);
                        log.info("Student account reactivated and password reset: {}", email);
                }
        }

    private void seedBaseData() {
        if (userRepository.count() > 0) {
            log.info("Base users and courses already seeded. Skipping initial course load.");
            return;
        }

        log.info("Starting database seeding for platform...");

        // 1. Seed Users (Admin & Student)
        User admin = User.builder()
                .email("admin@edustudy.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Quản trị viên Hệ thống")
                .phone("0988889999")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                .build();

        User student = User.builder()
                .email("hocsinh@edustudy.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Nguyễn Minh Anh")
                .phone("0912345678")
                .gradeLevel(12)
                .schoolName("THPT Chuyên Hà Nội - Amsterdam")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80")
                .build();

        userRepository.saveAll(List.of(admin, student));

        // 2. Seed Teachers
        Teacher tBien = Teacher.builder()
                .name("Thầy Chu Văn Biên")
                .title("Cựu Giảng Viên ĐHSP - Chuyên Gia Luyện Thi Vật Lý Số 1")
                .subject("VAT_LY")
                .avatarUrl("https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80")
                .bio("Tác giả của hơn 30 đầu sách luyện thi Vật Lý bán chạy nhất Việt Nam. Hơn 18 năm kinh nghiệm đào tạo hàng ngàn thủ khoa, á khoa toàn quốc.")
                .experienceYears(18)
                .rating(5.0)
                .studentCount(45000)
                .achievements("Tác giả sách 'Bí Quyết 9+ Vật Lý', đào tạo 12 Thủ khoa Toàn quốc khối A00")
                .sortOrder(1)
                .isActive(true)
                .build();

        Teacher tTai = Teacher.builder()
                .name("Thầy Trần Văn Tài")
                .title("Thủ Khoa ĐH Sư Phạm - Chuyên Gia Toán Lớp 10-12 & ĐGNL")
                .subject("TOAN")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                .bio("Người sáng lập phương pháp giải toán tư duy bản chất PRO-X. Giúp học sinh nắm chắc từ nền tảng 7 điểm bứt phá lên 9.6+ môn Toán.")
                .experienceYears(12)
                .rating(4.9)
                .studentCount(38000)
                .achievements("Thủ khoa tốt nghiệp ĐH Sư phạm Hà Nội, Top 1 giáo viên Toán Online yêu thích nhất")
                .sortOrder(2)
                .isActive(true)
                .build();

        Teacher tFiona = Teacher.builder()
                .name("Cô Hương Fiona")
                .title("Thạc Sĩ Ngôn Ngữ Học - 8.5 IELTS - Luyện Thi Tiếng Anh 9+")
                .subject("TIENG_ANH")
                .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80")
                .bio("Giảng viên đại học uy tín, chứng chỉ giảng dạy quốc tế CELTA. Nổi tiếng với phương pháp học từ vựng qua ngữ cảnh và bẫy đề thi THPT QG.")
                .experienceYears(10)
                .rating(5.0)
                .studentCount(32000)
                .achievements("8.5 IELTS Overall, Đào tạo hơn 1500 học sinh đạt 9+ Tiếng Anh THPT QG 2024-2025")
                .sortOrder(3)
                .isActive(true)
                .build();

        Teacher tHuyen = Teacher.builder()
                .name("Cô Ngọc Huyền LB")
                .title("Thủ Khoa Sư Phạm Toán - Nữ Giáo Viên Luyện Thi Triệu View")
                .subject("TOAN")
                .avatarUrl("https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=400&q=80")
                .bio("Nổi tiếng với phong cách giảng dạy tỉ mỉ, kiên nhẫn và hệ thống bài tập phân loại cực kỳ khoa học cho học sinh từ lớp 10 đến lớp 12.")
                .experienceYears(9)
                .rating(4.9)
                .studentCount(29000)
                .achievements("Tác giả bộ sách 'Công Phá Toán Học', Fanpage 500k+ học sinh theo dõi")
                .sortOrder(4)
                .isActive(true)
                .build();

        Teacher tNgocAnh = Teacher.builder()
                .name("Thầy Vũ Ngọc Anh")
                .title("Chuyên Gia Vật Lý - Tác Giả Bộ Phác Đồ Vật Lý 12")
                .subject("VAT_LY")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                .bio("Năng lượng tràn đầy, bài giảng sinh động kết hợp mô phỏng thí nghiệm 3D độc quyền giúp học sinh hiểu sâu bản chất hiện tượng vật lý.")
                .experienceYears(9)
                .rating(4.9)
                .studentCount(27500)
                .achievements("Đào tạo hơn 300 học sinh đạt điểm 10 tuyệt đối môn Vật Lý trong 5 năm qua")
                .sortOrder(5)
                .isActive(true)
                .build();

        Teacher tKien = Teacher.builder()
                .name("Thầy Trương Công Kiên")
                .title("Chuyên Gia Hóa Học - Hệ Thống Mindmap Hóa Học Độc Quyền")
                .subject("HOA_HOC")
                .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80")
                .bio("Người tiên phong áp dụng sơ đồ tư duy Mindmap vào giải bài tập Hóa học hữu cơ và vô cơ 10-12, tối ưu thời gian làm bài dưới 40 giây/câu.")
                .experienceYears(11)
                .rating(4.8)
                .studentCount(24000)
                .achievements("Tác giả sách 'Mindmap Hóa Học', cố vấn chuyên môn các kỳ thi Olympic")
                .sortOrder(6)
                .isActive(true)
                .build();

        Teacher tSuongMai = Teacher.builder()
                .name("Cô Sương Mai")
                .title("Thạc Sĩ Văn Học - Giáo Viên Truyền Cảm Hứng Ngữ Văn 9+")
                .subject("NGU_VAN")
                .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80")
                .bio("Giúp học sinh xóa bỏ nỗi sợ học văn, xây dựng công thức làm bài nghị luận xã hội và nghị luận văn học sắc bén, cảm xúc và đạt điểm cao.")
                .experienceYears(8)
                .rating(5.0)
                .studentCount(22000)
                .achievements("Tác giả sách 'Văn Học Không Phải Là Học Vẹt', bồi dưỡng 800+ học sinh đạt 9+ Văn")
                .sortOrder(7)
                .isActive(true)
                .build();

        Teacher tThang = Teacher.builder()
                .name("Thầy Phạm Thắng")
                .title("Chuyên Gia Sinh Học - Luyện Thi Khối B00 Y Dược Đỉnh Cao")
                .subject("SINH_HOC")
                .avatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80")
                .bio("Hơn 14 năm đồng hành cùng các thí sinh đỗ Đại học Y Hà Nội, Y Dược TP.HCM với phương pháp giải quyết trọn vẹn phần bài tập Di truyền học.")
                .experienceYears(14)
                .rating(4.9)
                .studentCount(18500)
                .achievements("Cố vấn chuyên môn Sinh học, tỷ lệ học sinh đỗ trường Y đạt trên 85%")
                .sortOrder(8)
                .isActive(true)
                .build();

        List<Teacher> teachers = teacherRepository.saveAll(List.of(tBien, tTai, tFiona, tHuyen, tNgocAnh, tKien, tSuongMai, tThang));

        // 3. Seed Courses (Focus on Grade 10 to 12 as requested!)
        List<Course> courses = new ArrayList<>();

        // Course 1: Toan 12 PRO-X
        Course c1 = Course.builder()
                .title("Khóa PRO-X Luyện thi THPT Quốc Gia môn Toán 2026 - Thầy Trần Văn Tài")
                .slug("khoa-pro-x-luyen-thi-thpt-quoc-gia-mon-toan-2026")
                .grade("12")
                .subject("TOAN")
                .teacher(tTai)
                .teacherName(tTai.getName())
                .price(new BigDecimal("1290000"))
                .originalPrice(new BigDecimal("2400000"))
                .discountPercent(46)
                .thumbnailUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80")
                .badge("BEST_SELLER")
                .description("Khóa học toàn diện nhất dành cho sĩ tử 2k8 chinh phục 9+ môn Toán THPT Quốc Gia 2026. Lộ trình 3 giai đoạn: Nắm chắc bản chất - Tổng ôn nâng cao - Luyện đề chuẩn cấu trúc Bộ GD&ĐT.")
                .targetAudience("Học sinh lớp 12 hướng tới mục tiêu điểm 8.5 - 10 môn Toán xét tuyển Đại học top đầu.")
                .totalLessons(98)
                .totalHours(145)
                .rating(4.9)
                .studentCount(4250)
                .isActive(true)
                .isFeatured(true)
                .sortOrder(1)
                .featuresList("Lý thuyết chuyên sâu và kỹ thuật bấm máy Casio đỉnh cao;Bộ 50 đề thực chiến cập nhật mới nhất theo GDPT 2018;Livestream chữa đề và giải đáp thắc mắc hàng tuần;Nhóm kín hỗ trợ học tập 24/7 cùng đội ngũ trợ giảng thủ khoa")
                .build();
        courses.add(c1);

        // Course 2: Vat Ly 12 Thay Chu Van Bien
        Course c2 = Course.builder()
                .title("Tổng ôn toàn diện & Luyện đề thực chiến Vật Lý 12 - Thầy Chu Văn Biên")
                .slug("tong-on-toan-dien-luyen-de-vat-ly-12-thay-chu-van-bien")
                .grade("12")
                .subject("VAT_LY")
                .teacher(tBien)
                .teacherName(tBien.getName())
                .price(new BigDecimal("1190000"))
                .originalPrice(new BigDecimal("2200000"))
                .discountPercent(45)
                .thumbnailUrl("https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Học Vật Lý cùng Thầy Chu Văn Biên - cây đại thụ luyện thi Lý tại Việt Nam. Khóa học giải mã toàn bộ hiện tượng, bẫy trắc nghiệm, các bài toán đồ thị và cực trị điện xoay chiều nâng cao.")
                .targetAudience("Học sinh lớp 12 đặt mục tiêu bứt phá 9+ môn Vật lý trong kỳ thi Tốt nghiệp THPT và ĐGNL.")
                .totalLessons(90)
                .totalHours(130)
                .rating(5.0)
                .studentCount(3890)
                .isActive(true)
                .isFeatured(true)
                .sortOrder(2)
                .featuresList("Phương pháp độc quyền giải nhanh đồ thị và cực trị Lý 12;Ngân hàng 3.000 câu hỏi trắc nghiệm có video giải chi tiết;Tặng kèm trọn bộ ebook 'Bí quyết đạt 10 điểm Vật Lý';Phòng thi thử trực tuyến chấm điểm tự động và xếp hạng")
                .build();
        courses.add(c2);

        // Course 3: Tieng Anh 12 Co Huong Fiona
        Course c3 = Course.builder()
                .title("Khóa VIP Tiếng Anh 12: Bứt phá 9+ Tốt nghiệp THPT 2026 - Cô Hương Fiona")
                .slug("khoa-vip-tieng-anh-12-but-pha-9-plus-co-huong-fiona")
                .grade("12")
                .subject("TIENG_ANH")
                .teacher(tFiona)
                .teacherName(tFiona.getName())
                .price(new BigDecimal("990000"))
                .originalPrice(new BigDecimal("1900000"))
                .discountPercent(48)
                .thumbnailUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80")
                .badge("PRO_2026")
                .description("Khóa học Tiếng Anh bám sát ma trận đề thi tốt nghiệp THPT mới 2026. Quét sạch 100% ngữ pháp, từ vựng theo chủ đề, các cụm từ Collocations và chiến thuật ăn trọn điểm bài đọc hiểu.")
                .targetAudience("Học sinh lớp 12 đang ở mức 5-7 điểm muốn vươn lên 9+ môn Tiếng Anh.")
                .totalLessons(80)
                .totalHours(115)
                .rating(5.0)
                .studentCount(3100)
                .isActive(true)
                .isFeatured(true)
                .sortOrder(3)
                .featuresList("Chiến thuật xử lý bài đọc hiểu dài và bài điền từ trong 15 phút;Bảng từ vựng và cụm cố định thường gặp trong đề thi quốc gia;40 đề thi thử có phân tích bẫy chi tiết từng đáp án;Học phát âm và trọng âm với mẹo siêu dễ nhớ")
                .build();
        courses.add(c3);

        // Course 4: Hoa Hoc 12 Thay Truong Cong Kien
        Course c4 = Course.builder()
                .title("Chinh phục 9+ Hóa Học 12: Phản ứng hữu cơ & Vận dụng cao - Thầy Trương Công Kiên")
                .slug("chinh-phuc-9-plus-hoa-hoc-12-thay-truong-cong-kien")
                .grade("12")
                .subject("HOA_HOC")
                .teacher(tKien)
                .teacherName(tKien.getName())
                .price(new BigDecimal("1090000"))
                .originalPrice(new BigDecimal("2100000"))
                .discountPercent(48)
                .thumbnailUrl("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Hóa học 12 không còn là nỗi ám ảnh với phương pháp Mindmap liên kết este, chất béo, peptit và các dạng bài tập điện phân nâng cao.")
                .targetAudience("Học sinh 12 khối A00, B00 muốn làm chủ các câu hỏi 8+ và 9+ môn Hóa.")
                .totalLessons(85)
                .totalHours(120)
                .rating(4.9)
                .studentCount(2850)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(4)
                .featuresList("Hệ thống sơ đồ tư duy Mindmap Hóa hữu cơ và vô cơ lớp 12;Kỹ thuật dồn chất và đồng đẳng hóa độc quyền;Chữa chi tiết từng dạng bài tập từ dễ đến vận dụng cao;Trợ giảng giải đáp thắc mắc bài tập trong 10 phút")
                .build();
        courses.add(c4);

        // Course 5: Ngu Van 12 Co Suong Mai
        Course c5 = Course.builder()
                .title("Nghị luận văn học & Đọc hiểu chuyên sâu 9+ Ngữ Văn 12 - Cô Sương Mai")
                .slug("nghi-luan-van-hoc-doc-hieu-chuyen-sau-9-plus-ngu-van-12-co-suong-mai")
                .grade("12")
                .subject("NGU_VAN")
                .teacher(tSuongMai)
                .teacherName(tSuongMai.getName())
                .price(new BigDecimal("890000"))
                .originalPrice(new BigDecimal("1800000"))
                .discountPercent(50)
                .thumbnailUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80")
                .badge("PRO_2026")
                .description("Bí kíp biến môn Văn từ cảm tính thành khoa học với công thức mở bài, thân bài, dẫn chứng xã hội sắc sảo và nghệ thuật phân tích tác phẩm lớp 12.")
                .targetAudience("Học sinh lớp 12 xét tuyển khối C00, D01 muốn đạt điểm 8.75 - 9.5 môn Văn.")
                .totalLessons(70)
                .totalHours(95)
                .rating(5.0)
                .studentCount(2400)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(5)
                .featuresList("Công thức viết mở bài - kết bài ấn tượng tạo thiện cảm với giám khảo;Kho dẫn chứng thời sự và câu chuyện truyền cảm hứng cho bài nghị luận;Sơ đồ phân tích tất cả các văn bản trọng tâm chương trình mới;Chấm chữa bài viết chi tiết trực tiếp từ cô Sương Mai")
                .build();
        courses.add(c5);

        // Course 6: Sinh Hoc 12 Thay Pham Thang
        Course c6 = Course.builder()
                .title("Luyện thi Sinh học 12 Chinh phục Y Dược khối B00 - Thầy Phạm Thắng")
                .slug("luyen-thi-sinh-hoc-12-chinh-phuc-y-duoc-khoi-b00-thay-pham-thang")
                .grade("12")
                .subject("SINH_HOC")
                .teacher(tThang)
                .teacherName(tThang.getName())
                .price(new BigDecimal("1190000"))
                .originalPrice(new BigDecimal("2300000"))
                .discountPercent(48)
                .thumbnailUrl("https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Chương trình tinh gọn bám sát đề thi tuyển sinh Y Dược: Di truyền phân tử, Quy luật di truyền, Di truyền người và Sinh thái học.")
                .targetAudience("Thí sinh có nguyện vọng thi đỗ Đại học Y Hà Nội, Y Dược TP.HCM và khối ngành sức khỏe.")
                .totalLessons(78)
                .totalHours(110)
                .rating(4.9)
                .studentCount(1800)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(6)
                .featuresList("Mẹo giải nhanh các bài toán phả hệ phức tạp;Tổng hợp toàn bộ lý thuyết Sinh học hay bẫy nhất;Bộ đề chuẩn cấu trúc Bộ GD&ĐT khối B00;Hỗ trợ học tập cùng cộng đồng thủ khoa Y Dược")
                .build();
        courses.add(c6);

        // Course 7: DGNL HSA & APT
        Course c7 = Course.builder()
                .title("Chiến lược Đánh giá năng lực HSA (ĐHQG HN) & APT (ĐHQG TP.HCM) 2026")
                .slug("chien-luoc-danh-gia-nang-luc-hsa-dhqg-hn-apt-dhqg-tphcm-2026")
                .grade("DGNL")
                .subject("TONG_HOP")
                .teacher(tTai)
                .teacherName(tTai.getName() + " & Đội ngũ Thầy Cô")
                .price(new BigDecimal("1490000"))
                .originalPrice(new BigDecimal("2900000"))
                .discountPercent(49)
                .thumbnailUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80")
                .badge("BEST_SELLER")
                .description("Khóa học liên môn Toán - Ngôn ngữ - Khoa học tự nhiên - Khoa học xã hội thiết kế riêng cho kỳ thi ĐGNL ĐHQG Hà Nội và TP.HCM.")
                .targetAudience("Học sinh lớp 12 muốn nhân đôi cơ hội đỗ Đại học thông qua kỳ thi Đánh giá năng lực.")
                .totalLessons(120)
                .totalHours(160)
                .rating(5.0)
                .studentCount(3500)
                .isActive(true)
                .isFeatured(true)
                .sortOrder(7)
                .featuresList("Luyện tập 100% dạng bài ĐGNL HSA và APT theo cấu trúc mới nhất;Thi thử trên máy tính giả lập phòng thi thật 100%;Chiến thuật phân bổ thời gian và mẹo loại trừ đáp án siêu tốc;Tư vấn chọn trường và phân tích phổ điểm xét tuyển")
                .build();
        courses.add(c7);

        // Course 8: TSA DH Bach Khoa
        Course c8 = Course.builder()
                .title("Khóa Luyện thi Đánh giá tư duy TSA Đại học Bách Khoa Hà Nội 2026")
                .slug("khoa-luyen-thi-danh-gia-tu-duy-tsa-dh-bach-khoa-ha-noi-2026")
                .grade("DGNL")
                .subject("TONG_HOP")
                .teacher(tBien)
                .teacherName(tBien.getName() + " & Thầy Tài")
                .price(new BigDecimal("1590000"))
                .originalPrice(new BigDecimal("3000000"))
                .discountPercent(47)
                .thumbnailUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Luyện thi TSA Bách Khoa chuẩn cấu trúc 3 phần: Tư duy Toán học, Tư duy Đọc hiểu, Tư duy Khoa học/Giải quyết vấn đề.")
                .targetAudience("Học sinh lớp 12 hướng tới các ngành Kỹ thuật, Công nghệ thông tin Bách Khoa, Kinh tế Quốc dân.")
                .totalLessons(110)
                .totalHours(150)
                .rating(4.9)
                .studentCount(2900)
                .isActive(true)
                .isFeatured(true)
                .sortOrder(8)
                .featuresList("Phương pháp làm bài Tư duy Khoa học và Tư duy Đọc hiểu độc quyền;30 đề thi thử trực tuyến sát đề thi thật Bách Khoa nhất hiện nay;Phân tích chi tiết các dạng bài kéo thả, đúng/sai, điền khuyết;Cập nhật liên tục định dạng thi mới nhất của ĐH Bách Khoa")
                .build();
        courses.add(c8);

        // Course 9: Toan 11 Co Ngoc Huyen LB
        Course c9 = Course.builder()
                .title("Khóa Nền tảng vững vàng Toán 11: Hình không gian & Lượng giác - Cô Ngọc Huyền LB")
                .slug("khoa-nen-tang-vung-vang-toan-11-co-ngoc-huyen-lb")
                .grade("11")
                .subject("TOAN")
                .teacher(tHuyen)
                .teacherName(tHuyen.getName())
                .price(new BigDecimal("890000"))
                .originalPrice(new BigDecimal("1600000"))
                .discountPercent(44)
                .thumbnailUrl("https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80")
                .badge("NEW")
                .description("Chương trình Toán 11 chuẩn GDPT mới: Lượng giác, Cấp số cộng - nhân, Giới hạn, Đạo hàm và Hình không gian từ cơ bản đến nâng cao.")
                .targetAudience("Học sinh lớp 11 muốn làm chủ kiến thức nền tảng để bước vào năm 12 tự tin đạt điểm 9-10.")
                .totalLessons(72)
                .totalHours(100)
                .rating(4.9)
                .studentCount(2100)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(9)
                .featuresList("Hình dung không gian 3D trực quan, không còn sợ mất gốc hình học;Hệ thống bài tập phân dạng từ nhận biết đến vận dụng cao;Đề kiểm tra giữa kỳ và cuối kỳ có ma trận chuẩn Bộ GD;Chấm điểm và sửa bài trực tiếp")
                .build();
        courses.add(c9);

        // Course 10: Vat Ly 11 Thay Vu Ngoc Anh
        Course c10 = Course.builder()
                .title("Vật Lý 11 Chuyên Sâu: Sóng & Điện trường bản chất - Thầy Vũ Ngọc Anh")
                .slug("vat-ly-11-chuyen-sau-song-dien-truong-thay-vu-ngoc-anh")
                .grade("11")
                .subject("VAT_LY")
                .teacher(tNgocAnh)
                .teacherName(tNgocAnh.getName())
                .price(new BigDecimal("790000"))
                .originalPrice(new BigDecimal("1500000"))
                .discountPercent(47)
                .thumbnailUrl("https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Khám phá thế giới vật lý lớp 11 qua mô phỏng sống động: Dao động, Sóng, Điện trường và Dòng điện không đổi.")
                .targetAudience("Học sinh lớp 11 định hướng thi khối A00, A01 chuẩn bị hành trang sớm cho kỳ thi đại học.")
                .totalLessons(65)
                .totalHours(90)
                .rating(4.9)
                .studentCount(1950)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(10)
                .featuresList("Mô phỏng thí nghiệm tương tác trực quan 3D;Bí kíp giải nhanh trắc nghiệm điện trường và sóng;Bộ đề ôn thi giữa kỳ và học kỳ điểm 9+;Nhóm hỗ trợ học sinh 1-1 cùng trợ giảng")
                .build();
        courses.add(c10);

        // Course 11: Hoa Hoc 11 Thay Truong Cong Kien
        Course c11 = Course.builder()
                .title("Hóa Học 11: Đại cương Hóa hữu cơ & Cân bằng hóa học 2026 - Thầy Trương Công Kiên")
                .slug("hoa-hoc-11-dai-cuong-hoa-huu-co-can-bang-hoa-hoc-2026")
                .grade("11")
                .subject("HOA_HOC")
                .teacher(tKien)
                .teacherName(tKien.getName())
                .price(new BigDecimal("790000"))
                .originalPrice(new BigDecimal("1500000"))
                .discountPercent(47)
                .thumbnailUrl("https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80")
                .badge("NEW")
                .description("Xây dựng nền tảng vững chắc môn Hóa lớp 11: Cân bằng ion, Nitơ - Lưu huỳnh và cánh cửa bước vào Hóa học hữu cơ.")
                .targetAudience("Học sinh lớp 11 muốn đạt học sinh giỏi môn Hóa và tạo bước đệm hoàn hảo cho năm 12.")
                .totalLessons(60)
                .totalHours(85)
                .rating(4.8)
                .studentCount(1650)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(11)
                .featuresList("Phương pháp phân loại chất hữu cơ không thể nhầm lẫn;Mẹo cân bằng phản ứng oxi hóa - khử phức tạp trong 15 giây;Trọn bộ tài liệu ôn thi học kỳ có đáp án giải thích cụ thể;Live giải đáp bài tập định kỳ")
                .build();
        courses.add(c11);

        // Course 12: Tieng Anh 11 Co Huong Fiona
        Course c12 = Course.builder()
                .title("Tiếng Anh 11: Tăng tốc ngữ pháp & Từ vựng B2 chuẩn GDPT - Cô Hương Fiona")
                .slug("tieng-anh-11-tang-toc-ngu-phap-tu-vung-b2-co-huong-fiona")
                .grade("11")
                .subject("TIENG_ANH")
                .teacher(tFiona)
                .teacherName(tFiona.getName())
                .price(new BigDecimal("750000"))
                .originalPrice(new BigDecimal("1400000"))
                .discountPercent(46)
                .thumbnailUrl("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80")
                .badge("PRO_2026")
                .description("Phát triển toàn diện 4 kỹ năng với trọng tâm là Ngữ pháp thực chiến và từ vựng mở rộng theo các chủ đề thời sự.")
                .targetAudience("Học sinh lớp 11 muốn đạt 9.0+ trên lớp và chuẩn bị thi chứng chỉ IELTS hoặc thi tốt nghiệp.")
                .totalLessons(58)
                .totalHours(80)
                .rating(5.0)
                .studentCount(1750)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(12)
                .featuresList("Nắm chắc 12 thì và các cấu trúc câu đặc biệt;Bộ bài tập trắc nghiệm có lời giải chi tiết theo từng Unit;Luyện phản xạ đọc hiểu nhanh và chính xác;File audio luyện nghe chuẩn giọng bản ngữ")
                .build();
        courses.add(c12);

        // Course 13: Toan 10 Thay Tran Van Tai
        Course c13 = Course.builder()
                .title("Khởi đầu vững chắc Toán 10: Vectơ, Mệnh đề & Bất phương trình - Thầy Trần Văn Tài")
                .slug("khoi-dau-vung-chac-toan-10-thay-tran-van-tai")
                .grade("10")
                .subject("TOAN")
                .teacher(tTai)
                .teacherName(tTai.getName())
                .price(new BigDecimal("690000"))
                .originalPrice(new BigDecimal("1300000"))
                .discountPercent(47)
                .thumbnailUrl("https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80")
                .badge("NEW")
                .description("Khóa học nhập môn cấp 3 giúp học sinh lớp 10 bỡ ngỡ thích nghi ngay với phương pháp học Toán THPT mới, tránh mất gốc ngay từ đầu năm.")
                .targetAudience("Học sinh lớp 10 vừa bước vào bậc THPT muốn đạt điểm cao ngay từ học kỳ đầu tiên.")
                .totalLessons(55)
                .totalHours(75)
                .rating(4.9)
                .studentCount(1850)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(13)
                .featuresList("Phương pháp tư duy logic khác biệt hoàn toàn cấp 2;Làm chủ chuyên đề Vectơ và Hệ thức lượng trong tam giác;Bộ đề thi thử giữa kỳ và học kỳ có giải chi tiết;Hỗ trợ học tập nhiệt tình từ đội ngũ thủ khoa")
                .build();
        courses.add(c13);

        // Course 14: Vat Ly 10 Thay Chu Van Bien
        Course c14 = Course.builder()
                .title("Vật Lý 10: Động học & Các định luật Newton chuyên sâu - Thầy Chu Văn Biên")
                .slug("vat-ly-10-dong-hoc-cac-dinh-luat-newton-thay-chu-van-bien")
                .grade("10")
                .subject("VAT_LY")
                .teacher(tBien)
                .teacherName(tBien.getName())
                .price(new BigDecimal("690000"))
                .originalPrice(new BigDecimal("1300000"))
                .discountPercent(47)
                .thumbnailUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80")
                .badge("HOT")
                .description("Xây dựng nền móng cơ học vững chắc: Chuyển động biến đổi đều, Định luật 1, 2, 3 Newton, Công và Năng lượng.")
                .targetAudience("Học sinh lớp 10 yêu thích Vật lý hoặc muốn đạt điểm tổng kết 9.0+ trên lớp.")
                .totalLessons(50)
                .totalHours(70)
                .rating(5.0)
                .studentCount(1600)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(14)
                .featuresList("Phương pháp phân tích lực trực quan, không còn sợ bài toán ma sát;Kỹ thuật đọc và vẽ đồ thị vận tốc - thời gian;Hơn 1.500 câu hỏi trắc nghiệm tự luyện phân cấp độ;Giải đáp bài tập nhanh qua group Zalo học sinh")
                .build();
        courses.add(c14);

        // Course 15: Ngu Van 10 Co Suong Mai
        Course c15 = Course.builder()
                .title("Ngữ Văn 10: Phương pháp làm chủ văn học sử thi và thơ ca mới - Cô Sương Mai")
                .slug("ngu-van-10-phuong-phap-lam-chu-van-hoc-su-thi-co-suong-mai")
                .grade("10")
                .subject("NGU_VAN")
                .teacher(tSuongMai)
                .teacherName(tSuongMai.getName())
                .price(new BigDecimal("590000"))
                .originalPrice(new BigDecimal("1200000"))
                .discountPercent(51)
                .thumbnailUrl("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80")
                .badge("NEW")
                .description("Học cách đọc hiểu văn bản sử thi Đăm Săn, Odyssey, thơ Đường luật và rèn luyện kỹ năng viết đoạn văn nghị luận 200 chữ điểm tối đa.")
                .targetAudience("Học sinh lớp 10 cần định hình kỹ năng làm bài văn THPT đúng chuẩn đáp án Bộ.")
                .totalLessons(45)
                .totalHours(60)
                .rating(4.9)
                .studentCount(1400)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(15)
                .featuresList("Khung dàn ý chuẩn cho từng dạng bài phân tích nhân vật;Bí kíp diễn đạt trôi chảy, giàu hình ảnh và cảm xúc;File tổng hợp từ vựng đắt giá dùng cho bài văn nghị luận;Sửa bài viết trực tiếp định kỳ")
                .build();
        courses.add(c15);

        List<Course> savedCourses = courseRepository.saveAll(courses);

        // 4. Seed Lessons for Courses
        List<Lesson> allLessons = new ArrayList<>();
        for (Course course : savedCourses) {
            allLessons.add(Lesson.builder()
                    .course(course)
                    .chapterName("Chương 1: Khởi động & Nền tảng cốt lõi")
                    .title("Bài 1: Giới thiệu lộ trình & Phương pháp chinh phục điểm 9+")
                    .durationMinutes(35)
                    .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .materialName("Phiếu bài tập số 01 & Tóm tắt kiến thức cốt lõi.pdf")
                    .materialUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
                    .isFreePreview(true)
                    .sortOrder(1)
                    .build());

            allLessons.add(Lesson.builder()
                    .course(course)
                    .chapterName("Chương 1: Khởi động & Nền tảng cốt lõi")
                    .title("Bài 2: Tổng quan lý thuyết trọng tâm & Các công thức giải nhanh")
                    .durationMinutes(52)
                    .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .materialName("Sơ đồ tư duy & Cẩm nang công thức giải nhanh 2026.pdf")
                    .materialUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
                    .isFreePreview(true)
                    .sortOrder(2)
                    .build());

            allLessons.add(Lesson.builder()
                    .course(course)
                    .chapterName("Chương 2: Chuyên đề nâng cao & Phân dạng bài tập")
                    .title("Bài 3: Phân tích các dạng bài tập điển hình và bẫy trắc nghiệm")
                    .durationMinutes(60)
                    .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .materialName("Bộ 100 câu hỏi trắc nghiệm & Tự luận kèm bareme chi tiết.pdf")
                    .materialUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
                    .isFreePreview(false)
                    .sortOrder(3)
                    .build());

            allLessons.add(Lesson.builder()
                    .course(course)
                    .chapterName("Chương 2: Chuyên đề nâng cao & Phân dạng bài tập")
                    .title("Bài 4: Kỹ thuật vận dụng cao bứt phá điểm 8+ lên 10")
                    .durationMinutes(68)
                    .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .materialName("Đề tự luyện vận dụng cao số 01.pdf")
                    .materialUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
                    .isFreePreview(false)
                    .sortOrder(4)
                    .build());

            allLessons.add(Lesson.builder()
                    .course(course)
                    .chapterName("Chương 3: Luyện đề thực chiến & Thi thử")
                    .title("Bài 5: Chữa đề thi thử số 01 - Bấm giờ và xếp hạng")
                    .durationMinutes(75)
                    .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .isFreePreview(false)
                    .sortOrder(5)
                    .build());
        }
        lessonRepository.saveAll(allLessons);

        // 5. Seed Activation Codes (Ready for testing on the active-course page!)
        Instant future1Year = Instant.now().plus(365, ChronoUnit.DAYS);
        List<ActivationCode> codes = List.of(
                ActivationCode.builder()
                        .code("PRO12-TOAN")
                        .courseId(savedCourses.get(0).getId())
                        .courseTitle(savedCourses.get(0).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Khóa PRO-X Toán 12 (Thử nghiệm demo)")
                        .build(),
                ActivationCode.builder()
                        .code("PRO12-LY")
                        .courseId(savedCourses.get(1).getId())
                        .courseTitle(savedCourses.get(1).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Vật Lý 12 Thầy Chu Văn Biên")
                        .build(),
                ActivationCode.builder()
                        .code("PRO12-ANH")
                        .courseId(savedCourses.get(2).getId())
                        .courseTitle(savedCourses.get(2).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Tiếng Anh 12 Cô Fiona")
                        .build(),
                ActivationCode.builder()
                        .code("PRO12-HOA")
                        .courseId(savedCourses.get(3).getId())
                        .courseTitle(savedCourses.get(3).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Hóa Học 12 Thầy Kiên")
                        .build(),
                ActivationCode.builder()
                        .code("HSA2026-VIP")
                        .courseId(savedCourses.get(6).getId())
                        .courseTitle(savedCourses.get(6).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Khóa ĐGNL HSA ĐHQG 2026")
                        .build(),
                ActivationCode.builder()
                        .code("TSA2026-VIP")
                        .courseId(savedCourses.get(7).getId())
                        .courseTitle(savedCourses.get(7).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Khóa ĐGTD Bách Khoa TSA 2026")
                        .build(),
                ActivationCode.builder()
                        .code("PRO11-TOAN")
                        .courseId(savedCourses.get(8).getId())
                        .courseTitle(savedCourses.get(8).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Khóa Toán 11 Cô Ngọc Huyền")
                        .build(),
                ActivationCode.builder()
                        .code("PRO10-TOAN")
                        .courseId(savedCourses.get(12).getId())
                        .courseTitle(savedCourses.get(12).getTitle())
                        .maxUses(100)
                        .usedCount(0)
                        .expiresAt(future1Year)
                        .isActive(true)
                        .notes("Mã kích hoạt Khóa Toán 10 Thầy Tài")
                        .build()
        );
        codeRepository.saveAll(codes);

        // 6. Seed Banners (Shown to guest users)
        List<Banner> banners = List.of(
                Banner.builder()
                        .title("KÍCH HOẠT KHÓA HỌC THPT 2026")
                        .subtitle("Nhập mã kích hoạt nhận từ sách hoặc đơn hàng để mở khóa trọn bộ bài giảng và đề thi 9+ ngay hôm nay.")
                        .badge("ƯU ĐÃI NĂM HỌC 2026")
                        .imageUrl("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80")
                        .actionText("Kích hoạt ngay")
                        .actionLink("/active-course")
                        .sortOrder(1)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("CHƯƠNG TRÌNH KHÓA HỌC LỚP 10 - 11 - 12")
                        .subtitle("Bám sát 100% chương trình Giáo dục Phổ thông mới. Đội ngũ giáo viên hàng đầu Việt Nam đồng hành 24/7.")
                        .badge("CHƯƠNG TRÌNH GDPT 2018")
                        .imageUrl("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80")
                        .actionText("Xem danh sách khóa học")
                        .actionLink("/courses")
                        .sortOrder(2)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("LỘ TRÌNH ĐÁNH GIÁ NĂNG LỰC HSA & TSA BÁCH KHOA")
                        .subtitle("Bộ đề thi thử trực tuyến độc quyền, thi trên máy tính mô phỏng phòng thi thật 100%.")
                        .badge("ĐỘT PHÁ XÉT TUYỂN")
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80")
                        .actionText("Khám phá khóa ĐGNL")
                        .actionLink("/courses?grade=DGNL")
                        .sortOrder(3)
                        .isActive(true)
                        .build()
        );
        bannerRepository.saveAll(banners);

        // 7. Seed FAQs (Displayed on active-course page)
        List<FaqItem> faqs = List.of(
                FaqItem.builder()
                        .question("Làm thế nào để lấy mã kích hoạt khóa học?")
                        .answer("Mã kích hoạt được gửi tự động qua Email hoặc tin nhắn SMS ngay sau khi bạn mua khóa học thành công trên website. Nếu bạn mua sách tham khảo hoặc tài liệu học tập, mã kích hoạt được in tại mặt sau của bìa sách hoặc thẻ cào đính kèm.")
                        .category("ACTIVATION")
                        .sortOrder(1)
                        .isActive(true)
                        .build(),
                FaqItem.builder()
                        .question("Một mã kích hoạt có thể sử dụng cho mấy tài khoản?")
                        .answer("Mỗi mã kích hoạt chỉ có giá trị kích hoạt duy nhất 01 lần cho 01 tài khoản học viên. Sau khi kích hoạt thành công, khóa học sẽ được gắn vĩnh viễn với tài khoản đó trong suốt thời hạn của khóa học.")
                        .category("ACTIVATION")
                        .sortOrder(2)
                        .isActive(true)
                        .build(),
                FaqItem.builder()
                        .question("Tôi có thể học trên những thiết bị nào sau khi kích hoạt?")
                        .answer("Bạn có thể học linh hoạt trên máy tính (Laptop/PC), máy tính bảng (iPad/Tablet) và điện thoại thông minh (iOS/Android). Hệ thống tự động đồng bộ tiến độ học tập trên mọi thiết bị.")
                        .category("LEARNING")
                        .sortOrder(3)
                        .isActive(true)
                        .build(),
                FaqItem.builder()
                        .question("Khóa học sau khi kích hoạt có thời hạn sử dụng bao lâu?")
                        .answer("Các khóa học Lớp 10, Lớp 11 và Lớp 12 có thời hạn sử dụng 01 năm kể từ ngày kích hoạt hoặc cho đến khi kết thúc kỳ thi Tốt nghiệp THPT Quốc Gia của năm học đó.")
                        .category("COURSE")
                        .sortOrder(4)
                        .isActive(true)
                        .build(),
                FaqItem.builder()
                        .question("Nếu nhập sai mã hoặc gặp lỗi kích hoạt thì liên hệ ai?")
                        .answer("Bạn có thể liên hệ trực tiếp qua Hotline 1900 6868 hoặc nhắn tin cho Fanpage chính thức để được đội ngũ kỹ thuật hỗ trợ kích hoạt thủ công trong vòng 5 phút.")
                        .category("SUPPORT")
                        .sortOrder(5)
                        .isActive(true)
                        .build()
        );
        faqItemRepository.saveAll(faqs);

        // 8. Seed Testimonials (Shown on guest active-course page)
        List<Testimonial> testimonials = List.of(
                Testimonial.builder()
                        .studentName("Nguyễn Hoàng Minh")
                        .school("THPT Chuyên Sư Phạm Hà Nội")
                        .score("29.5 Điểm Khối A00 (Toán 10, Lý 9.75, Hóa 9.75)")
                        .content("Nhờ khóa PRO-X của Thầy Tài và khóa Vật Lý của Thầy Chu Văn Biên, em đã nắm vững toàn bộ phương pháp giải nhanh và không bị bỡ ngỡ trước đề thi mới. Em đã đỗ Thủ khoa Khoa học Máy tính ĐH Bách Khoa!")
                        .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80")
                        .targetExam("Thủ khoa ĐH Bách Khoa Hà Nội")
                        .courseName("Khóa PRO-X Luyện thi THPT QG 2025")
                        .sortOrder(1)
                        .isActive(true)
                        .build(),
                Testimonial.builder()
                        .studentName("Trần Mai Phương")
                        .school("THPT Lê Hồng Phong - Nam Định")
                        .score("28.75 Điểm Khối D01 (Toán 9.4, Văn 9.25, Anh 9.8)")
                        .content("Khóa Tiếng Anh Cô Hương Fiona đã giúp em nâng điểm từ 6.5 lên 9.8 chỉ sau 4 tháng! Mẹo làm bài đọc hiểu và phân loại bẫy của cô thực sự là cứu cánh.")
                        .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80")
                        .targetExam("Á khoa Kinh tế Đối ngoại - ĐH Ngoại Thương")
                        .courseName("Khóa VIP Tiếng Anh 12 Cô Hương Fiona")
                        .sortOrder(2)
                        .isActive(true)
                        .build(),
                Testimonial.builder()
                        .studentName("Lê Gia Bảo")
                        .school("THPT Gia Định - TP.HCM")
                        .score("1085/1200 Điểm ĐGNL ĐHQG TP.HCM")
                        .content("Hệ thống đề thi thử ĐGNL sát với đề thi thật đến 90%. Em luyện 25 đề trên web và vào phòng thi làm bài cực kỳ tự tin.")
                        .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                        .targetExam("Tuyển thẳng ĐH Khoa Học Tự Nhiên TP.HCM")
                        .courseName("Khóa Chiến lược ĐGNL HSA & APT")
                        .sortOrder(3)
                        .isActive(true)
                        .build()
        );
        testimonialRepository.saveAll(testimonials);

        log.info("Database seeding completed successfully! Seeded 8 teachers, 15 Grade 10-12 courses, 8 demo activation codes, banners, FAQs, and testimonials.");
    }

    private void seedCategories() {
        if (gradeRepository.count() == 0) {
            log.info("Seeding initial Grades (Khối lớp)...");
            List<Grade> grades = List.of(
                    Grade.builder().code("LOP_10").name("Lớp 10").description("Chương trình GDPT mới Lớp 10").sortOrder(1).isActive(true).build(),
                    Grade.builder().code("LOP_11").name("Lớp 11").description("Chương trình GDPT mới Lớp 11").sortOrder(2).isActive(true).build(),
                    Grade.builder().code("LOP_12").name("Lớp 12").description("Luyện thi Tốt nghiệp THPT Quốc Gia").sortOrder(3).isActive(true).build(),
                    Grade.builder().code("DGNL").name("Đánh Giá Năng Lực (HSA / APT)").description("Luyện thi ĐHQG Hà Nội & ĐHQG TP.HCM").sortOrder(4).isActive(true).build(),
                    Grade.builder().code("TSA").name("Đánh Giá Tư Duy (TSA Bách Khoa)").description("Luyện thi Tư duy ĐH Bách Khoa Hà Nội").sortOrder(5).isActive(true).build()
            );
            gradeRepository.saveAll(grades);
        }

        if (subjectRepository.count() == 0) {
            log.info("Seeding initial Subjects (Môn học)...");
            List<Subject> subjects = List.of(
                    Subject.builder().code("TOAN").name("Toán Học").icon("Calculator").color("#3B82F6").sortOrder(1).isActive(true).build(),
                    Subject.builder().code("VAT_LY").name("Vật Lý").icon("Zap").color("#F59E0B").sortOrder(2).isActive(true).build(),
                    Subject.builder().code("HOA_HOC").name("Hóa Học").icon("FlaskConical").color("#10B981").sortOrder(3).isActive(true).build(),
                    Subject.builder().code("SINH_HOC").name("Sinh Học").icon("Dna").color("#84CC16").sortOrder(4).isActive(true).build(),
                    Subject.builder().code("TIENG_ANH").name("Tiếng Anh").icon("Globe").color("#8B5CF6").sortOrder(5).isActive(true).build(),
                    Subject.builder().code("NGU_VAN").name("Ngữ Văn").icon("BookOpen").color("#EC4899").sortOrder(6).isActive(true).build(),
                    Subject.builder().code("LICH_SU").name("Lịch Sử").icon("Landmark").color("#D97706").sortOrder(7).isActive(true).build(),
                    Subject.builder().code("DIA_LY").name("Địa Lý").icon("Compass").color("#06B6D4").sortOrder(8).isActive(true).build()
            );
            subjectRepository.saveAll(subjects);
        }
    }

    private void seedQuizzes() {
        if (quizRepository.count() == 0) {
            log.info("Seeding sample quizzes with LaTeX formulas, function curves, and images...");
            List<Lesson> lessons = lessonRepository.findAll();
            if (lessons.isEmpty()) {
                return;
            }

            Lesson firstLesson = lessons.get(0);

            Quiz mathQuiz = Quiz.builder()
                    .lesson(firstLesson)
                    .title("Quiz Trắc Nghiệm Đánh Giá Năng Lực & Đồ Thị Hàm Số")
                    .description("Kiểm tra kiến thức hàm số, cực trị, tiệm cận, nguyên hàm tích phân kết hợp công thức toán học LaTeX và biểu đồ tọa độ Oxy.")
                    .timeLimitMinutes(15)
                    .passingScore(70)
                    .isActive(true)
                    .sortOrder(1)
                    .build();

            List<QuizQuestion> questions = new ArrayList<>();

            // Q1: LaTeX Calculus formula question
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Tìm nguyên hàm của hàm số $f(x) = 3x^2 - 2x + \\frac{1}{\\sqrt{x}}$ trên khoảng $(0; +\\infty)$.")
                    .questionType("MULTIPLE_CHOICE")
                    .optionA("$F(x) = x^3 - x^2 + 2\\sqrt{x} + C$")
                    .optionB("$F(x) = x^3 - x^2 + \\frac{1}{2\\sqrt{x}} + C$")
                    .optionC("$F(x) = 6x - 2 - \\frac{1}{2x\\sqrt{x}} + C$")
                    .optionD("$F(x) = 3x^3 - 2x^2 + \\sqrt{x} + C$")
                    .correctAnswer("A")
                    .explanation("Sử dụng bảng nguyên hàm cơ bản:\n" +
                            "- $\\int 3x^2 dx = x^3$\n" +
                            "- $\\int 2x dx = x^2$\n" +
                            "- $\\int x^{-1/2} dx = \\frac{x^{1/2}}{1/2} = 2\\sqrt{x}$\n" +
                            "Do đó $F(x) = x^3 - x^2 + 2\\sqrt{x} + C$.")
                    .points(10)
                    .sortOrder(1)
                    .build());

            // Q2: Function graph plotting question (Cubic curve Oxy)
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Cho hàm số bậc ba $y = f(x) = x^3 - 3x$ có đồ thị trên mặt phẳng tọa độ $Oxy$ như hình bên dưới. Điểm cực đại của đồ thị hàm số là:")
                    .questionType("MULTIPLE_CHOICE")
                    .chartConfig("{\"type\":\"function\",\"expression\":\"x^3 - 3*x\",\"xMin\":-2.5,\"xMax\":2.5,\"yMin\":-3,\"yMax\":3,\"points\":[{\"x\":-1,\"y\":2,\"label\":\"CĐ (-1, 2)\"},{\"x\":1,\"y\":-2,\"label\":\"CT (1, -2)\"}],\"title\":\"Đồ thị hàm số y = x³ - 3x\"}")
                    .optionA("$(-1; 2)$")
                    .optionB("$(1; -2)$")
                    .optionC("$(0; 0)$")
                    .optionD("$(-1; 0)$")
                    .correctAnswer("A")
                    .explanation("Đạo hàm $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\n" +
                            "- Với $x = -1 \\Rightarrow y = (-1)^3 - 3(-1) = 2$, dấu $y'$ đổi từ dương sang âm khi qua $x = -1$, do đó điểm cực đại của đồ thị là $(-1; 2)$.")
                    .points(10)
                    .sortOrder(2)
                    .build());

            // Q3: Rational function with asymptotes
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Cho hàm số nhất biến $y = \\frac{2x - 1}{x + 1}$ có đồ thị với hai đường tiệm cận. Tọa độ giao điểm $I$ của hai đường tiệm cận đứng và ngang là:")
                    .questionType("MULTIPLE_CHOICE")
                    .chartConfig("{\"type\":\"function\",\"expression\":\"(2*x - 1)/(x + 1)\",\"xMin\":-5,\"xMax\":4,\"yMin\":-4,\"yMax\":6,\"asymptotes\":{\"vertical\":[-1],\"horizontal\":[2]},\"title\":\"Đồ thị y = (2x - 1)/(x + 1)\"}")
                    .optionA("$I(-1; 2)$")
                    .optionB("$I(1; 2)$")
                    .optionC("$I(2; -1)$")
                    .optionD("$I(-1; -1)$")
                    .correctAnswer("A")
                    .explanation("Hàm số $y = \\frac{ax+b}{cx+d}$ có:\n" +
                            "- Tiệm cận đứng: $x = -d/c = -1$\n" +
                            "- Tiệm cận ngang: $y = a/c = 2$\n" +
                            "Vậy tọa độ giao điểm của hai tiệm cận là tâm đối xứng $I(-1; 2)$.")
                    .points(10)
                    .sortOrder(3)
                    .build());

            // Q4: Image question (Physics RLC / Experiment diagram)
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Quan sát sơ đồ thực nghiệm thí nghiệm con lắc lò xo dao động điều hòa như hình bên dưới. Biên độ dao động $A = 5\\,\\text{cm}$, chu kì $T = 0.2\\,\\text{s}$. Tốc độ cực đại của vật nhỏ là:")
                    .questionType("MULTIPLE_CHOICE")
                    .imageUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80")
                    .optionA("$v_{\\max} = 50\\pi\\,\\text{cm/s}$")
                    .optionB("$v_{\\max} = 25\\pi\\,\\text{cm/s}$")
                    .optionC("$v_{\\max} = 10\\pi\\,\\text{cm/s}$")
                    .optionD("$v_{\\max} = 5\\pi\\,\\text{cm/s}$")
                    .correctAnswer("A")
                    .explanation("Tần số góc của dao động: $\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{0.2} = 10\\pi\\,\\text{rad/s}$.\n" +
                            "Vận tốc cực đại của dao động điều hòa là: $v_{\\max} = \\omega A = 10\\pi \\times 5 = 50\\pi\\,\\text{cm/s}$.")
                    .points(10)
                    .sortOrder(4)
                    .build());

            // Q5: True / False 4 options (Chuẩn định dạng mới 2025 của Bộ GD&ĐT)
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$. Xét tính đúng hoặc sai của các khẳng định sau:")
                    .questionType("TRUE_FALSE_4")
                    .optionA("a) Đạo hàm của hàm số là $f'(x) = 3x^2 - 6x$.")
                    .optionB("b) Hàm số đồng biến trên khoảng $(0; 2)$.")
                    .optionC("c) Điểm cực đại của đồ thị hàm số là $A(0; 2)$.")
                    .optionD("d) Giá trị nhỏ nhất của hàm số trên đoạn $[1; 3]$ bằng $-2$.")
                    .correctAnswer("T,F,T,T")
                    .explanation("Lời giải chi tiết:\n" +
                            "- a) ĐÚNG: $f'(x) = 3x^2 - 6x$.\n" +
                            "- b) SAI: Trong khoảng $(0; 2)$, $f'(x) < 0$ nên hàm số nghịch biến trên $(0; 2)$.\n" +
                            "- c) ĐÚNG: $f'(0) = 0$ và $f''(0) = -6 < 0 \\Rightarrow x = 0$ là điểm cực đại, $y(0) = 2$. Do đó điểm cực đại là $A(0; 2)$.\n" +
                            "- d) ĐÚNG: Trên $[1; 3]$, ta có $f(1) = 0$, $f(2) = -2$, $f(3) = 2$. Suy ra $\\min_{[1; 3]} f(x) = -2$ tại $x = 2$.")
                    .points(10)
                    .sortOrder(5)
                    .build());

            // Q6: Short Answer (Điền đáp số)
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Biết rằng đồ thị hàm số $y = x^3 - 3x + m$ tiếp xúc với trục hoành $Ox$. Tính tổng tất cả các giá trị thực của tham số $m$.")
                    .questionType("SHORT_ANSWER")
                    .correctAnswer("0|0.0")
                    .explanation("Lời giải chi tiết:\n" +
                            "Đồ thị tiếp xúc với trục $Ox \\Leftrightarrow$ hệ phương trình sau có nghiệm:\n" +
                            "$\\begin{cases} x^3 - 3x + m = 0 \\\\ 3x^2 - 3 = 0 \\end{cases}$\n" +
                            "Từ (2) ta có $x = 1$ hoặc $x = -1$.\n" +
                            "- Với $x = 1 \\Rightarrow 1 - 3 + m = 0 \\Rightarrow m = 2$.\n" +
                            "- Với $x = -1 \\Rightarrow (-1)^3 - 3(-1) + m = 0 \\Rightarrow m = -2$.\n" +
                            "Vậy tổng các giá trị thực của $m$ là: $2 + (-2) = 0$.")
                    .points(10)
                    .sortOrder(6)
                    .build());

            // Q7: Essay (Tự luận giải chi tiết)
            questions.add(QuizQuestion.builder()
                    .quiz(mathQuiz)
                    .questionText("Tìm tất cả các giá trị của tham số $m$ để hàm số $y = \\frac{1}{3}x^3 - mx^2 + (m^2 - 4)x + 3$ đạt cực đại tại điểm $x = 1$. Hãy trình bày các bước lập luận và tính toán chi tiết.")
                    .questionType("ESSAY")
                    .correctAnswer("m = 3")
                    .explanation("Hướng dẫn giải và thang điểm chi tiết (Bareme):\n" +
                            "1. Tập xác định $D = \\mathbb{R}$.\n" +
                            "2. Đạo hàm: $y' = x^2 - 2mx + (m^2 - 4)$, $y'' = 2x - 2m$.\n" +
                            "3. Điều kiện cần để hàm số đạt cực trị tại $x = 1$ là $y'(1) = 0$:\n" +
                            "   $1 - 2m + m^2 - 4 = 0 \\Leftrightarrow m^2 - 2m - 3 = 0 \\Leftrightarrow m = -1$ hoặc $m = 3$.\n" +
                            "4. Điều kiện đủ:\n" +
                            "   - Với $m = -1 \\Rightarrow y''(1) = 2 - 2(-1) = 4 > 0 \\Rightarrow x = 1$ là điểm cực tiểu (Loại).\n" +
                            "   - Với $m = 3 \\Rightarrow y''(1) = 2 - 2(3) = -4 < 0 \\Rightarrow x = 1$ là điểm cực đại (Thỏa mãn).\n" +
                            "Vậy giá trị cần tìm là $m = 3$.")
                    .points(10)
                    .sortOrder(7)
                    .build());

            mathQuiz.setQuestions(questions);
            quizRepository.save(mathQuiz);
            log.info("Seeded sample math quiz with 7 rich questions across all 4 formats: Multiple Choice, True/False 4, Short Answer, and Essay.");
        }
    }

    private void seedGrade11BatchExams() {
        log.info("=== Starting Grade 11 Batch Exam Seeding: 8 Subjects x 2 Exams = 16 Exams ===");
        try {
            seedMathGrade11Exams();
            seedPhysicsGrade11Exams();
            seedChemistryGrade11Exams();
            seedBiologyGrade11Exams();
            seedEnglishGrade11Exams();
            seedLiteratureGrade11Exams();
            seedHistoryGrade11Exams();
            seedGeographyGrade11Exams();
            log.info("=== Successfully completed Grade 11 Batch Exam Seeding (16 exams loaded)! ===");
        } catch (Exception e) {
            log.error("Error during Grade 11 batch exams seeding: {}", e.getMessage(), e);
        }
    }

    private Course findOrCreateGrade11Course(String subjectCode, String subjectTitle, String teacherName, String defaultThumb, String defaultDesc) {
        List<Course> allCourses = courseRepository.findAll();
        for (Course c : allCourses) {
            String g = c.getGrade();
            if (("11".equals(g) || "LOP_11".equals(g)) && subjectCode.equalsIgnoreCase(c.getSubject())) {
                return c;
            }
        }

        List<Teacher> teachers = teacherRepository.findBySubjectIgnoreCaseAndIsActiveTrue(subjectCode);
        Teacher teacher = !teachers.isEmpty() ? teachers.get(0) : teacherRepository.findAll().stream().findFirst().orElse(null);

        String slug = "khoa-hoc-chuyen-sau-lop-11-" + subjectCode.toLowerCase().replace("_", "-") + "-2026";
        Course newCourse = Course.builder()
                .title(subjectTitle)
                .slug(slug)
                .grade("11")
                .subject(subjectCode)
                .teacher(teacher)
                .teacherName(teacher != null ? teacher.getName() : teacherName)
                .price(new BigDecimal("790000"))
                .originalPrice(new BigDecimal("1500000"))
                .discountPercent(47)
                .thumbnailUrl(defaultThumb)
                .badge("PRO_2026")
                .description(defaultDesc)
                .targetAudience("Học sinh lớp 11 học theo chương trình mới GDPT hướng tới điểm 9+ và thi ĐGNL.")
                .totalLessons(50)
                .totalHours(70)
                .rating(4.9)
                .studentCount(1800)
                .isActive(true)
                .isFeatured(false)
                .sortOrder(20)
                .featuresList("Bám sát cấu trúc đề thi 2025 của Bộ GD&ĐT;Hệ thống 4 dạng câu hỏi: Trắc nghiệm, Đúng/Sai, Điền số, Tự luận;Lời giải KaTeX trực quan chi tiết;Thi thử trực tuyến có chấm điểm tự động")
                .build();

        Course saved = courseRepository.save(newCourse);
        ensureCourseLessons(saved);
        return saved;
    }

    private List<Lesson> ensureCourseLessons(Course course) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(course.getId());
        if (lessons.isEmpty()) {
            Lesson l1 = Lesson.builder()
                    .course(course)
                    .chapterName("Học kỳ I: Kiến thức nền tảng & Tổng ôn")
                    .title("Chuyên đề 01: Kiến thức trọng tâm & Đề số 01")
                    .durationMinutes(45)
                    .videoUrl("https://www.youtube.com/watch?v=k5q6G6dG-dE")
                    .isFreePreview(true)
                    .sortOrder(1)
                    .build();
            Lesson l2 = Lesson.builder()
                    .course(course)
                    .chapterName("Học kỳ II: Luyện đề thực chiến & Vận dụng cao")
                    .title("Chuyên đề 02: Nâng cao thực chiến & Đề số 02")
                    .durationMinutes(45)
                    .videoUrl("https://www.youtube.com/watch?v=7u3Q5d4g3Uo")
                    .isFreePreview(false)
                    .sortOrder(2)
                    .build();
            lessons = lessonRepository.saveAll(List.of(l1, l2));
        } else if (lessons.size() == 1) {
            Lesson l2 = Lesson.builder()
                    .course(course)
                    .chapterName("Học kỳ II: Luyện đề thực chiến & Vận dụng cao")
                    .title("Chuyên đề 02: Nâng cao thực chiến & Đề số 02")
                    .durationMinutes(45)
                    .videoUrl("https://www.youtube.com/watch?v=7u3Q5d4g3Uo")
                    .isFreePreview(false)
                    .sortOrder(2)
                    .build();
            lessons.add(lessonRepository.save(l2));
        }
        return lessons;
    }

    private Quiz createQuizIfNotExists(Lesson lesson, String title, String description, int timeLimitMinutes, int passingScore, List<QuizQuestion> questions) {
        List<Quiz> existing = quizRepository.findByLessonIdOrderBySortOrderAsc(lesson.getId());
        for (Quiz q : existing) {
            if (title.trim().equalsIgnoreCase(q.getTitle().trim())) {
                log.info("Quiz '{}' already exists for lesson id {}. Skipping.", title, lesson.getId());
                return q;
            }
        }

        Quiz quiz = Quiz.builder()
                .lesson(lesson)
                .title(title)
                .description(description)
                .timeLimitMinutes(timeLimitMinutes)
                .passingScore(passingScore)
                .isActive(true)
                .sortOrder(existing.size() + 1)
                .build();

        for (QuizQuestion q : questions) {
            q.setQuiz(quiz);
        }
        quiz.setQuestions(questions);
        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Created Quiz: '{}' ({} questions) for Lesson: '{}'", title, questions.size(), lesson.getTitle());
        return savedQuiz;
    }

    private QuizQuestion buildMCQ(String text, String optA, String optB, String optC, String optD, String answer, String exp, int points, int sortOrder) {
        return QuizQuestion.builder()
                .questionText(text)
                .questionType("MULTIPLE_CHOICE")
                .optionA(optA)
                .optionB(optB)
                .optionC(optC)
                .optionD(optD)
                .correctAnswer(answer)
                .explanation(exp)
                .points(points)
                .sortOrder(sortOrder)
                .build();
    }

    private QuizQuestion buildTF4(String text, String optA, String optB, String optC, String optD, String answerTFTT, String exp, int points, int sortOrder) {
        return QuizQuestion.builder()
                .questionText(text)
                .questionType("TRUE_FALSE_4")
                .optionA(optA)
                .optionB(optB)
                .optionC(optC)
                .optionD(optD)
                .correctAnswer(answerTFTT)
                .explanation(exp)
                .points(points)
                .sortOrder(sortOrder)
                .build();
    }

    private QuizQuestion buildShortAnswer(String text, String answer, String exp, int points, int sortOrder) {
        return QuizQuestion.builder()
                .questionText(text)
                .questionType("SHORT_ANSWER")
                .correctAnswer(answer)
                .explanation(exp)
                .points(points)
                .sortOrder(sortOrder)
                .build();
    }

    private QuizQuestion buildEssay(String text, String answer, String exp, int points, int sortOrder) {
        return QuizQuestion.builder()
                .questionText(text)
                .questionType("ESSAY")
                .correctAnswer(answer)
                .explanation(exp)
                .points(points)
                .sortOrder(sortOrder)
                .build();
    }

    // ==========================================
    // 1. TOÁN HỌC (TOAN - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedMathGrade11Exams() {
        Course course = findOrCreateGrade11Course("TOAN", "Toán 11 Chuyên Sâu: Đại Số & Hình Không Gian", "Cô Ngọc Huyền LB",
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
                "Khóa học nền tảng và nâng cao Toán lớp 11 với trọn bộ bài tập bám sát ma trận 2025.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Tập xác định của hàm số $y = \\tan\\left(x - \\frac{\\pi}{4}\\right)$ là:",
                "$D = \\mathbb{R} \\setminus \\left\\{ \\frac{3\\pi}{4} + k\\pi, k \\in \\mathbb{Z} \\right\\}$",
                "$D = \\mathbb{R} \\setminus \\left\\{ \\frac{\\pi}{4} + k\\pi, k \\in \\mathbb{Z} \\right\\}$",
                "$D = \\mathbb{R} \\setminus \\left\\{ \\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z} \\right\\}$",
                "$D = \\mathbb{R}$",
                "A", "Hàm số $y = \\tan(u)$ xác định khi $u \\ne \\frac{\\pi}{2} + k\\pi \\Leftrightarrow x - \\frac{\\pi}{4} \\ne \\frac{\\pi}{2} + k\\pi \\Leftrightarrow x \\ne \\frac{3\\pi}{4} + k\\pi\\ (k \\in \\mathbb{Z})$.", 10, 1));
        qList1.add(buildMCQ("Giá trị lớn nhất của hàm số $y = 3\\sin(2x) - 1$ trên tập số thực $\\mathbb{R}$ bằng:",
                "$2$", "$3$", "$4$", "$-1$",
                "A", "Vì $-1 \\le \\sin(2x) \\le 1$ với mọi $x \\in \\mathbb{R}$ nên $3(-1) - 1 \\le 3\\sin(2x) - 1 \\le 3(1) - 1 \\Leftrightarrow -4 \\le y \\le 2$. Vậy giá trị lớn nhất là 2.", 10, 2));
        qList1.add(buildTF4("Cho phương trình lượng giác $\\cos(2x) + \\cos(x) = 0$. Xét tính đúng/sai của các mệnh đề sau:",
                "a) Phương trình có thể biến đổi thành $2\\cos^2(x) + \\cos(x) - 1 = 0$.",
                "b) Nghiệm của phương trình theo $\\cos(x)$ là $\\cos(x) = -1$ và $\\cos(x) = \\frac{1}{2}$.",
                "c) Trong đoạn $[0; \\pi]$, phương trình có đúng 2 nghiệm phân biệt.",
                "d) Nghiệm dương nhỏ nhất của phương trình là $x = \\frac{\\pi}{3}$.",
                "T,T,T,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: $\\cos(2x) = 2\\cos^2(x) - 1$, thay vào ta được phương trình bậc hai $2\\cos^2(x) + \\cos(x) - 1 = 0$.\n" +
                "- b) ĐÚNG: Đặt $t = \\cos(x)$, giải $2t^2 + t - 1 = 0 \\Rightarrow t = -1$ hoặc $t = 1/2$.\n" +
                "- c) ĐÚNG: Trên $[0; \\pi]$, $\\cos(x) = -1 \\Rightarrow x = \\pi$; $\\cos(x) = 1/2 \\Rightarrow x = \\pi/3$. Có 2 nghiệm phân biệt $\\pi/3$ và $\\pi$.\n" +
                "- d) ĐÚNG: Nghiệm dương nhỏ nhất là $x = \\pi/3$.", 10, 3));
        qList1.add(buildShortAnswer("Tìm số lượng nghiệm của phương trình $\\sin(x) = \\frac{1}{2}$ thuộc đoạn $[0; 3\\pi]$.",
                "4", "Trong đoạn $[0; 2\\pi]$, $\\sin(x) = 1/2$ có 2 nghiệm: $x_1 = \\pi/6$, $x_2 = 5\\pi/6$.\n" +
                "Trong khoảng $(2\\pi; 3\\pi]$, ta có nghiệm $x_3 = 2\\pi + \\pi/6 = 13\\pi/6$ và $x_4 = 2\\pi + 5\\pi/6 = 17\\pi/6$.\n" +
                "Tổng cộng có đúng 4 nghiệm trong đoạn $[0; 3\\pi]$.", 10, 4));
        qList1.add(buildEssay("Giải phương trình lượng giác: $\\sqrt{3}\\sin(x) + \\cos(x) = \\sqrt{2}$. Hãy trình bày từng bước biến đổi chi tiết.",
                "x = pi/12 + k2pi hoặc x = 7pi/12 + k2pi", "Bareme hướng dẫn chấm:\n" +
                "1. Chia cả hai vế của phương trình cho 2: $\\frac{\\sqrt{3}}{2}\\sin(x) + \\frac{1}{2}\\cos(x) = \\frac{\\sqrt{2}}{2}$.\n" +
                "2. Biến đổi: $\\sin\\left(x + \\frac{\\pi}{6}\\right) = \\sin\\left(\\frac{\\pi}{4}\\right)$.\n" +
                "3. Suy ra họ nghiệm:\n" +
                "   - $x + \\frac{\\pi}{6} = \\frac{\\pi}{4} + k2\\pi \\Leftrightarrow x = \\frac{\\pi}{12} + k2\\pi\\ (k \\in \\mathbb{Z})$.\n" +
                "   - $x + \\frac{\\pi}{6} = \\pi - \\frac{\\pi}{4} + k2\\pi \\Leftrightarrow x = \\frac{7\\pi}{12} + k2\\pi\\ (k \\in \\mathbb{Z})$.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Toán 11] Đề thi số 01: Hàm số Lượng giác & Phương trình Lượng giác",
                "Đề kiểm tra định kỳ 45 phút chuẩn format Bộ GD&ĐT 2025 gồm trắc nghiệm, đúng/sai, trả lời ngắn và tự luận.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 2$ và công sai $d = 3$. Số hạng thứ 5 của cấp số cộng là:",
                "$u_5 = 14$", "$u_5 = 15$", "$u_5 = 17$", "$u_5 = 11$",
                "A", "Công thức số hạng tổng quát của cấp số cộng: $u_n = u_1 + (n - 1)d \\Rightarrow u_5 = 2 + 4 \\times 3 = 14$.", 10, 1));
        qList2.add(buildMCQ("Tính giới hạn dãy số: $L = \\lim_{n \\to +\\infty} \\frac{3n^2 + 2n - 1}{n^2 + 5}$.",
                "$L = 3$", "$L = 0$", "$L = +\\infty$", "$L = 1$",
                "A", "Chia cả tử và mẫu cho $n^2$ ta được: $L = \\lim \\frac{3 + \\frac{2}{n} - \\frac{1}{n^2}}{1 + \\frac{5}{n^2}} = \\frac{3 + 0 - 0}{1 + 0} = 3$.", 10, 2));
        qList2.add(buildTF4("Cho cấp số nhân $(v_n)$ có số hạng đầu $v_1 = 3$ và công bội $q = 2$. Xét tính đúng/sai của các khẳng định sau:",
                "a) Số hạng thứ 4 của cấp số nhân là $v_4 = 24$.",
                "b) Công thức số hạng tổng quát là $v_n = 3 \\cdot 2^{n-1}$.",
                "c) Tổng 6 số hạng đầu tiên $S_6 = 189$.",
                "d) Dãy số $(v_n)$ là một dãy số giảm.",
                "T,T,T,F", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: $v_4 = v_1 \\cdot q^3 = 3 \\cdot 2^3 = 24$.\n" +
                "- b) ĐÚNG: $v_n = v_1 \\cdot q^{n-1} = 3 \\cdot 2^{n-1}$.\n" +
                "- c) ĐÚNG: $S_6 = v_1 \\frac{1 - q^6}{1 - q} = 3 \\frac{1 - 64}{1 - 2} = 3 \\times 63 = 189$.\n" +
                "- d) SAI: Vì $v_1 > 0$ và $q = 2 > 1$ nên dãy $(v_n)$ tăng nghiêm ngặt.", 10, 3));
        qList2.add(buildShortAnswer("Tính giá trị của giới hạn hàm số: $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.",
                "6", "Ta có: $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = \\lim_{x \\to 3} \\frac{(x - 3)(x + 3)}{x - 3} = \\lim_{x \\to 3} (x + 3) = 3 + 3 = 6$.", 10, 4));
        qList2.add(buildEssay("Một người gửi tiết kiệm 100 triệu đồng vào ngân hàng với lãi suất $6\\%$/năm theo hình thức lãi kép. Hỏi sau ít nhất bao nhiêu năm người đó nhận được số tiền lớn hơn 150 triệu đồng?",
                "Sau ít nhất 7 năm", "Bareme hướng dẫn chấm:\n" +
                "1. Công thức lãi kép: $A_n = A(1 + r)^n = 100 \\times (1 + 0.06)^n = 100(1.06)^n$ (triệu đồng).\n" +
                "2. Yêu cầu: $100(1.06)^n > 150 \\Leftrightarrow (1.06)^n > 1.5$.\n" +
                "3. Lấy logarit tự nhiên: $n > \\frac{\\ln(1.5)}{\\ln(1.06)} \\approx 6.958$.\n" +
                "4. Vì số năm là số nguyên nên sau ít nhất $n = 7$ năm.", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Toán 11] Đề thi số 02: Dãy số, Cấp số cộng, Cấp số nhân & Giới hạn",
                "Đề kiểm tra đánh giá năng lực tư duy Toán học 11 - Chương Dãy số và Giới hạn.", 45, 70, qList2);
    }

    // ==========================================
    // 2. VẬT LÝ (VAT_LY - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedPhysicsGrade11Exams() {
        Course course = findOrCreateGrade11Course("VAT_LY", "Vật Lý 11: Dao Động & Sóng Bản Chất", "Thầy Vũ Ngọc Anh",
                "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
                "Luyện thi Vật Lý 11 chuyên sâu bám sát sách giáo khoa mới và đề minh họa tốt nghiệp THPT 2025.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Một vật dao động điều hòa theo phương trình $x = 5\\cos\\left(10\\pi t + \\frac{\\pi}{6}\\right)\\,\\text{cm}$. Biên độ dao động của vật là:",
                "$A = 5\\,\\text{cm}$", "$A = 10\\,\\text{cm}$", "$A = 2.5\\,\\text{cm}$", "$A = 5\\pi\\,\\text{cm}$",
                "A", "Đối chiếu phương trình dao động điều hòa dạng chuẩn $x = A\\cos(\\omega t + \\varphi)$, ta có biên độ dao động $A = 5\\,\\text{cm}$.", 10, 1));
        qList1.add(buildMCQ("Trong dao động điều hòa của một chất điểm, gia tốc $a$ của vật luôn:",
                "Ngược pha với li độ $x$", "Cùng pha với li độ $x$", "Vuông pha với li độ $x$", "Lệch pha $\\pi/4$ so với li độ $x$",
                "A", "Ta có $a = -\\omega^2 x = \\omega^2 x \\cos(\\omega t + \\varphi + \\pi)$. Do đó gia tốc luôn ngược pha với li độ và hướng về vị trí cân bằng.", 10, 2));
        qList1.add(buildTF4("Xét một con lắc lò xo treo thẳng đứng đang dao động điều hòa quanh vị trí cân bằng. Nhận định tính đúng/sai:",
                "a) Chu kì dao động của con lắc tỉ lệ thuận với căn bậc hai của khối lượng vật nặng.",
                "b) Động năng của vật đạt giá trị cực đại khi vật đi qua vị trí cân bằng.",
                "c) Cơ năng của con lắc lò xo biến thiên tuần hoàn theo thời gian với chu kì $T/2$.",
                "d) Độ lớn gia tốc cực đại của vật được tính bởi công thức $a_{\\max} = \\omega^2 A$.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Chu kì $T = 2\\pi \\sqrt{\\frac{m}{k}}$, tỉ lệ thuận với $\\sqrt{m}$.\n" +
                "- b) ĐÚNG: Tại vị trí cân bằng li độ $x = 0$, tốc độ $v_{\\max} = \\omega A$, do đó động năng cực đại.\n" +
                "- c) SAI: Nếu bỏ qua mọi ma sát thì cơ năng của con lắc được bảo toàn (không đổi theo thời gian).\n" +
                "- d) ĐÚNG: $a_{\\max} = \\omega^2 A$.", 10, 3));
        qList1.add(buildShortAnswer("Một chất điểm dao động điều hòa với biên độ $A = 4\\,\\text{cm}$ và tần số góc $\\omega = 10\\,\\text{rad/s}$. Tốc độ cực đại $v_{\\max}$ của chất điểm bằng bao nhiêu cm/s?",
                "40", "Tốc độ cực đại trong dao động điều hòa là: $v_{\\max} = \\omega A = 10 \\times 4 = 40\\,\\text{cm/s}$.", 10, 4));
        qList1.add(buildEssay("Phân biệt dao động duy trì và dao động cưỡng bức. Nêu rõ điều kiện để xảy ra hiện tượng cộng hưởng cơ học trong đời sống.",
                "Dao động duy trì cung cấp năng lượng đúng bằng năng lượng tiêu hao sau mỗi chu kì mà không thay đổi tần số riêng. Dao động cưỡng bức chịu tác dụng của ngoại lực biến thiên tuần hoàn. Cộng hưởng xảy ra khi f_ngoai = f_0.",
                "Bareme chấm điểm chi tiết:\n" +
                "1. Dao động duy trì: Bổ sung năng lượng sau mỗi chu kì bù vào phần mất mát do ma sát, chu kì dao động bằng chu kì riêng $T_0$.\n" +
                "2. Dao động cưỡng bức: Dao động dưới tác dụng của một ngoại lực tuần hoàn $F = F_0\\cos(\\Omega t)$, tần số dao động bằng tần số $\\Omega$ của lực cưỡng bức.\n" +
                "3. Hiện tượng cộng hưởng: Xảy ra khi tần số của lực cưỡng bức bằng tần số dao động riêng của hệ ($\\Omega = \\omega_0$). Biên độ dao động cưỡng bức đạt giá trị cực đại.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Vật Lý 11] Đề thi số 01: Dao động điều hòa & Năng lượng dao động",
                "Đề kiểm tra 45 phút khảo sát chương Dao động điều hòa môn Vật Lý 11.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Sóng dọc là sóng trong đó các phần tử của môi trường dao động:",
                "Theo phương trùng với phương truyền sóng", "Theo phương vuông góc với phương truyền sóng",
                "Theo phương nằm ngang", "Theo phương thẳng đứng",
                "A", "Định nghĩa: Sóng dọc là sóng mà trong đó các phần tử của môi trường dao động theo phương trùng với phương truyền sóng.", 10, 1));
        qList2.add(buildMCQ("Khi một sóng cơ truyền từ môi trường không khí vào môi trường nước thì đại lượng nào sau đây KHÔNG đổi?",
                "Tần số của sóng", "Vận tốc truyền sóng", "Bước sóng", "Biên độ của sóng",
                "A", "Tần số của sóng do nguồn sóng quyết định nên không thay đổi khi sóng truyền qua các môi trường khác nhau. Tốc độ và bước sóng sẽ thay đổi.", 10, 2));
        qList2.add(buildTF4("Xét hiện tượng sóng dừng trên một sợi dây đàn hồi dài hai đầu cố định có bước sóng $\\lambda$. Nhận định đúng/sai:",
                "a) Hai đầu sợi dây luôn là hai nút sóng cố định.",
                "b) Khoảng cách giữa hai nút sóng liên tiếp (hoặc hai bụng sóng liên tiếp) bằng $\\frac{\\lambda}{2}$.",
                "c) Bề rộng của một bụng sóng trong sóng dừng bằng đúng một bước sóng $\\lambda$.",
                "d) Sóng dừng là hiện tượng giao thoa giữa sóng tới và sóng phản xạ trên cùng một phương truyền.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Hai đầu cố định là hai nút sóng.\n" +
                "- b) ĐÚNG: Khoảng cách giữa hai nút liên tiếp là nửa bước sóng $\\lambda/2$.\n" +
                "- c) SAI: Bề rộng bụng sóng là khoảng cách giữa 2 vị trí biên của bụng, bằng $4A$ (với $A$ là biên độ nguồn).\n" +
                "- d) ĐÚNG: Bản chất sóng dừng là giao thoa sóng tới và phản xạ.", 10, 3));
        qList2.add(buildShortAnswer("Một sóng cơ hình sin có tần số $f = 50\\,\\text{Hz}$ lan truyền trong chất lỏng với tốc độ $v = 10\\,\\text{m/s}$. Bước sóng $\\lambda$ bằng bao nhiêu cm?",
                "20", "Bước sóng: $\\lambda = \\frac{v}{f} = \\frac{10}{50} = 0.2\\,\\text{m} = 20\\,\\text{cm}$.", 10, 4));
        qList2.add(buildEssay("Nêu điều kiện cần và đủ để xảy ra hiện tượng giao thoa sóng cơ học. Giải thích tại sao trên mặt nước lại xuất hiện các gợn sóng cực đại và cực tiểu xen kẽ.",
                "Điều kiện: Hai nguồn kết hợp cùng tần số và độ lệch pha không đổi. Cực đại khi d2 - d1 = k*lambda; Cực tiểu khi d2 - d1 = (k + 0.5)*lambda.",
                "Bareme hướng dẫn chấm:\n" +
                "1. Điều kiện giao thoa: Hai sóng phải xuất phát từ hai nguồn kết hợp (dao động cùng phương, cùng tần số và có hiệu số pha không đổi theo thời gian).\n" +
                "2. Vị trí cực đại: Những điểm có hiệu đường đi từ hai nguồn bằng số nguyên lần bước sóng: $d_2 - d_1 = k\\lambda$ (hai sóng tới cùng pha, tăng cường nhau).\n" +
                "3. Vị trí cực tiểu: Những điểm có hiệu đường đi bằng số bán nguyên lần bước sóng: $d_2 - d_1 = (k + 0.5)\\lambda$ (hai sóng tới ngược pha, triệt tiêu nhau).", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Vật Lý 11] Đề thi số 02: Sóng cơ học & Sự giao thoa sóng",
                "Đề kiểm tra 45 phút chương Sóng cơ - Sóng dừng - Giao thoa sóng Vật Lý 11.", 45, 70, qList2);
    }

    // ==========================================
    // 3. HÓA HỌC (HOA_HOC - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedChemistryGrade11Exams() {
        Course course = findOrCreateGrade11Course("HOA_HOC", "Hóa Học 11: Cân Bằng Hóa Học & Hydrocarbon", "Thầy Trương Công Kiên",
                "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
                "Chinh phục điểm 9+ Hóa học 11 chương trình mới với sơ đồ tư duy Mindmap và phương pháp giải nhanh.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Chất nào sau đây là chất điện ly mạnh khi tan trong nước?",
                "$NaCl$", "$CH_3COOH$", "$H_2O$", "$C_2H_5OH$",
                "A", "$NaCl$ là muối tan hoàn toàn phân ly thành các ion tự do: $NaCl \\to Na^+ + Cl^-$, do đó là chất điện ly mạnh.", 10, 1));
        qList1.add(buildMCQ("Dung dịch acid $HNO_3$ có nồng độ $[H^+] = 10^{-4}\\,\\text{M}$. Giá trị pH của dung dịch này bằng:",
                "$4$", "$10$", "$3$", "$7$",
                "A", "Công thức tính pH: $\\text{pH} = -\\log[H^+] = -\\log(10^{-4}) = 4$.", 10, 2));
        qList1.add(buildTF4("Cho phản ứng thuận nghịch tổng hợp ammonia trong bình kín: $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ ($\\Delta_r H_{298}^0 = -92\\,\\text{kJ}$). Xét tính đúng/sai:",
                "a) Phản ứng thuận là phản ứng tỏa nhiệt.",
                "b) Khi tăng nhiệt độ của hệ phản ứng, cân bằng hóa học chuyển dịch theo chiều nghịch.",
                "c) Khi tăng áp suất chung của hệ, cân bằng chuyển dịch theo chiều thuận tạo thêm $NH_3$.",
                "d) Thêm chất xúc tác bột sắt (Fe) làm chuyển dịch vị trí cân bằng sang chiều thuận.",
                "T,T,T,F", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: $\\Delta_r H_{298}^0 < 0$ nên chiều thuận là tỏa nhiệt.\n" +
                "- b) ĐÚNG: Theo nguyên lý Le Chatelier, tăng nhiệt độ cân bằng chuyển dịch theo chiều thu nhiệt (chiều nghịch).\n" +
                "- c) ĐÚNG: Phía chất phản ứng có 4 mol khí, sản phẩm có 2 mol khí. Tăng áp suất cân bằng dịch về phía giảm số mol khí (chiều thuận).\n" +
                "- d) SAI: Chất xúc tác chỉ làm tăng tốc độ đạt đến trạng thái cân bằng chứ không làm thay đổi vị trí cân bằng.", 10, 3));
        qList1.add(buildShortAnswer("Hòa tan hoàn toàn $0.001\\,\\text{mol}$ $HCl$ vào nước thu được $1\\,\\text{lít}$ dung dịch. Dung dịch này có giá trị pH bằng bao nhiêu?",
                "3", "Nồng độ $[H^+] = \\frac{0.001}{1} = 10^{-3}\\,\\text{M}$. Giá trị $\\text{pH} = -\\log(10^{-3}) = 3$.", 10, 4));
        qList1.add(buildEssay("Theo thuyết acid - base của Brønsted-Lowry, hãy xác định chất nào là acid, chất nào là base trong phản ứng sau: $CH_3COOH + H_2O \\rightleftharpoons CH_3COO^- + H_3O^+$. Giải thích chi tiết.",
                "CH3COOH là acid (cho H+), H2O là base (nhận H+). CH3COO- là base liên hợp, H3O+ là acid liên hợp.",
                "Bareme chấm điểm:\n" +
                "1. Định nghĩa Brønsted-Lowry: Acid là chất có khả năng cho proton ($H^+$), Base là chất có khả năng nhận proton ($H^+$).\n" +
                "2. Phân tích chiều thuận: $CH_3COOH$ nhường proton $H^+$ cho $H_2O$ nên $CH_3COOH$ là acid; $H_2O$ nhận proton nên là base.\n" +
                "3. Chiều nghịch: $H_3O^+$ nhường $H^+$ cho $CH_3COO^-$ nên $H_3O^+$ là acid (acid liên hợp), $CH_3COO^-$ nhận $H^+$ nên là base (base liên hợp).", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Hóa Học 11] Đề thi số 01: Cân bằng Hóa học & Dung dịch chất điện ly",
                "Đề kiểm tra 45 phút chương Cân bằng hóa học và Thuyết acid - base lớp 11.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Công thức phân tử tổng quát của dãy đồng đẳng Alkane (hydrocarbon no, mạch hở) là:",
                "$C_n H_{2n+2}\\ (n \\ge 1)$", "$C_n H_{2n}\\ (n \\ge 2)$", "$C_n H_{2n-2}\\ (n \\ge 2)$", "$C_n H_{2n-6}\\ (n \\ge 6)$",
                "A", "Alkane là những hydrocarbon no, mạch hở có công thức chung là $C_n H_{2n+2}$ với $n \\ge 1$.", 10, 1));
        qList2.add(buildMCQ("Hydrocarbon mạch hở chứa một liên kết đôi $C=C$ trong phân tử thuộc dãy đồng đẳng nào sau đây?",
                "Alkene", "Alkane", "Alkyne", "Arene",
                "A", "Alkene là hydrocarbon không no, mạch hở có chứa một liên kết đôi $C=C$, công thức chung $C_n H_{2n}\\ (n \\ge 2)$.", 10, 2));
        qList2.add(buildTF4("Xét hợp chất hữu cơ ethylene ($CH_2=CH_2$). Nhận định đúng/sai:",
                "a) Ethylene thuộc dãy đồng đẳng Alkene.",
                "b) Phản ứng hóa học đặc trưng của ethylene là phản ứng cộng.",
                "c) Ethylene không có khả năng làm mất màu dung dịch thuốc tím $KMnO_4$.",
                "d) Trùng hợp ethylene ở điều kiện nhiệt độ, áp suất thích hợp thu được nhựa Polyethylene (PE).",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Công thức $C_2H_4$ là chất đầu tiên của dãy đồng đẳng Alkene.\n" +
                "- b) ĐÚNG: Do có liên kết đôi $C=C$ gồm 1 liên kết $\\pi$ kém bền nên phản ứng đặc trưng là phản ứng cộng.\n" +
                "- c) SAI: Ethylene có nối đôi nên dễ dàng làm mất màu tím của dung dịch $KMnO_4$.\n" +
                "- d) ĐÚNG: $n CH_2=CH_2 \\xrightarrow{t^\\circ, p, xt} (-CH_2-CH_2-)_n$ (nhựa PE).", 10, 3));
        qList2.add(buildShortAnswer("Trong một phân tử propane ($C_3H_8$), có tổng cộng bao nhiêu liên kết cộng hóa trị đơn giữa các nguyên tử?",
                "10", "Trong phân tử $C_3H_8$: có 2 liên kết $C-C$ và 8 liên kết $C-H$. Tổng số liên kết đơn $\\sigma$ là $2 + 8 = 10$.", 10, 4));
        qList2.add(buildEssay("Trình bày phương pháp hóa học phân biệt 3 khí mất nhãn: methane ($CH_4$), ethylene ($C_2H_4$) và sulfur dioxide ($SO_2$). Viết các phương trình hóa học minh họa.",
                "Dùng dung dịch Brom: SO2 và C2H4 làm mất màu (CH4 không làm mất màu). Sau đó dùng Ba(OH)2 phân biệt SO2 (kết tủa trắng) và C2H4.",
                "Bareme chấm điểm:\n" +
                "1. Bước 1: Dẫn lần lượt 3 khí qua dung dịch nước Brom dư:\n" +
                "   - $CH_4$ không hiện tượng (không làm mất màu dung dịch brom).\n" +
                "   - $C_2H_4$ và $SO_2$ đều làm mất màu vàng nâu của nước brom.\n" +
                "   $C_2H_4 + Br_2 \\to C_2H_4Br_2$; $SO_2 + Br_2 + 2H_2O \\to 2HBr + H_2SO_4$.\n" +
                "2. Bước 2: Dẫn 2 khí còn lại qua dung dịch nước vôi trong $Ca(OH)_2$ dư:\n" +
                "   - Khí làm xuất hiện kết tủa trắng là $SO_2$: $SO_2 + Ca(OH)_2 \\to CaSO_3\\downarrow + H_2O$.\n" +
                "   - Khí không có hiện tượng là $C_2H_4$.", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Hóa Học 11] Đề thi số 02: Hydrocarbon & Hóa học Hữu cơ Đại cương",
                "Đề kiểm tra 45 phút chuyên đề Alkane, Alkene và Hydrocarbon Hóa 11.", 45, 70, qList2);
    }

    // ==========================================
    // 4. SINH HỌC (SINH_HOC - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedBiologyGrade11Exams() {
        Course course = findOrCreateGrade11Course("SINH_HOC", "Sinh Học 11: Trao Đổi Chất & Điều Hòa Sinh Học", "Thầy Phạm Thắng",
                "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80",
                "Hệ thống toàn bộ kiến thức Sinh học 11 bám sát chương trình GDPT 2018 định hướng khối B00 Y Dược.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Sắc tố trực tiếp tham gia chuyển hóa năng lượng ánh sáng thành năng lượng hóa học trong phân tử ATP và NADPH ở cây xanh là:",
                "Diệp lục a", "Diệp lục b", "Carotenoid", "Xanthophyll",
                "A", "Chỉ có phân tử diệp lục a ở trung tâm phản ứng mới có khả năng chuyển hóa quang năng hấp thụ được thành hóa năng trong ATP và NADPH.", 10, 1));
        qList1.add(buildMCQ("Ở tế bào thực vật, bào quan trực tiếp thực hiện chức năng quang hợp là:",
                "Lục lạp", "Ti thể", "Không bào", "Bộ máy Golgi",
                "A", "Lục lạp là bào quan chứa hệ sắc tố quang hợp, màng thylakoid và chất nền stroma để tiến hành quang hợp.", 10, 2));
        qList1.add(buildTF4("Về quá trình quang hợp ở thực vật, xét tính đúng/sai của các phát biểu sau:",
                "a) Pha sáng của quang hợp diễn ra tại màng thylakoid của lục lạp.",
                "b) Khí $O_2$ được giải phóng trong quang hợp có nguồn gốc từ quá trình quang phân ly nước.",
                "c) Pha tối (chu trình Calvin) sử dụng ATP và NADPH do pha sáng tạo ra để cố định $CO_2$.",
                "d) Pha tối của quang hợp chỉ có thể diễn ra vào ban đêm trong điều kiện hoàn toàn không có ánh sáng.",
                "T,T,T,F", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Màng thylakoid chứa phức hệ quang hợp và chuỗi truyền điện tử của pha sáng.\n" +
                "- b) ĐÚNG: Nước bị quang phân ly $2H_2O \\to 4H^+ + 4e^- + O_2$.\n" +
                "- c) ĐÚNG: Năng lượng ATP và lực khử NADPH cung cấp cho chu trình Calvin khử $CO_2$ thành glucose.\n" +
                "- d) SAI: Pha tối diễn ra vào ban ngày khi có ánh sáng vì cần nguồn cung cấp liên tục ATP và NADPH từ pha sáng.", 10, 3));
        qList1.add(buildShortAnswer("Trong chu trình Calvin ở thực vật $C_3$, chất nhận $CO_2$ đầu tiên là Ribulose-1,5-bisphosphate có chứa bao nhiêu nguyên tử carbon?",
                "5", "Ribulose-1,5-bisphosphate (RuBP) là hợp chất 5 carbon ($C_5$), kết hợp với 1 phân tử $CO_2$ tạo thành hợp chất 6 carbon không bền, ngay sau đó tách thành 2 phân tử 3-PGA ($C_3$).", 10, 4));
        qList1.add(buildEssay("Giải thích vì sao khi bón quá nhiều phân hóa học vô cơ vào gốc cây thì cây trồng có thể bị héo rũ và chết? Nêu nguyên tắc bón phân hợp lý.",
                "Bón nhiều phân làm nồng độ dung dịch đất cao hơn dịch tế bào rễ, nước bị hút ra ngoài làm tế bào rễ co nguyên sinh, cây mất nước héo chết. Nguyên tắc: đúng loại, đúng liều lượng, đúng thời điểm, đúng phương pháp.",
                "Bareme chấm điểm chi tiết:\n" +
                "1. Cơ chế cây bị héo:\n" +
                "   - Bón quá nhiều phân làm nồng độ khoáng trong dung dịch đất tăng cao (thế nước của đất giảm xuống thấp hơn thế nước của dịch tế bào lông hút).\n" +
                "   - Nước không thể thẩm thấu vào rễ, thậm chí nước từ tế bào lông hút thẩm thấu ngược ra ngoài đất, dẫn tới hiện tượng co nguyên sinh, cây bị mất nước và héo chết.\n" +
                "2. Nguyên tắc bón phân hợp lý (4 đúng):\n" +
                "   - Đúng loại phân (phù hợp nhu cầu cây và từng thời kỳ sinh trưởng).\n" +
                "   - Đúng liều lượng (tránh thiếu hoặc thừa gây độc hại).\n" +
                "   - Đúng thời điểm (khi cây đang cần dinh dưỡng).\n" +
                "   - Đúng phương pháp (bón gốc, phun lá, bón lót hay bón thúc).", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Sinh Học 11] Đề thi số 01: Quang hợp & Hô hấp ở thực vật",
                "Đề kiểm tra 45 phút chương Trao đổi chất và Chuyển hóa năng lượng ở thực vật Sinh 11.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Đơn vị cấu tạo và chức năng cơ bản nhất của hệ thần kinh ở động vật là:",
                "Neuron (tế bào thần kinh)", "Dây thần kinh", "Hạch thần kinh", "Tủy sống",
                "A", "Neuron là tế bào thần kinh có chức năng cảm ứng và dẫn truyền xung thần kinh, tạo nên cấu trúc của hệ thần kinh.", 10, 1));
        qList2.add(buildMCQ("Một cung phản xạ hoàn chỉnh gồm bao nhiêu thành phần/bộ phận cơ bản?",
                "5 thành phần", "3 thành phần", "4 thành phần", "2 thành phần",
                "A", "Cung phản xạ gồm 5 thành phần: 1. Thụ quan; 2. Đường dẫn truyền hướng tâm; 3. Trung ương thần kinh; 4. Đường dẫn truyền ly tâm; 5. Cơ quan đáp ứng.", 10, 2));
        qList2.add(buildTF4("Xét các nhận định về cơ chế dẫn truyền xung thần kinh và synapse: Nhận định đúng/sai:",
                "a) Trên sợi thần kinh có bao myelin, xung thần kinh lan truyền theo lối 'nhảy cóc' từ eo Ranvier này sang eo Ranvier kế tiếp.",
                "b) Dẫn truyền nhảy cóc giúp tăng tốc độ truyền xung và tiết kiệm năng lượng tiêu hao cho hoạt động của bơm $Na^+-K^+$.",
                "c) Tại synapse hóa học, xung thần kinh có thể truyền hai chiều qua lại giữa màng trước và màng sau.",
                "d) Điện thế hoạt động phát sinh khi tế bào bị kích thích làm kênh $Na^+$ mở, ion $Na^+$ ồ ạt tràn vào bên trong màng.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Bao myelin cách điện nên khử cực chỉ xảy ra tại các eo Ranvier.\n" +
                "- b) ĐÚNG: Nhảy cóc nhanh hơn nhiều lần và giảm tiêu hao ATP cho bơm ion.\n" +
                "- c) SAI: Synapse hóa học chỉ dẫn truyền theo MỘT CHIỀU từ màng trước sang màng sau vì chỉ chùy synapse ở màng trước mới có bóng chứa chất trung gian hóa học.\n" +
                "- d) ĐÚNG: Dòng ion $Na^+$ tràn vào gây ra pha khử cực và đảo cực.", 10, 3));
        qList2.add(buildShortAnswer("Trong một cung phản xạ tủy sống cơ bản (như phản xạ co ngón tay khi chạm vật nóng), có tối thiểu bao nhiêu neuron tham gia?",
                "3", "Cung phản xạ tủy gồm tối thiểu 3 neuron: 1 neuron cảm giác (hướng tâm), 1 neuron trung gian (liên lạc tại tủy sống) và 1 neuron vận động (ly tâm).", 10, 4));
        qList2.add(buildEssay("Phân biệt phản xạ không điều kiện và phản xạ có điều kiện (về tính bẩm sinh, tính bền vững, trung ương điều khiển và ý nghĩa thích nghi). Cho ví dụ thực tế.",
                "Phản xạ không điều kiện: bẩm sinh, bền vững, trung ương dưới vỏ, mang tính loài. Phản xạ có điều kiện: học tập tập nhiễm, dễ mất nếu không củng cố, có sự tham gia của vỏ não, tính cá thể.",
                "Bareme chấm điểm:\n" +
                "1. Phản xạ không điều kiện:\n" +
                "   - Nguồn gốc: Bẩm sinh, di truyền từ đời trước, mang tính loài.\n" +
                "   - Tính bền vững: Rất bền vững, không thay đổi theo thời gian.\n" +
                "   - Trung ương: Dưới vỏ não (tủy sống, thân não).\n" +
                "   - Ví dụ: Chạm tay vào vật nóng tự động giật tay lại; em bé sinh ra biết bú mẹ.\n" +
                "2. Phản xạ có điều kiện:\n" +
                "   - Nguồn gốc: Được hình thành qua quá trình học tập, rèn luyện của cá thể.\n" +
                "   - Tính bền vững: Kém bền vững, dễ bị dập tắt nếu không được củng cố thường xuyên.\n" +
                "   - Trung ương: Có sự tham gia của vỏ bán cầu đại não.\n" +
                "   - Ví dụ: Nhìn thấy quả chanh ứa nước miếng; dừng đèn đỏ khi tham gia giao thông.", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Sinh Học 11] Đề thi số 02: Cảm ứng & Hoạt động Thần kinh ở Động vật",
                "Đề kiểm tra 45 phút chương Cảm ứng và Hệ thần kinh ở động vật Sinh học 11.", 45, 70, qList2);
    }

    // ==========================================
    // 5. TIẾNG ANH (TIENG_ANH - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedEnglishGrade11Exams() {
        Course course = findOrCreateGrade11Course("TIENG_ANH", "Tiếng Anh 11: Ngữ Pháp Chuyên Sâu & Kỹ Năng Đọc Hiểu", "Cô Hương Fiona",
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
                "Khóa học Tiếng Anh lớp 11 toàn diện: bứt phá điểm số trên lớp và chuẩn bị nền tảng IELTS 7.0+.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("The generation gap often results in disagreements between parents and children because of differences in ______ and lifestyle choices.",
                "opinions", "clothes", "height", "accents",
                "A", "'Differences in opinions and lifestyle choices' (Sự khác biệt về quan điểm và lựa chọn lối sống) là nguyên nhân chính dẫn đến khoảng cách thế hệ.", 10, 1));
        qList1.add(buildMCQ("You ______ enter this restricted laboratory without wearing protective equipment. It is strictly prohibited.",
                "mustn't", "don't have to", "shouldn't", "needn't",
                "A", "'Mustn't' được dùng để diễn tả sự cấm đoán (prohibition). 'Don't have to' chỉ mang nghĩa không bắt buộc.", 10, 2));
        qList1.add(buildTF4("Decide whether the following statements about English grammar are TRUE (T) or FALSE (F):",
                "a) 'Should' and 'ought to' are commonly used to give advice or opinions.",
                "b) 'Must' expresses personal obligation, while 'have to' is often used for external rules and laws.",
                "c) 'Don't have to' means that something is strictly prohibited and illegal.",
                "d) Cleft sentences starting with 'It is/was... that' are used to highlight a specific element of the sentence.",
                "T,T,F,T", "Detailed Explanation:\n" +
                "- a) TRUE: 'Should' / 'ought to' express recommendations or advice.\n" +
                "- b) TRUE: 'Must' expresses strong internal obligation, 'have to' expresses external regulation.\n" +
                "- c) FALSE: 'Don't have to' means not necessary (không cần thiết), whereas 'mustn't' means prohibited.\n" +
                "- d) TRUE: Câu chẻ 'It is/was ... that' nhấn mạnh thành phần câu (chủ ngữ, tân ngữ hoặc trạng ngữ).", 10, 3));
        qList1.add(buildShortAnswer("Supply the correct form of the word in bracket: 'Regular physical activity is essential for maintaining both physical and (HEALTH) ______ well-being.'",
                "healthy", "Cần một tính từ đứng trước danh từ 'well-being'. Dạng tính từ của 'health' là 'healthy'.", 10, 4));
        qList1.add(buildEssay("Write a short paragraph (80-120 words) explaining two practical ways parents and teenagers can overcome the generation gap.",
                "Parents and teenagers should actively communicate through daily family meals and respect each other's perspectives and privacy.",
                "Bareme and criteria:\n" +
                "1. Task achievement: Clearly state 2 practical solutions (e.g., active listening, spending quality time together, respecting privacy).\n" +
                "2. Coherence and cohesion: Good linking words (First, Second, Moreover, In addition).\n" +
                "3. Lexical resource: Accurate vocabulary related to family and generation gap (mutual understanding, open-mindedness, empathy).\n" +
                "4. Grammatical range: Proper use of modal verbs (should, ought to, must) and conditional structures.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Tiếng Anh 11] Đề thi số 01: Generation Gap, Health & Modals",
                "Đề kiểm tra 45 phút Unit 1 & 2 Tiếng Anh 11 Global Success / Friends Global.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Excessive emissions of greenhouse gases from factories and vehicles are the primary driver of ______ warming.",
                "global", "solar", "ocean", "lunar",
                "A", "Cụm danh từ cố định: 'global warming' (sự nóng lên toàn cầu).", 10, 1));
        qList2.add(buildMCQ("______ all the assignments before the deadline, Mark felt relieved and went out with his friends.",
                "Having completed", "Completing", "Completed", "Have completed",
                "A", "Dùng phân từ hoàn thành (Perfect Participle: 'Having + V3/ed') để nhấn mạnh một hành động đã hoàn tất trước một hành động khác trong quá khứ.", 10, 2));
        qList2.add(buildTF4("Statements regarding Participle Clauses and Environmental protection: True or False?",
                "a) Perfect participles (Having + past participle) emphasize that an action occurred prior to another action in the past.",
                "b) Deforestation reduces carbon dioxide absorption and accelerates global climate change.",
                "c) Fossil fuels like coal, oil, and gas are considered renewable clean energy sources.",
                "d) Using participle clauses allows writers to connect ideas seamlessly and avoid repetitive sentences.",
                "T,T,F,T", "Detailed Explanation:\n" +
                "- a) TRUE: 'Having finished...' emphasizes prior completion.\n" +
                "- b) TRUE: Cây xanh hấp thụ $CO_2$, việc chặt phá rừng làm giảm khả năng hấp thụ khí nhà kính.\n" +
                "- c) FALSE: Than đá, dầu mỏ và khí đốt là nhiên liệu hóa thạch không tái tạo (non-renewable).\n" +
                "- d) TRUE: Mệnh đề phân từ giúp câu văn cô đọng và liên kết mạch lạc hơn.", 10, 3));
        qList2.add(buildShortAnswer("Combine the two sentences using a Present Participle clause: 'Because she felt exhausted after the exam, Lan went straight to sleep.' -> '______ exhausted after the exam, Lan went straight to sleep.' (Write only the missing participle).",
                "Feeling", "Rút gọn mệnh đề chỉ nguyên nhân bằng hiện tại phân từ: 'Because she felt...' biến thành 'Feeling exhausted...'.", 10, 4));
        qList2.add(buildEssay("In 80-120 words, propose two practical actions that high school students can take every day to protect the environment and combat global warming.",
                "Students can reduce single-use plastic by carrying reusable water bottles and conserve energy by turning off unused electrical appliances.",
                "Bareme and criteria:\n" +
                "1. Content: Suggest 2 feasible student actions (e.g., using reusable containers, sorting recyclable waste, cycling/walking to school, planting trees).\n" +
                "2. Organization: Clear introductory sentence, body with supporting details, and a brief conclusion.\n" +
                "3. Grammar & Vocab: Correct usage of environmental vocabulary (carbon footprint, single-use plastics, energy conservation).", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Tiếng Anh 11] Đề thi số 02: Environment, Participles & Global Warming",
                "Đề kiểm tra 45 phút Unit 3 & 4 Tiếng Anh 11 về Môi trường và Mệnh đề phân từ.", 45, 70, qList2);
    }

    // ==========================================
    // 6. NGỮ VĂN (NGU_VAN - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedLiteratureGrade11Exams() {
        Course course = findOrCreateGrade11Course("NGU_VAN", "Ngữ Văn 11: Đọc Hiểu & Kỹ Năng Nghị Luận 9+", "Cô Sương Mai",
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                "Bí kíp làm chủ kỹ năng đọc hiểu văn bản hiện đại và viết đoạn nghị luận xã hội sắc sảo đạt điểm tối đa.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Phương thức biểu đạt chính trong một đoạn trích bàn về tầm quan trọng của lòng kiên trì và tinh thần trách nhiệm là:",
                "Nghị luận", "Tự sự", "Miêu tả", "Biểu cảm",
                "A", "Văn bản nghị luận sử dụng các lý lẽ, dẫn chứng và lập luận logic để thuyết phục người đọc về một tư tưởng, quan điểm xã hội.", 10, 1));
        qList1.add(buildMCQ("Tác dụng nổi bật nhất của biện pháp tu từ so sánh trong văn bản nghệ thuật là:",
                "Làm cho hình ảnh thêm cụ thể, sinh động và tăng sức gợi cảm",
                "Làm cho câu văn trở nên ngắn gọn và súc tích hơn",
                "Tạo sự cân xứng và nhịp điệu hài hòa cho câu văn",
                "Nhấn mạnh ý chí kiên định của nhân vật",
                "A", "Biện pháp so sánh đối chiếu hai đối tượng tương đồng giúp hình ảnh gợi cảm, cụ thể hóa các khái niệm trừu tượng.", 10, 2));
        qList1.add(buildTF4("Xét tính đúng/sai của các nhận định về kỹ năng viết đoạn văn nghị luận xã hội khoảng 200 chữ:",
                "a) Đoạn văn cần có câu mở đoạn nêu đúng và trúng vấn đề nghị luận theo yêu cầu của đề bài.",
                "b) Cần đưa ra ít nhất một dẫn chứng tiêu biểu, xác thực và thuyết phục từ đời sống thực tế.",
                "c) Thí sinh được phép tự do xuống dòng và thụt lề nhiều lần trong cùng một đoạn văn 200 chữ.",
                "d) Cần có phần liên hệ bản thân rút ra bài học nhận thức và hành động cụ thể ở cuối đoạn.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Mở đoạn trực tiếp nêu vấn đề để giám khảo nắm bắt ngay luận điểm.\n" +
                "- b) ĐÚNG: Dẫn chứng thực tế làm cho bài viết có sức thuyết phục, tránh lý thuyết suông.\n" +
                "- c) SAI: Quy chuẩn chấm thi của Bộ GD&ĐT quy định đoạn văn không được ngắt dòng thụt lề giữa chừng (chỉ viết một đoạn duy nhất).\n" +
                "- d) ĐÚNG: Bài học nhận thức và hành động là khâu then chốt khẳng định chiều sâu tư duy.", 10, 3));
        qList1.add(buildShortAnswer("Dung lượng chuẩn quy định cho đoạn văn nghị luận xã hội trong đề thi tốt nghiệp THPT mới là khoảng bao nhiêu chữ?",
                "200", "Quy định chuẩn của Bộ GD&ĐT: 'Viết một đoạn văn khoảng 200 chữ...'.", 10, 4));
        qList1.add(buildEssay("Viết một đoạn văn ngắn (khoảng 150 - 200 chữ) bàn về ý nghĩa của tinh thần tự lập đối với giới trẻ trong thời đại ngày nay.",
                "Tinh thần tự lập giúp thế hệ trẻ chủ động đối mặt với thử thách, tự giác tích lũy tri thức, trưởng thành và không ỷ lại vào người khác.",
                "Bareme chấm điểm chi tiết (Đoạn văn 200 chữ):\n" +
                "1. Hình thức đoạn văn (1.0đ): Đảm bảo đúng cấu trúc đoạn (không ngắt dòng), dung lượng 150-200 chữ, diễn đạt mạch lạc, không sai chính tả.\n" +
                "2. Xác định đúng vấn đề nghị luận (0.5đ): Ý nghĩa của tinh thần tự lập đối với tuổi trẻ.\n" +
                "3. Triển khai luận điểm (2.5đ):\n" +
                "   - Giải thích: Tự lập là khả năng tự suy nghĩ, tự quyết định và tự chịu trách nhiệm về cuộc đời mình mà không dựa dẫm, ỷ lại.\n" +
                "   - Ý nghĩa: Rèn luyện bản lĩnh, tôi luyện ý chí; giúp con người làm chủ vận mệnh, dễ dàng thích nghi với biến đổi của xã hội hiện đại.\n" +
                "   - Dẫn chứng: Các tấm gương bạn trẻ vừa học vừa làm, tự khởi nghiệp sáng tạo.\n" +
                "   - Phản đề & Bài học: Phê phán lối sống thụ động, 'cậu ấm cô chiêu'; rút ra bài học hành động cho bản thân.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Ngữ Văn 11] Đề thi số 01: Đọc hiểu Văn bản & Kỹ năng Viết đoạn Nghị luận Xã hội",
                "Đề kiểm tra định kỳ 45 phút Ngữ Văn 11 phần Đọc hiểu và Viết đoạn văn 200 chữ.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Yếu tố nào sau đây là đặc trưng cốt lõi tạo nên giá trị và sức hấp dẫn của thể loại thơ trữ tình?",
                "Tình cảm, cảm xúc và thế giới nội tâm của chủ thể trữ tình",
                "Cốt truyện ly kỳ và xung đột gay cấn giữa các nhân vật",
                "Hệ thống số liệu thống kê chính xác và lập luận sắc sảo",
                "Sự chi tiết trong miêu tả bối cảnh lịch sử thời đại",
                "A", "Thơ trữ tình là tiếng nói của cảm xúc, rung động sâu kín của tâm hồn trước cuộc đời.", 10, 1));
        qList2.add(buildMCQ("Khi xây dựng nhân vật văn học, phương diện nào thể hiện sâu sắc nhất thế giới nội tâm và sự phát triển tính cách của nhân vật?",
                "Diễn biến tâm lý, độc thoại nội tâm và chiều sâu suy nghĩ",
                "Trang phục và cách bài trí nơi ở của nhân vật",
                "Gia thế và xuất thân dòng họ của nhân vật",
                "Tuổi tác và nghề nghiệp của nhân vật",
                "A", "Diễn biến tâm lý và thế giới nội tâm là chìa khóa then chốt phản ánh chiều sâu tư tưởng và nhân cách.", 10, 2));
        qList2.add(buildTF4("Xét các nhận định về phong trào Thơ mới (1932 - 1945) trong nền văn học hiện đại Việt Nam:",
                "a) Phong trào Thơ mới đánh dấu cuộc cách mạng thi ca, khẳng định và giải phóng cái Tôi cá nhân đầy cá tính.",
                "b) Nhà thơ Xuân Diệu được Hoài Thanh tôn vinh là 'nhà thơ mới nhất trong các nhà thơ mới'.",
                "c) Thơ mới hoàn toàn tuân thủ niêm luật chặt chẽ, đối ngẫu nghiêm ngặt của thơ Đường luật cổ điển.",
                "d) Đằng sau nỗi buồn sầu, cô đơn của Thơ mới là tình yêu quê hương đất nước tha thiết, thầm kín.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: 'Chưa bao giờ người ta thấy một thời đại phong phú như thời đại này trong lịch sử thi ca Việt Nam' (Hoài Thanh).\n" +
                "- b) ĐÚNG: Xuân Diệu mang đến làn gió cảm xúc nồng nàn, tươi trẻ và quan niệm thẩm mỹ hiện đại.\n" +
                "- c) SAI: Thơ mới đập vỡ các khuôn mẫu niêm luật gò bó của thơ Đường để giải phóng cảm xúc tự do.\n" +
                "- d) ĐÚNG: Lòng yêu tiếng Việt, yêu cảnh sắc thiên nhiên non sông chính là biểu hiện kín đáo của lòng yêu nước.", 10, 3));
        qList2.add(buildShortAnswer("Điền tên tác giả bài thơ 'Đây thôn Vĩ Dạ' - kiệt tác thơ trữ tình trong phong trào Thơ mới Việt Nam:",
                "Hàn Mặc Tử", "'Đây thôn Vĩ Dạ' là thi phẩm xuất sắc bậc nhất của nhà thơ Hàn Mặc Tử viết về xứ Huế mộng mơ.", 10, 4));
        qList2.add(buildEssay("Nêu cảm nhận ngắn gọn (khoảng 150 chữ) về khát vọng giao cảm mãnh liệt với thiên nhiên và trần thế của nhà thơ Xuân Diệu qua bài thơ 'Vội vàng'.",
                "Xuân Diệu tha thiết với cuộc sống trần thế, coi thiên nhiên là thiên đường trên mặt đất, muốn níu giữ thời gian tuổi trẻ bằng tất cả giác quan nồng nàn.",
                "Bareme chấm điểm:\n" +
                "1. Ý tưởng trọng tâm: Khát vọng táo bạo muốn 'tắt nắng', 'buộc gió' để giữ lại vẻ đẹp tươi trẻ của sắc màu và hương hoa.\n" +
                "2. Cảm quan thẩm mỹ mới mẻ: Coi con người tuổi trẻ là chuẩn mực cao nhất của cái đẹp vũ trụ ('Tháng giêng ngon như một cặp môi gần').\n" +
                "3. Triết lý nhân sinh: Sống vội vàng, cuống quýt, dâng hiến và tận hưởng từng khoảnh khắc thanh xuân vô giá.", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Ngữ Văn 11] Đề thi số 02: Thơ Trữ tình & Nghệ thuật Xây dựng Nhân vật Văn học",
                "Đề kiểm tra 45 phút chuyên đề Thơ mới và Văn học hiện đại Ngữ Văn 11.", 45, 70, qList2);
    }

    // ==========================================
    // 7. LỊCH SỬ (LICH_SU - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedHistoryGrade11Exams() {
        Course course = findOrCreateGrade11Course("LICH_SU", "Lịch Sử 11: Cách Mạng Thế Giới & Quá Trình Hội Nhập", "Thầy Đỗ Cao Thắng",
                "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
                "Hệ thống hóa toàn bộ các mốc lịch sử cận hiện đại lớp 11: từ các cuộc cách mạng tư sản đến quá trình liên kết ASEAN.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Bản Tuyên ngôn Độc lập năm 1776 của Hợp chúng quốc Hoa Kỳ do ai là tác giả chính soạn thảo?",
                "Thomas Jefferson", "George Washington", "Benjamin Franklin", "Abraham Lincoln",
                "A", "Thomas Jefferson là người soạn thảo bản Tuyên ngôn Độc lập được Đại hội đại biểu 13 bang thông qua ngày 4/7/1776 tại Philadelphia.", 10, 1));
        qList1.add(buildMCQ("Cuộc cách mạng nào sau đây được đánh giá là cuộc cách mạng tư sản triệt để nhất thời kỳ cận đại?",
                "Cách mạng tư sản Pháp (1789)", "Cách mạng tư sản Anh (1642)",
                "Chiến tranh giành độc lập 13 thuộc địa Anh ở Bắc Mỹ", "Cách mạng Hà Lan (thế kỷ XVI)",
                "A", "Cách mạng Pháp 1789 đã lật đổ hoàn toàn chế độ phong kiến, giải quyết vấn đề ruộng đất cho nông dân và thiết lập nền cộng hòa dân chủ.", 10, 2));
        qList1.add(buildTF4("Xét tính đúng/sai của các nhận định sau về các cuộc cách mạng tư sản thời cận đại:",
                "a) Động lực sâu xa là giải phóng sức sản xuất tư bản chủ nghĩa khỏi quan hệ phong kiến lỗi thời.",
                "b) Cuộc Cách mạng công nghiệp lần thứ nhất khởi đầu tại nước Anh vào giữa thế kỷ XVIII.",
                "c) Động cơ hơi nước do James Watt cải tiến đóng vai trò là phát minh mở đầu cuộc cách mạng công nghiệp.",
                "d) Kết quả của các cuộc cách mạng tư sản chỉ phục vụ và mang lại lợi ích duy nhất cho giai cấp nông dân.",
                "T,T,T,F", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Lực lượng sản xuất tư bản chủ nghĩa phát triển mâu thuẫn sâu sắc với thể chế phong kiến chuyên chế.\n" +
                "- b) ĐÚNG: Nước Anh hội tụ đầy đủ vốn, nhân công và kỹ thuật nên cách mạng công nghiệp nổ ra đầu tiên tại Anh từ ngành dệt.\n" +
                "- c) ĐÚNG: Máy hơi nước James Watt (1784) tạo ra nguồn động lực vô tận, thay thế sức kéo cơ bắp và sức nước.\n" +
                "- d) SAI: Cách mạng tư sản đem lại quyền lực kinh tế và chính trị chủ yếu cho giai cấp tư sản; quần chúng nhân dân chưa được hưởng đầy đủ quyền lợi.", 10, 3));
        qList1.add(buildShortAnswer("Năm nổ ra cuộc Cách mạng tư sản Pháp với sự kiện nhân dân tấn công phá ngục Bastille là năm nào?",
                "1789", "Ngày 14/7/1789, nhân dân Paris nổi dậy chiếm ngục Bastille - biểu tượng của chế độ phong kiến chuyên chế, mở đầu cách mạng Pháp.", 10, 4));
        qList1.add(buildEssay("Phân tích ý nghĩa lịch sử sâu rộng của cuộc Cách mạng tư sản Pháp năm 1789 đối với nước Pháp và thế giới cận đại.",
                "Lật đổ chế độ phong kiến chuyên chế, đưa giai cấp tư sản lên nắm quyền, mở đường cho CNTB phát triển; lan tỏa tư tưởng 'Tự do - Bình đẳng - Bác ái' ra toàn châu Âu.",
                "Bareme chấm điểm chi tiết:\n" +
                "1. Đối với nước Pháp:\n" +
                "   - Lật đổ hoàn toàn chế độ quân chủ chuyên chế ngàn năm, trừng trị quý tộc phong kiến phản động.\n" +
                "   - Xóa bỏ tàn dư phong kiến, giải quyết một phần ruộng đất cho nông dân, mở đường cho nền kinh tế TBCN phát triển mạnh mẽ.\n" +
                "2. Đối với thế giới:\n" +
                "   - Tấn công mạnh mẽ vào thành trì phong kiến châu Âu, làm lung lay trật tự phong kiến khắp lục địa.\n" +
                "   - Tuyên ngôn Nhân quyền và Dân quyền nêu cao khẩu hiệu tiến bộ 'Tự do - Bình đẳng - Bác ái', cổ vũ phong trào đấu tranh dân chủ giải phóng dân tộc trên toàn thế giới.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Lịch Sử 11] Đề thi số 01: Cách mạng Tư sản & Sự xác lập Chủ nghĩa Tư bản",
                "Đề kiểm tra 45 phút chương Các cuộc cách mạng tư sản thời cận đại Lịch sử 11.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Hiệp hội các quốc gia Đông Nam Á (ASEAN) được thành lập vào ngày 8 tháng 8 năm nào tại Bangkok (Thái Lan)?",
                "1967", "1975", "1986", "1995",
                "A", "Ngày 8/8/1967, Tuyên bố Bangkok được ký kết bởi ngoại trưởng 5 nước sáng lập, khai sinh ra ASEAN.", 10, 1));
        qList2.add(buildMCQ("Trụ sở chính của Ban Thư ký Hiệp hội các quốc gia Đông Nam Á (ASEAN) hiện nay đặt tại thành phố nào?",
                "Jakarta (Indonesia)", "Bangkok (Thái Lan)", "Singapore", "Kuala Lumpur (Malaysia)",
                "A", "Trụ sở Ban Thư ký ASEAN được đặt tại thủ đô Jakarta của Indonesia.", 10, 2));
        qList2.add(buildTF4("Xét các nhận định lịch sử về tổ chức Hiệp hội các quốc gia Đông Nam Á (ASEAN):",
                "a) 5 quốc gia sáng lập ASEAN gồm: Indonesia, Malaysia, Philippines, Singapore và Thái Lan.",
                "b) Việt Nam chính thức được kết nạp làm thành viên thứ 7 của ASEAN vào ngày 28/7/1995.",
                "c) Nguyên tắc hoạt động cơ bản nhất của ASEAN là can thiệp quân sự vào công việc nội bộ của các quốc gia thành viên.",
                "d) Cộng đồng ASEAN (AC) chính thức được tuyên bố thành lập vào ngày 31/12/2015.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: 5 nước ký Tuyên bố Bangkok năm 1967.\n" +
                "- b) ĐÚNG: Ngày 28/7/1995 tại Hội nghị Ngoại trưởng ASEAN lần thứ 28 tại Brunei, Việt Nam chính thức gia nhập.\n" +
                "- c) SAI: Nguyên tắc cốt lõi của ASEAN là 'Không can thiệp vào công việc nội bộ của nhau' và 'Đồng thuận'.\n" +
                "- d) ĐÚNG: Cộng đồng ASEAN thành lập 31/12/2015 với 3 trụ cột vững chắc.", 10, 3));
        qList2.add(buildShortAnswer("Năm Việt Nam chính thức gia nhập và trở thành thành viên thứ 7 của tổ chức ASEAN là năm nào?",
                "1995", "Việt Nam gia nhập ASEAN vào ngày 28/7/1995.", 10, 4));
        qList2.add(buildEssay("Trình bày những thời cơ và thách thức đối với Việt Nam khi tham gia hội nhập sâu rộng vào Cộng đồng ASEAN.",
                "Thời cơ: Mở rộng thị trường xuất khẩu, thu hút vốn FDI, học hỏi kinh nghiệm, nâng cao vị thế ngoại giao. Thách thức: Cạnh tranh kinh tế gay gắt, nguy cơ tụt hậu công nghệ, áp lực bảo vệ an ninh quốc gia và giữ gìn bản sắc.",
                "Bareme chấm điểm:\n" +
                "1. Thời cơ (Cơ hội):\n" +
                "   - Mở rộng thị trường xuất nhập khẩu hàng hóa với thuế quan ưu đãi trong khu vực thương mại tự do AFTA.\n" +
                "   - Thu hút dòng vốn đầu tư trực tiếp nước ngoài (FDI) và tiếp thu khoa học công nghệ, kinh nghiệm quản lý tiên tiến.\n" +
                "   - Nâng cao uy tín, vị thế và tiếng nói ngoại giao của Việt Nam trên trường quốc tế.\n" +
                "2. Thách thức:\n" +
                "   - Sức ép cạnh tranh gay gắt từ hàng hóa và doanh nghiệp các nước trong khối có trình độ phát triển cao hơn.\n" +
                "   - Nguy cơ tụt hậu kinh tế nếu không kịp thời đổi mới mô hình tăng trưởng và nâng cao chất lượng nguồn nhân lực.\n" +
                "   - Vấn đề giữ gìn bản sắc văn hóa dân tộc và đối phó với các thách thức an ninh phi truyền thống (ô nhiễm môi trường, tội phạm xuyên quốc gia).", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Lịch Sử 11] Đề thi số 02: Quá trình Hình thành & Phát triển của Hiệp hội ASEAN",
                "Đề kiểm tra 45 phút chuyên đề Quá trình phát triển của ASEAN Lịch sử 11.", 45, 70, qList2);
    }

    // ==========================================
    // 8. ĐỊA LÝ (DIA_LY - LỚP 11) - 2 ĐỀ THI
    // ==========================================
    private void seedGeographyGrade11Exams() {
        Course course = findOrCreateGrade11Course("DIA_LY", "Địa Lý 11: Địa Lý Kinh Tế - Xã Hội Thế Giới", "Cô Bùi Thị Thanh",
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
                "Chương trình Địa lý kinh tế 11 chuẩn sách giáo khoa mới: Toàn cầu hóa, Mỹ Latinh, Liên minh châu Âu EU và Đông Nam Á.");
        List<Lesson> lessons = ensureCourseLessons(course);

        // Đề 1
        List<QuizQuestion> qList1 = new ArrayList<>();
        qList1.add(buildMCQ("Biểu hiện rõ nét nhất của xu hướng toàn cầu hóa kinh tế thế giới hiện nay là:",
                "Thương mại quốc tế tăng trưởng vượt bậc và dòng vốn đầu tư xuyên quốc gia bùng nổ",
                "Các quốc gia hoàn toàn xóa bỏ biên giới lãnh thổ quốc gia",
                "Mọi quốc gia trên thế giới sử dụng chung một loại tiền tệ duy nhất",
                "Chênh lệch trình độ phát triển giữa các nước giàu và nghèo hoàn toàn biến mất",
                "A", "Toàn cầu hóa kinh tế biểu hiện qua thương mại thế giới phát triển nhanh, tài chính quốc tế và các công ty xuyên quốc gia (TNCs) giữ vai trò chủ đạo.", 10, 1));
        qList1.add(buildMCQ("Kênh đào Panama là tuyến đường thủy nhân tạo quan trọng cắt ngang eo đất Trung Mỹ, nối liền hai đại dương nào?",
                "Thái Bình Dương và Đại Tây Dương", "Đại Tây Dương và Ấn Độ Dương",
                "Thái Bình Dương và Bắc Băng Dương", "Ấn Độ Dương và Nam Băng Dương",
                "A", "Kênh đào Panama nối liền Thái Bình Dương với Đại Tây Dương, rút ngắn hàng vạn dặm hải trình vòng qua Nam Mỹ.", 10, 2));
        qList1.add(buildTF4("Xét các nhận định về đặc điểm kinh tế - xã hội khu vực Mỹ Latinh: Đúng hay Sai?",
                "a) Khu vực Mỹ Latinh sở hữu nguồn tài nguyên khoáng sản kim loại và dầu khí phong phú.",
                "b) Tỉ lệ dân cư sống ở đô thị của Mỹ Latinh rất cao, nhưng chủ yếu là đô thị hóa tự phát do di dân nông thôn nghèo đói.",
                "c) Sự chênh lệch giàu nghèo và phân hóa xã hội ở khu vực Mỹ Latinh thuộc hàng thấp nhất trên thế giới.",
                "d) Rừng mưa nhiệt đới Amazon có vai trò đặc biệt quan trọng trong việc bảo tồn đa dạng sinh học và điều hòa khí hậu toàn cầu.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: Nổi tiếng với trữ lượng quặng sắt, đồng, bauxite, dầu mỏ (Venezuela, Mexico, Brazil).\n" +
                "- b) ĐÚNG: Đô thị hóa tự phát dẫn tới các khu ổ chuột (favelas), thất nghiệp và tệ nạn xã hội.\n" +
                "- c) SAI: Mỹ Latinh là khu vực có mức độ bất bình đẳng và phân hóa giàu nghèo cao nhất thế giới.\n" +
                "- d) ĐÚNG: Rừng Amazon là bể chứa carbon và lá phổi xanh của Trái Đất.", 10, 3));
        qList1.add(buildShortAnswer("Rừng mưa nhiệt đới lớn nhất hành tinh nằm ở lưu vực con sông nào tại khu vực Nam Mỹ? Điền tên sông ngắn gọn.",
                "Amazon|A-ma-dôn", "Rừng Amazon nằm trong lưu vực sông Amazon - con sông có lưu lượng nước lớn nhất thế giới.", 10, 4));
        qList1.add(buildEssay("Phân tích nguyên nhân và những hậu quả tiêu cực của hiện tượng đô thị hóa tự phát ở khu vực Mỹ Latinh đối với kinh tế và xã hội.",
                "Nguyên nhân: Người dân nông thôn không có ruộng đất di cư lên thành phố tìm kiếm việc làm; công nghiệp hóa không theo kịp tốc độ tăng dân số đô thị. Hậu quả: Thất nghiệp, khu ổ chuột, quá tải hạ tầng giao thông y tế giáo dục, ô nhiễm môi trường.",
                "Bareme chấm điểm:\n" +
                "1. Nguyên nhân:\n" +
                "   - Chế độ chiếm hữu ruộng đất phong kiến nặng nề khiến người nông dân nghèo mất đất canh tác.\n" +
                "   - Luồng di dân ồ ạt từ nông thôn đổ về các đại đô thị tìm việc làm trong khi các ngành công nghiệp đô thị chưa đủ năng lực hấp thụ lao động.\n" +
                "2. Hậu quả tiêu cực:\n" +
                "   - Xã hội: Tỉ lệ thất nghiệp cao, gia tăng tình trạng phân hóa giàu nghèo gay gắt, bùng nổ các khu nhà ổ chuột nhếch nhác, tội phạm gia tăng.\n" +
                "   - Hạ tầng & Đời sống: Quá tải trầm trọng hệ thống cấp thoát nước, giao thông, trường học và bệnh viện.\n" +
                "   - Môi trường: Ô nhiễm nguồn nước, không khí và rác thải sinh hoạt đô thị không được xử lý triệt để.", 10, 5));

        createQuizIfNotExists(lessons.get(0), "[Địa Lý 11] Đề thi số 01: Toàn cầu hóa kinh tế & Khu vực Mỹ Latinh",
                "Đề kiểm tra 45 phút chuyên đề Toàn cầu hóa và Khu vực Mỹ Latinh Địa lý 11.", 45, 70, qList1);

        // Đề 2
        List<QuizQuestion> qList2 = new ArrayList<>();
        qList2.add(buildMCQ("Nguyên tắc cốt lõi của 'Thị trường chung châu Âu' trong Liên minh châu Âu (EU) là sự tự do lưu thông của 4 yếu tố nào?",
                "Hàng hóa, dịch vụ, con người và tiền tệ",
                "Hàng hóa, vũ khí, khoáng sản và tài nguyên",
                "Con người, văn hóa, ngôn ngữ và quân sự",
                "Công nghệ, giáo dục, tôn giáo và chính trị",
                "A", "Thị trường chung EU dựa trên 4 quyền tự do cơ bản: Tự do lưu thông hàng hóa, dịch vụ, tiền tệ và con người.", 10, 1));
        qList2.add(buildMCQ("Ngành nông nghiệp trồng trọt truyền thống giữ vị trí chủ đạo trong đời sống kinh tế của đa số cư dân Đông Nam Á là:",
                "Trồng lúa nước", "Trồng lúa mì", "Trồng củ cải đường", "Trồng nho và ô liu",
                "A", "Đông Nam Á có khí hậu nhiệt đới gió mùa nóng ẩm, mạng lưới sông ngòi dày đặc phù hợp nhất cho nền văn minh lúa nước.", 10, 2));
        qList2.add(buildTF4("Xét các khẳng định sau về Liên minh châu Âu (EU) và khu vực Đông Nam Á: Nhận định đúng/sai:",
                "a) Liên minh châu Âu (EU) là một trong những trung tâm kinh tế, tài chính và thương mại hàng đầu toàn cầu.",
                "b) Đồng Euro là đồng tiền chung được sử dụng chính thức trong tất cả các nước thuộc khu vực đồng tiền chung Eurozone.",
                "c) Tất cả 11 quốc gia trong khu vực Đông Nam Á đều có đường bờ biển dài tiếp giáp đại dương.",
                "d) Vị trí cầu nối giữa Ấn Độ Dương và Thái Bình Dương mang lại cho Đông Nam Á tiềm năng to lớn về phát triển kinh tế biển và giao thương quốc tế.",
                "T,T,F,T", "Lời giải chi tiết:\n" +
                "- a) ĐÚNG: EU đóng góp tỉ trọng lớn trong GDP và thương mại quốc tế.\n" +
                "- b) ĐÚNG: Euro là đồng tiền chung biểu trưng cho hội nhập tiền tệ sâu sắc của EU.\n" +
                "- c) SAI: Quốc gia Lào là quốc gia duy nhất ở Đông Nam Á không giáp biển (nội lục).\n" +
                "- d) ĐÚNG: Nằm trên con đường hàng hải tấp nập bậc nhất qua eo biển Malacca.", 10, 3));
        qList2.add(buildShortAnswer("Quốc gia duy nhất trong 11 nước thuộc khu vực Đông Nam Á hoàn toàn không có đường bờ biển giáp đại dương là nước nào?",
                "Lào|Laos", "Nước Cộng hòa Dân chủ Nhân dân Lào là quốc gia nội lục duy nhất ở Đông Nam Á không giáp biển.", 10, 4));
        qList2.add(buildEssay("Trình bày ý nghĩa vị trí địa lý của khu vực Đông Nam Á và phân tích những thuận lợi của vị trí đó đối với sự phát triển kinh tế - xã hội.",
                "Vị trí: Cầu nối giữa châu Á và châu Đại Dương, ngã tư đường hàng hải và hàng không quốc tế giữa Ấn Độ Dương và Thái Bình Dương. Thuận lợi: Giao lưu thương mại quốc tế thuận tiện, phát triển kinh tế biển, thu hút đầu tư nước ngoài.",
                "Bareme chấm điểm chi tiết:\n" +
                "1. Đặc điểm vị trí địa lý:\n" +
                "   - Nằm ở phía Đông Nam châu Á, tiếp giáp Thái Bình Dương và Ấn Độ Dương.\n" +
                "   - Là cầu nối giữa lục địa Á - Âu với lục địa Australia; ngã tư giao thoa của các tuyến hàng hải quốc tế huyết mạch (eo biển Malacca).\n" +
                "2. Thuận lợi đối với phát triển kinh tế - xã hội:\n" +
                "   - Giao thương kinh tế quốc tế: Dễ dàng kết nối với các nền kinh tế lớn (Trung Quốc, Nhật Bản, Ấn Độ, Mỹ...).\n" +
                "   - Phát triển kinh tế biển: Đánh bắt, nuôi trồng hải sản, khai thác dầu khí thềm lục địa, du lịch biển đảo và vận tải hàng hải.\n" +
                "   - Khí hậu nhiệt đới ẩm: Thuận lợi phát triển nền nông nghiệp nhiệt đới trù phú và đa dạng các loại cây công nghiệp (cao su, cà phê, cọ dầu).", 10, 5));

        createQuizIfNotExists(lessons.get(1), "[Địa Lý 11] Đề thi số 02: Liên minh Châu Âu (EU) & Khu vực Đông Nam Á",
                "Đề kiểm tra 45 phút chuyên đề Liên minh châu Âu EU và Khu vực Đông Nam Á Địa lý 11.", 45, 70, qList2);
    }

    private void seedRealStudents() {
        if (userRepository.countByRole(Role.ROLE_STUDENT) <= 1) {
            log.info("Seeding real students with enrolled courses...");
            List<Course> courses = courseRepository.findAll();
            if (courses.isEmpty()) return;

            List<User> students = List.of(
                    User.builder()
                            .email("nguyenminhanh@gmail.com")
                            .fullName("Nguyễn Minh Anh")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0912345678")
                            .gradeLevel(12)
                            .schoolName("THPT Chuyên Hà Nội - Amsterdam")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("lequanghuy@gmail.com")
                            .fullName("Lê Quang Huy")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0987654321")
                            .gradeLevel(12)
                            .schoolName("THPT Chuyên Lê Hồng Phong (TP.HCM)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("tranmaiphuong@gmail.com")
                            .fullName("Trần Mai Phương")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0905123456")
                            .gradeLevel(11)
                            .schoolName("THPT Chu Văn An (Hà Nội)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("phamhoangnam@gmail.com")
                            .fullName("Phạm Hoàng Nam")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0978901234")
                            .gradeLevel(12)
                            .schoolName("THPT Kim Liên (Hà Nội)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("vuhaianh@gmail.com")
                            .fullName("Vũ Hải Anh")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0934567890")
                            .gradeLevel(10)
                            .schoolName("THPT Chuyên Lam Sơn (Thanh Hóa)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("doanducmanh@gmail.com")
                            .fullName("Đoàn Đức Mạnh")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0961234567")
                            .gradeLevel(12)
                            .schoolName("THPT Chuyên Phan Bội Châu (Nghệ An)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("nguyenthutrang@gmail.com")
                            .fullName("Nguyễn Thu Trang")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0945678901")
                            .gradeLevel(11)
                            .schoolName("THPT Gia Định (TP.HCM)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("buiducdung@gmail.com")
                            .fullName("Bùi Đức Dũng")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0918765432")
                            .gradeLevel(10)
                            .schoolName("THPT Nguyễn Thượng Hiền (TP.HCM)")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80")
                            .build(),
                    User.builder()
                            .email("hoangthaochi@gmail.com")
                            .fullName("Hoàng Thảo Chi")
                            .password(passwordEncoder.encode("student123"))
                            .phone("0923456789")
                            .gradeLevel(12)
                            .schoolName("THPT Chuyên Sư Phạm Hà Nội")
                            .role(Role.ROLE_STUDENT)
                            .active(true)
                            .avatarUrl("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80")
                            .build()
            );

            List<User> savedStudents = userRepository.saveAll(students);

            // Enroll each student into 1 to 3 relevant courses
            List<UserCourseEnrollment> enrollments = new ArrayList<>();
            for (int i = 0; i < savedStudents.size(); i++) {
                User s = savedStudents.get(i);
                Course c1 = courses.get(i % courses.size());
                enrollments.add(UserCourseEnrollment.builder()
                        .userId(s.getId())
                        .userEmail(s.getEmail())
                        .courseId(c1.getId())
                        .courseTitle(c1.getTitle())
                        .activationCode("ACT-" + s.getId() + "-01")
                        .activatedAt(Instant.now().minus(i * 3 + 2, ChronoUnit.DAYS))
                        .expiresAt(Instant.now().plus(360, ChronoUnit.DAYS))
                        .progressPercent((i * 17) % 100)
                        .build());

                if (i % 2 == 0) {
                    Course c2 = courses.get((i + 2) % courses.size());
                    enrollments.add(UserCourseEnrollment.builder()
                            .userId(s.getId())
                            .userEmail(s.getEmail())
                            .courseId(c2.getId())
                            .courseTitle(c2.getTitle())
                            .activationCode("ACT-" + s.getId() + "-02")
                            .activatedAt(Instant.now().minus(i * 2 + 5, ChronoUnit.DAYS))
                            .expiresAt(Instant.now().plus(360, ChronoUnit.DAYS))
                            .progressPercent((i * 23) % 100)
                            .build());
                }
            }

            enrollmentRepository.saveAll(enrollments);
            log.info("Seeded 9 real students with active course enrollments successfully.");
        }
    }

    private void updateRealVideoLessons() {
        List<String> realVideos = List.of(
                "https://www.youtube.com/watch?v=k5q6G6dG-dE",
                "https://www.youtube.com/watch?v=7u3Q5d4g3Uo",
                "https://www.youtube.com/watch?v=VYO4F8lA0XQ",
                "https://www.youtube.com/watch?v=d_Z_v86qLco",
                "https://www.youtube.com/watch?v=M7lc1UVf-VE"
        );

        List<Lesson> lessons = lessonRepository.findAll();
        boolean hasUpdates = false;
        for (Lesson lesson : lessons) {
            if (lesson.getVideoUrl() == null || lesson.getVideoUrl().contains("dQw4w9WgXcQ")) {
                int index = (lesson.getSortOrder() != null ? lesson.getSortOrder() : 1) % realVideos.size();
                lesson.setVideoUrl(realVideos.get(index));
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            lessonRepository.saveAll(lessons);
            log.info("Updated all lesson video URLs to genuine educational lecture videos.");
        }
    }

    private void seedGrade10PromoBanner() {
        boolean exists = bannerRepository.findAll().stream()
                .anyMatch(b -> b.getTitle() != null && (b.getTitle().contains("LỚP 10") || b.getTitle().contains("Lớp 10")));
        if (!exists) {
            Banner banner10 = Banner.builder()
                    .title("ƯU ĐÃI ĐẶC QUYỀN LỚP 10 - GIẢM 20% TOÀN BỘ KHÓA HỌC")
                    .subtitle("Chương trình Khởi đầu cấp 3 vững vàng dành riêng cho học sinh Lớp 10 (2k10). Tặng kèm trọn bộ đề cương ôn tập giữa kỳ, cuối kỳ và sơ đồ tư duy!")
                    .badge("GIẢM 20% LỚP 10")
                    .imageUrl("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80")
                    .actionText("Xem khóa học Lớp 10")
                    .actionLink("/courses?grade=10")
                    .sortOrder(0)
                    .isActive(true)
                    .build();
            bannerRepository.save(banner10);
            log.info("Seeded Grade 10 promo banner (-20% discount).");
        }
    }
}


