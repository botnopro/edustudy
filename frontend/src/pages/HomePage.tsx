import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import { contentApi } from '../api/contentApi';
import { categoryApi } from '../api/categoryApi';
import { Course, Teacher, Banner, FaqItem, Testimonial, Grade } from '../types';
import { CourseCard } from '../components/CourseCard';
import {
  KeyRound,
  Sparkles,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Flame,
  Percent,
  Gift,
  Tag
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('12');
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bData, cData, tData, fData, testData, gData] = await Promise.all([
          contentApi.getBanners(),
          courseApi.getCourses(),
          courseApi.getTeachers(),
          contentApi.getFaqs(),
          contentApi.getTestimonials(),
          categoryApi.getActiveGrades(),
        ]);
        setBanners(bData);
        setCourses(cData);
        setTeachers(tData);
        setFaqs(fData);
        setTestimonials(testData);
        setDynamicGrades(gData || []);
        if (gData && gData.length > 0) {
          // If default '12' is in active grades, use it; otherwise use the first active grade
          const has12 = gData.some((g) => g.code === '12' || g.code === 'LOP_12');
          if (!has12) {
            setSelectedGrade(gData[0].code);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const gradeCourses = courses.filter((c) => {
    if (selectedGrade === 'ALL') return true;
    const cleanFilterGrade = selectedGrade.replace('LOP_', '');
    const cleanCourseGrade = (c.grade || '').replace('LOP_', '');
    return cleanCourseGrade === cleanFilterGrade || c.grade === selectedGrade;
  });
  const activeBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24 overflow-hidden">
        
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nền tảng luyện thi trực tuyến thế hệ mới</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Chinh Phục Điểm 9+ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
                  Luyện Thi THPT
                </span> & Kỳ Thi ĐGNL
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {activeBanner?.subtitle ||
                  'Hệ thống luyện thi THPT Quốc Gia bám sát chương trình GDPT 2018 mới nhất cùng đội ngũ thủ khoa và chuyên gia hàng đầu Việt Nam.'}
              </p>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-102"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Mua ngay</span>
                </Link>

                <Link
                  to="/courses"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-2xl transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Xem tất cả khóa học</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100.000+ Học sinh theo học</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>15 Thủ khoa & Á khoa 2024-2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bảo hành kết quả thi cử</span>
                </div>
              </div>

            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 hover:bg-white/[0.13] transition-colors duration-300">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                      🔑
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Bạn đã có mã kích hoạt?</h4>
                      <p className="text-xs text-slate-300">Nhập mã để bắt đầu học ngay lập tức</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                    Cổng kích hoạt nhanh:
                  </label>
                  <Link
                    to="/active-course"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 border border-slate-700 transition-colors"
                  >
                    <span>Đi đến trang nhập mã kích hoạt...</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Link>
                </div>

                {/* Teacher Highlights Mini Grid */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Giáo viên tiêu biểu:
                  </div>
                  <div className="flex items-center -space-x-3 overflow-hidden">
                    {teachers.slice(0, 5).map((t) => (
                      <img
                        key={t.id}
                        src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={t.name}
                        title={t.name}
                        className="w-11 h-11 rounded-full border-2 border-slate-800 object-cover shadow-md"
                      />
                    ))}
                    <div className="w-11 h-11 rounded-full bg-primary/80 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      +{teachers.length}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 20% Discount Banner for Grade 10 Students */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-4">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500/50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-orange-500/10 text-white relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Info & Action */}
            <div className="lg:col-span-8 space-y-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                <span>Ưu đãi đặc quyền 2k10 • Giảm ngay 20%</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Khởi Đầu Cấp 3 Vững Vàng – <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                  Giảm 20% Toàn Bộ Khóa Học Lớp 10
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                Bứt phá điểm 9+ ngay từ năm học đầu tiên tại THPT! Chương trình bám sát 100% sách giáo khoa mới (Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo). Trang bị nền tảng vững chắc môn Toán, Lý, Hóa, Sinh, Anh cùng các thầy cô thủ khoa hàng đầu.
              </p>

              {/* Promo Perks */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>Giảm trực tiếp 20% khi thanh toán</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Gift className="w-4 h-4 text-rose-400" />
                  <span>Tặng trọn bộ đề cương & sơ đồ tư duy</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hỏi đáp 1:1 cùng trợ giảng 24/7</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => {
                    const grade10Code = dynamicGrades.find(g => g.code === '10' || g.code === 'LOP_10')?.code || '10';
                    setSelectedGrade(grade10Code);
                    const el = document.getElementById('course-showcase');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Săn ưu đãi 20% - Chọn môn Lớp 10</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/courses?grade=10"
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tất cả khóa học Lớp 10</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Discount Badge & Voucher Tag */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="w-full bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-2xl p-5 sm:p-6 text-center space-y-3.5 backdrop-blur-md">
                <div className="text-[11px] font-bold text-orange-300 uppercase tracking-widest">
                  MÃ GIẢM GIÁ ĐỘC QUYỀN
                </div>

                <div className="py-1">
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 tracking-tight">
                    -20%
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Áp dụng toàn bộ khóa Lớp 10
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-dashed border-orange-400/50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                    K10VIP20
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    TỰ ĐỘNG ÁP DỤNG
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">Toán 10</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">Vật Lý 10</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">Hóa Học 10</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">Tiếng Anh 10</span>
                </div>

                <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>89/100 suất đã kích hoạt hôm nay</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Grade Selector & Course Showcase */}
      <section id="course-showcase" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              Khóa học trọng tâm
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Chương Trình Luyện Thi Lớp 10 – 12
            </h2>
          </div>

          {/* Grade Tabs (Dynamically updated from Admin's active categories) */}
          <div className="flex flex-wrap gap-2">
            {dynamicGrades.length > 0
              ? dynamicGrades.map((tab) => (
                  <button
                    key={tab.id || tab.code}
                    onClick={() => setSelectedGrade(tab.code)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      selectedGrade === tab.code
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))
              : [
                  { id: '12', label: 'Lớp 12 - Luyện thi Đại Học' },
                  { id: '11', label: 'Lớp 11 - Vững nền tảng' },
                  { id: '10', label: 'Lớp 10 - Khởi đầu cấp 3' },
                  { id: 'DGNL', label: 'ĐGNL & TSA Bách Khoa' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGrade(tab.id)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      selectedGrade === tab.id
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gradeCourses.slice(0, 8).map((course, i) => (
            <div
              key={course.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <CourseCard
                course={course}
                onSelect={(c) => navigate(`/courses/${c.id}`)}
                onActivateDirectly={() => navigate(`/active-course?code=${course.id}`)}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-primary text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>Khám phá thêm các khóa học khác</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              Đội ngũ chuyên gia
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Thầy Cô Luyện Thi Top 1 Việt Nam
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Các chuyên gia, thủ khoa sư phạm, tác giả hàng chục cuốn sách luyện thi đại học kinh điển
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center hover:bg-white hover:shadow-lg transition-all"
              >
                <img
                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={t.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-3 shadow"
                />
                <h4 className="font-extrabold text-slate-900 text-base">{t.name}</h4>
                <p className="text-xs font-bold text-primary mt-0.5">{t.title}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              Học viên tiêu biểu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Học Sinh 9+ & Thủ Khoa Nói Gì Về Chúng Tôi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={test.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                      alt={test.studentName}
                      className="w-12 h-12 rounded-full object-cover border border-primary/20"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{test.studentName}</h4>
                      <p className="text-xs text-slate-500">{test.school}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-primary bg-orange-50 p-2 rounded-xl border border-orange-100 mb-2">
                    🎯 {test.score}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{test.content}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  {test.targetExam}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
