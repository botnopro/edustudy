import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { activationApi } from '../api/activationApi';
import { courseApi } from '../api/courseApi';
import { contentApi } from '../api/contentApi';
import { categoryApi } from '../api/categoryApi';
import { Course, Teacher, FaqItem, Testimonial, CodeCheckResponse, ActivationResponse, Grade, Subject } from '../types';
import { CourseCard } from '../components/CourseCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { ActivationSuccessModal } from '../components/ActivationSuccessModal';
import {
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  GraduationCap,
  PhoneCall,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const ActiveCoursePage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();

  // Activation Form State
  const [activationCode, setActivationCode] = useState('');
  const [checkInfo, setCheckInfo] = useState<CodeCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ActivationResponse | null>(null);

  // Courses, Teachers, FAQ, Testimonials State
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filter State
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  // Check code debounce
  useEffect(() => {
    if (!activationCode.trim() || activationCode.trim().length < 3) {
      setCheckInfo(null);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const info = await activationApi.checkCode(activationCode.trim());
        setCheckInfo(info);
        if (!info.valid) {
          setErrorMessage(info.statusMessage || 'Mã không hợp lệ');
        } else {
          setErrorMessage(null);
        }
      } catch (err: any) {
        setCheckInfo(null);
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [activationCode]);

  // Load public data (respects admin configured active categories)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cList, tList, fList, testList, gList, sList] = await Promise.all([
          courseApi.getCourses(),
          courseApi.getTeachers(),
          contentApi.getFaqs(),
          contentApi.getTestimonials(),
          categoryApi.getActiveGrades(),
          categoryApi.getActiveSubjects(),
        ]);
        setCourses(cList);
        setTeachers(tList);
        setFaqs(fList);
        setTestimonials(testList);
        setDynamicGrades(gList || []);
        setDynamicSubjects(sList || []);
      } catch (err) {
        console.error('Error fetching public data:', err);
      }
    };
    fetchData();
  }, []);

  // Handle Submit Activation
  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setErrorMessage('Vui lòng nhập mã kích hoạt');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await activationApi.activateCourse(activationCode.trim());
      setSuccessResult(res);
      setActivationCode('');
      setCheckInfo(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Kích hoạt khóa học không thành công');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses with normalized grade handling
  const filteredCourses = courses.filter((c) => {
    const cleanFilterGrade = selectedGrade.replace('LOP_', '');
    const cleanCourseGrade = (c.grade || '').replace('LOP_', '');
    const matchesGrade =
      selectedGrade === 'ALL' ||
      cleanCourseGrade === cleanFilterGrade ||
      c.grade === selectedGrade;

    const matchesSubject = selectedSubject === 'ALL' || c.subject === selectedSubject;
    return matchesGrade && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      
      {/* 1. HERO ACTIVATION SECTION */}
      <section className="relative bg-gradient-to-b from-orange-50/80 via-white to-slate-50 pt-10 pb-16 border-b border-slate-200/70 overflow-hidden">
        
        {/* Glow Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-primary/10 via-orange-200/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Cổng kích hoạt khóa học trực tuyến chính thức</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            KÍCH HOẠT KHÓA HỌC
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto mb-8">
            Lưu ý: mỗi khóa học chỉ cần kích hoạt một lần duy nhất
          </p>

          {/* Activation Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-10 max-w-2xl mx-auto text-left transition-all">
            <form onSubmit={handleActivateSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nhập mã kích hoạt của bạn
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã kích hoạt khóa học của bạn"
                    className="w-full text-base sm:text-lg font-bold tracking-wider px-5 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                  />
                  {isChecking && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mỗi mã kích hoạt là ngẫu nhiên và chỉ áp dụng <strong>01 lần cho 01 tài khoản</strong>. Sau khi kích hoạt thành công, mã sẽ tự động khóa.</span>
                </p>
              </div>

              {/* Instant Check Preview Banner */}
              {checkInfo && checkInfo.valid && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-emerald-900">Mã hợp lệ: </span>
                    <span>Mở khóa <strong>{checkInfo.courseTitle}</strong> ({checkInfo.teacherName})</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-101 hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>Kích hoạt ngay</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Helper notice */}
          <div className="mt-6 text-xs text-slate-500 max-w-lg mx-auto">
            Bạn có đơn hàng thanh toán thành công? Vui lòng kiểm tra email hoặc tin nhắn SMS để lấy mã kích hoạt khóa học.
          </div>

        </div>
      </section>

      {/* 2. THREE ACTIVATION STEPS */}
      <section id="steps" className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              3 BƯỚC KÍCH HOẠT KHÓA HỌC ĐƠN GIẢN
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Dễ dàng mở khóa toàn bộ bài giảng và tài liệu chỉ trong chưa đầy 30 giây
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                1
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Đăng Nhập Tài Khoản</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đăng nhập tài khoản học viên tại website học trực tuyến. Nếu chưa có tài khoản, hãy nhấn "Đăng ký" hoàn toàn miễn phí.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mb-4 shadow-md shadow-orange-500/20">
                2
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Nhập Mã Kích Hoạt</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập chính xác dãy ký tự mã kích hoạt (gồm 8-12 ký tự in hoa) nhận được từ email, SMS hoặc thẻ cào kèm theo sách.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Bắt Đầu Học Ngay</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhấn nút "Kích hoạt ngay". Khóa học sẽ tự động được lưu vào mục "Khóa học của tôi" và bạn có thể học ngay trên máy tính và app điện thoại.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. COURSES FOR GRADE 10 TO 12 & DGNL */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Chương trình ôn luyện THPT Quốc Gia chuẩn GDPT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Danh Sách Khóa Học Nổi Bật
            </h2>
          </div>

          {/* Grade Selector Tabs (Follows Admin's active grades) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl">
            <button
              onClick={() => setSelectedGrade('ALL')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                selectedGrade === 'ALL'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            {dynamicGrades.length > 0
              ? dynamicGrades.map((g) => (
                  <button
                    key={g.id || g.code}
                    onClick={() => setSelectedGrade(g.code)}
                    className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      selectedGrade === g.code
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g.name}
                  </button>
                ))
              : [
                  { id: '12', label: 'Lớp 12' },
                  { id: '11', label: 'Lớp 11' },
                  { id: '10', label: 'Lớp 10' },
                  { id: 'DGNL', label: 'ĐGNL' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGrade(tab.id)}
                    className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      selectedGrade === tab.id
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
          </div>
        </div>

        {/* Subject Filter Pills (Follows Admin's active subjects strictly) */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              selectedSubject === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả môn
          </button>
          {dynamicSubjects.map((subj) => (
            <button
              key={subj.id || subj.code}
              onClick={() => setSelectedSubject(subj.code)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedSubject === subj.code
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {subj.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={(c) => setSelectedCourse(c)}
                onActivateDirectly={(c) => {
                  setSelectedCourse(c);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Chưa có khóa học nào khớp với bộ lọc đã chọn.</p>
          </div>
        )}

      </section>

      {/* 4. TEACHERS SPOTLIGHT */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              Đội ngũ chuyên môn
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Giáo Viên Luyện Thi Hàng Đầu Việt Nam
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Các thầy cô là thủ khoa, giảng viên đại học, tác giả của những đầu sách luyện thi kinh điển
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="group bg-slate-50 rounded-3xl p-5 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-primary/30 transition-all text-center flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={t.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-primary text-white shadow">
                    {t.subject}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{t.name}</h4>
                <p className="text-xs text-primary font-bold mt-1 line-clamp-1">{t.title}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{t.bio}</p>
                
                <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex items-center justify-between text-xs text-slate-500">
                  <span>{t.experienceYears || 10}+ năm KN</span>
                  <span className="font-bold text-amber-500">★ {t.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS (Thủ khoa / Học sinh 9+) */}
      {testimonials.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              Thành tích học viên
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Gương Mặt Thủ Khoa & 9+ Tiêu Biểu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={test.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                      alt={test.studentName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{test.studentName}</h4>
                      <p className="text-xs text-slate-500">{test.school}</p>
                    </div>
                  </div>
                  <div className="mb-3 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-xs font-extrabold text-primary">
                    🎯 {test.score}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{test.content}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  {test.targetExam}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ SECTION */}
      {faqs.length > 0 && (
        <section id="faq" className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            <div className="text-center mb-10">
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Hỏi đáp trợ giúp
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Câu Hỏi Thường Gặp Về Kích Hoạt Khóa Học
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = activeFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-slate-800 text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 7. SUPPORT HOTLINE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">
              Cần hỗ trợ kích hoạt trực tiếp?
            </span>
            <h3 className="text-2xl font-black mt-1">
              Đội Ngũ Kỹ Thuật & Cố Vấn Học Tập Sẵn Sàng 24/7
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Nếu bạn không tìm thấy mã hoặc gặp sự cố khi kích hoạt, hãy gọi ngay hotline hoặc gửi tin nhắn để được hỗ trợ trong 5 phút.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <a
              href="tel:19006868"
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-102"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hotline 1900 6868</span>
            </a>
          </div>
        </div>
      </section>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onActivate={() => {
          setSelectedCourse(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Activation Success Modal */}
      <ActivationSuccessModal
        result={successResult}
        onClose={() => setSuccessResult(null)}
      />

    </div>
  );
};
