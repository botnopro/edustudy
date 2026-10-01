import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import { orderApi } from '../api/orderApi';
import { Course, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  KeyRound,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronRight,
  PhoneCall,
  Check,
  HelpCircle,
  Video,
  QrCode,
  Copy,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Loader2,
  X,
  Lock,
  FileText,
  ExternalLink,
  StickyNote,
  Download
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'teacher' | 'curriculum' | 'reviews' | 'related'>('info');

  // Preview Lesson (Bài giảng mẫu) state
  const [previewLessonModalOpen, setPreviewLessonModalOpen] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [previewNote, setPreviewNote] = useState('');

  // Checkout / Payment Modal state
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [checkoutTab, setCheckoutTab] = useState<'qr' | 'code' | 'consult'>('qr');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasNotifiedTransfer, setHasNotifiedTransfer] = useState(false);

  // Order state for logged in student
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [checkingOrderStatus, setCheckingOrderStatus] = useState(false);
  const [isOrderApproved, setIsOrderApproved] = useState(false);

  // Consultation Form state
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultSent, setConsultSent] = useState(false);

  // Open checkout and auto-create order
  const handleOpenCheckout = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập tài khoản học sinh trước khi thanh toán để hệ thống tự động duyệt bạn vào đúng lớp!');
      openAuthModal('login');
      return;
    }

    setShowConsultModal(true);
    setCheckoutTab('qr');
    setHasNotifiedTransfer(false);
    setIsOrderApproved(false);

    if (!course) return;

    setOrderLoading(true);
    try {
      const ord = await orderApi.createOrder({
        courseId: course.id,
        phone: user?.phone,
      });
      setCurrentOrder(ord);
      if (ord.status === 'PAID' || (ord.status as string) === 'COMPLETED') {
        setIsOrderApproved(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setOrderLoading(false);
    }
  };

  // Auto-polling trạng thái đơn hàng mỗi 3 giây qua SePay Webhook
  useEffect(() => {
    let intervalId: any;
    if (showConsultModal && currentOrder?.orderCode && !isOrderApproved) {
      intervalId = setInterval(async () => {
        try {
          const res = await orderApi.getOrderStatus(currentOrder.orderCode);
          if (res.status === 'PAID' || (res.status as string) === 'COMPLETED') {
            setIsOrderApproved(true);
            setCurrentOrder((prev) => (prev ? { ...prev, status: 'PAID' } : null));
            clearInterval(intervalId);
            setTimeout(() => {
              navigate('/my-courses');
            }, 2000);
          }
        } catch (err) {
          // ignore polling network errors
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showConsultModal, currentOrder?.orderCode, isOrderApproved, navigate]);

  // Tải ghi chú đã lưu (localStorage) cho bài học thử đang xem
  useEffect(() => {
    if (!previewLessonModalOpen || !course) return;
    const ls = course.lessons || [];
    const maxP = Math.min(2, Math.max(ls.length > 0 ? 1 : 0, Math.floor(ls.length * 0.2)));
    const pls = ls.slice(0, maxP);
    const lesson = pls[selectedPreviewIndex] || pls[0];
    if (!lesson) return;
    try {
      setPreviewNote(localStorage.getItem(`preview_note_${lesson.id}`) || '');
    } catch {
      setPreviewNote('');
    }
  }, [previewLessonModalOpen, selectedPreviewIndex, course]);

  // Check if order has been paid via SePay / Admin
  const handleCheckOrder = async () => {
    if (!currentOrder) return;
    setCheckingOrderStatus(true);
    try {
      const res = await orderApi.getOrderStatus(currentOrder.orderCode);
      if (res.status === 'PAID' || (res.status as string) === 'COMPLETED') {
        setIsOrderApproved(true);
        setCurrentOrder((prev) => (prev ? { ...prev, status: 'PAID' } : null));
        setTimeout(() => {
          navigate('/my-courses');
        }, 1500);
      } else {
        alert('Đơn hàng #' + currentOrder.orderCode + ' đang ở trạng thái: Đang chờ thanh toán. Hệ thống tự động kiểm tra mỗi 3 giây, bạn chỉ cần chuyển khoản theo đúng mã QR.');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setCheckingOrderStatus(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await courseApi.getCourseById(Number(id));
        setCourse(data);

        // Fetch related courses
        if (data) {
          const all = await courseApi.getCourses({ grade: data.grade });
          setRelatedCourses(all.filter((c) => c.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin khóa học này</h2>
        <p className="text-xs text-slate-500 mt-1">Khóa học có thể đã bị ẩn hoặc không tồn tại.</p>
        <Link
          to="/courses"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md transition hover:bg-primary-600"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const formatPrice = (p: number) => {
    if (!p || p === 0) return 'Liên Hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  const features = course.featuresList ? course.featuresList.split(';') : [];
  const lessons = course.lessons || [];

  // QUY TẮC BÀI GIẢNG MẪU: Tối đa 20% tổng số bài và tối đa không quá 2 bài
  const maxPreviewCount = Math.min(2, Math.max(lessons.length > 0 ? 1 : 0, Math.floor(lessons.length * 0.2)));
  const previewLessons = lessons.slice(0, maxPreviewCount);
  const currentPreviewLesson = previewLessons[selectedPreviewIndex] || previewLessons[0];

  const handleOpenPreviewLesson = (index: number) => {
    if (index >= maxPreviewCount) {
      alert(`Bài học số ${index + 1} thuộc nội dung chính thức của khóa học. Vui lòng bấm "Mua ngay" để mở khóa toàn bộ ${lessons.length} bài giảng và tài liệu!`);
      handleOpenCheckout();
      return;
    }
    setSelectedPreviewIndex(index);
    setPreviewLessonModalOpen(true);
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultPhone.trim()) return;
    setConsultSent(true);
    setTimeout(() => {
      setShowConsultModal(false);
      setConsultSent(false);
      setConsultName('');
      setConsultPhone('');
      alert('Đăng ký nhận tư vấn thành công! Bộ phận tư vấn viên sẽ liên hệ với bạn trong ít phút.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. TOP HERO BANNER (Styled like Edu Study: Dark overlay banner with book illustrations) */}
      <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-stone-900 text-white overflow-hidden py-10 sm:py-14 border-b border-slate-800">
        
        {/* Subtle patterned background decoration */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-white transition">Khóa học</Link>
            <span>/</span>
            <span className="text-orange-400 font-semibold truncate max-w-xs">{course.title}</span>
          </div>

          <div className="max-w-3xl space-y-3">
            {/* Tagline / Subtitle */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Khóa học trực tuyến</span>
              <span>&bull;</span>
              <span className="text-orange-300 font-bold">
                {course.grade === 'DGNL' ? 'ĐGNL / TSA' : `Lớp ${course.grade}`}
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              {course.title}
            </h1>

            {/* Teacher / Publisher Name in Orange */}
            <div className="text-sm font-extrabold text-primary pt-0.5">
              {course.teacherName || course.teacher?.name || 'EDU STUDY'}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-2xl line-clamp-3 pt-1">
              {course.description || 'Khóa học chất lượng cao bám sát chương trình Giáo dục phổ thông mới, tối ưu hóa điểm số và phát triển năng lực tư duy.'}
            </p>

            {/* Micro stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
                <span className="text-slate-400 font-normal">({course.studentCount || 1200} học viên)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>{course.totalLessons || lessons.length || 70} bài học</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{course.totalHours || 80} giờ học</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR (Thông tin | Giảng viên | Chương trình | Đánh giá | Khóa học liên quan) */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-1 scrollbar-none">
            {[
              { key: 'info', label: 'Thông tin' },
              { key: 'curriculum', label: `Chương trình (${lessons.length})` },
              { key: 'teacher', label: 'Giảng viên' },
              { key: 'reviews', label: 'Đánh giá' },
              { key: 'related', label: 'Khóa học liên quan' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 px-3 font-extrabold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-primary text-primary font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN BODY (Left content + Right sticky purchase box) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: TAB CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB: THÔNG TIN (Info) */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                
                {/* Information Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">
                      Thông tin khóa học
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                      <p className="font-semibold text-slate-900">
                        {course.title} được xây dựng nhằm đồng hành cùng học sinh trong giai đoạn đổi mới thi cử, khi đề thi tăng cường đánh giá năng lực, tư duy và khả năng vận dụng thực tiễn.
                      </p>
                      <p className="whitespace-pre-line text-slate-600">
                        {course.description || 'Chương trình giảng dạy được thiết kế khoa học, từ lý thuyết cốt lõi đến các dạng toán nâng cao và phương pháp giải nhanh trắc nghiệm.'}
                      </p>
                    </div>
                  </div>

                  {/* Highlights / Features List */}
                  {features.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-black text-slate-900 text-sm mb-3 uppercase tracking-wider">
                        Đặc quyền học viên & Cấu trúc khóa học:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 text-xs text-slate-800 flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{item.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notice Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900">Đặc biệt: </span>
                    Toàn bộ bài tập và đề thi đều có đáp án, lời giải chi tiết và video hướng dẫn của giáo viên trên website, hỗ trợ học sinh tự học hiệu quả 24/7.
                  </div>
                </div>

                {/* Target Audience */}
                {course.targetAudience && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm mb-2">Đối tượng phù hợp:</h3>
                    <p className="text-xs sm:text-sm text-slate-600">{course.targetAudience}</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB: CHƯƠNG TRÌNH (Curriculum) */}
            {activeTab === 'curriculum' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Chương trình bài học
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Tổng số: <strong className="text-slate-800">{lessons.length} bài giảng video & bài tập củng cố</strong>
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {course.totalHours || 80} giờ học
                  </span>
                </div>

                {lessons.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">Chương trình bài học đang được cập nhật bổ sung...</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {lessons.map((lesson, idx) => {
                      const isPreview = idx < maxPreviewCount;
                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                            isPreview
                              ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-400'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                isPreview ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                {lesson.chapterName}
                              </div>
                              <div className="text-sm font-bold text-slate-900 mt-0.5">
                                {lesson.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {lesson.durationMinutes || 45} phút
                                </span>
                                {isPreview ? (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    Bài giảng mẫu miễn phí ({idx + 1}/{maxPreviewCount})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-semibold rounded-md text-[10px] flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    Khóa &bull; Mua để học
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isPreview ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPreviewLesson(idx)}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer hover:scale-102"
                            >
                              <PlayCircle className="w-4 h-4" /> Xem bài giảng mẫu
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Bài học số ${idx + 1} thuộc nội dung chính thức của khóa học. Vui lòng bấm "Mua ngay" để mở khóa toàn bộ ${lessons.length} bài giảng, bài tập quiz và tài liệu đính kèm!`);
                                handleOpenCheckout();
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-orange-50 text-slate-500 hover:text-orange-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer border border-transparent hover:border-orange-200"
                              title="Bấm để mua mở khóa toàn bộ bài học"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Khóa &bull; Mua để xem</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: GIẢNG VIÊN (Teacher) */}
            {activeTab === 'teacher' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Thông tin Giảng viên phụ trách
                </h2>

                {course.teacher ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
                    <img
                      src={course.teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={course.teacher.name}
                      className="w-32 h-32 rounded-3xl object-cover border-4 border-primary/20 shadow-md shrink-0"
                    />
                    <div className="space-y-2 text-center sm:text-left">
                      <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                        {course.teacher.subject} &bull; Chuyên gia luyện thi
                      </span>
                      <h3 className="text-2xl font-black text-slate-900">{course.teacher.name}</h3>
                      <p className="text-xs font-bold text-slate-600">{course.teacher.title}</p>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                        {course.teacher.bio || 'Thầy cô có nhiều năm kinh nghiệm bồi dưỡng học sinh giỏi và luyện thi đại học điểm 9+, tác giả của nhiều đầu sách tham khảo được học sinh cả nước tin tưởng.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Chưa có thông tin giảng viên cho khóa học này.</div>
                )}
              </div>
            )}

            {/* TAB: ĐÁNH GIÁ (Reviews) */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Đánh giá từ học viên
                  </h2>
                  <div className="flex items-center gap-1.5 text-amber-500 font-black text-base">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{course.rating ? course.rating.toFixed(1) : '5.0'} / 5.0</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Nguyễn Minh Anh', school: 'THPT Chu Văn An', text: 'Khóa học cực kỳ chi tiết, thầy giảng dễ hiểu và có rất nhiều bài tập hay bám sát đề thi thật.', star: 5 },
                    { name: 'Trần Hoàng Long', school: 'THPT Chuyên Hà Nội - Amsterdam', text: 'Hệ thống bài quiz sau mỗi bài giảng giúp mình nhớ công thức và phương pháp giải rất nhanh!', star: 5 },
                    { name: 'Lê Thùy Dung', school: 'THPT Lê Quý Đôn', text: 'Nhờ khóa học mà điểm thi thử của em đã tăng từ 6.5 lên 8.8, cảm ơn thầy cô rất nhiều ạ.', star: 5 },
                  ].map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{r.name}</span>
                          <span className="text-slate-400 ml-2">({r.school})</span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: r.star }).map((_, si) => (
                            <Star key={si} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: KHÓA HỌC LIÊN QUAN (Related) */}
            {activeTab === 'related' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Các khóa học liên quan khác
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedCourses.map((rc) => (
                    <div
                      key={rc.id}
                      onClick={() => navigate(`/courses/${rc.id}`)}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary/50 transition cursor-pointer shadow-2xs hover:shadow-md flex gap-3"
                    >
                      <img
                        src={rc.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'}
                        alt={rc.title}
                        className="w-24 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-primary uppercase">
                            Lớp {rc.grade} &bull; {rc.subject}
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                            {rc.title}
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-primary">
                          {formatPrice(rc.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY PURCHASE CARD (MATCHING Edu STUDY PHOTO 2 EXACTLY) */}
          <div className="lg:sticky lg:top-32 space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xl space-y-5">
              
              {/* Product Thumbnail / Book cover illustration */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-orange-500 border border-slate-100 shadow-inner flex items-center justify-center">
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {course.discountPercent && course.discountPercent > 0 && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                    -{course.discountPercent}%
                  </span>
                )}
              </div>

              {/* Price / "Liên Hệ" Title */}
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {formatPrice(course.price)}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="text-xs text-slate-400 line-through mt-0.5">
                    Giá gốc: {formatPrice(course.originalPrice)}
                  </div>
                )}
              </div>

              {/* BIG RED-ORANGE BUY NOW BUTTON ("MUA NGAY" / "ĐĂNG KÍ NHẬN TƯ VẤN") */}
              <div className="space-y-2.5">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>MUA NGAY &bull; ĐĂNG KÍ HỌC</span>
                </button>

                {lessons.length > 0 && maxPreviewCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenPreviewLesson(0)}
                    className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 text-center cursor-pointer hover:scale-[1.01] shadow-xs"
                  >
                    <PlayCircle className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Học thử bài giảng mẫu ({maxPreviewCount} bài miễn phí)</span>
                  </button>
                )}

                <Link
                  to={`/active-course?code=${course.id}`}
                  className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 text-center"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Mua bằng mã kích hoạt / voucher</span>
                </Link>
              </div>

              {/* Specs & Course Details (Icon tags matching Photo 2) */}
              <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100 font-semibold">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Khóa học trực tuyến</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>{course.totalLessons || lessons.length || 71} bài học</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{course.totalHours || 0} giờ học</span>
                </div>
              </div>

              {/* Hashtag box matching Photo 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold text-orange-600">
                #{course.subject} #{course.grade === 'DGNL' ? 'ĐGNL' : `Lớp ${course.grade}`} #VOD #All-Rounder
              </div>

            </div>

            {/* Hotline banner */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs space-y-1">
              <span className="text-slate-500">Cần tư vấn chọn khóa học phù hợp?</span>
              <a href="tel:19006868" className="block font-black text-primary hover:underline text-sm">
                Hotline: 1900 6868 (Miễn phí)
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* COMPREHENSIVE CHECKOUT & ENROLLMENT POPUP MODAL (VIETQR + ACTIVATION CODE + CONSULT) */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-6">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Thanh Toán & Mua Khóa Học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {course.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  setHasNotifiedTransfer(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Price Banner */}
            <div className="px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-primary text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-orange-100">Học phí ưu đãi:</span>
                <div className="text-xl font-black">{formatPrice(course.price)}</div>
              </div>
              {course.originalPrice && course.originalPrice > course.price && (
                <div className="text-right">
                  <span className="text-[10px] text-orange-200 line-through block">Giá gốc: {formatPrice(course.originalPrice)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold text-white">
                    Tiết kiệm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Selection Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-bold text-center bg-slate-50">
              <button
                onClick={() => setCheckoutTab('qr')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                  checkoutTab === 'qr'
                    ? 'border-primary text-primary bg-white font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-primary" />
                <span>Quét VietQR</span>
              </button>
              <button
                onClick={() => setCheckoutTab('code')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                  checkoutTab === 'code'
                    ? 'border-primary text-primary bg-white font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Mã kích hoạt</span>
              </button>
              <button
                onClick={() => setCheckoutTab('consult')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                  checkoutTab === 'consult'
                    ? 'border-primary text-primary bg-white font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                <span>Cần tư vấn</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* TAB 1: VIETQR DIRECT PAYMENT */}
              {checkoutTab === 'qr' && (
                <div className="space-y-4">
                  {orderLoading ? (
                    <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <div>Đang tạo đơn hàng và mã VietQR...</div>
                    </div>
                  ) : (isOrderApproved || currentOrder?.status === 'PAID' || currentOrder?.status === 'COMPLETED') ? (
                      /* ĐÃ ĐƯỢC SEPAY DUYỆT TỰ ĐỘNG VÀO LỚP */
                      <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-4 animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                          <CheckCircle2 className="w-9 h-9" />
                        </div>
                        <div>
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider inline-block mb-1">
                            Thanh toán thành công (SePay)
                          </span>
                          <h4 className="font-black text-slate-900 text-base">Bạn đã được tự động kích hoạt vào khóa học!</h4>
                          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                            Khóa học <strong className="text-slate-900">{course.title}</strong> đã được kích hoạt thành công vào tài khoản của bạn.
                          </p>
                        </div>

                        <div className="pt-2">
                          <Link
                            to="/my-courses"
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
                          >
                            <span>🚀 Bắt đầu vào học ngay</span>
                          </Link>
                        </div>
                      </div>
                    ) : hasNotifiedTransfer ? (
                      /* ĐANG CHỜ SEPAY XÁC NHẬN CHUYỂN KHOẢN */
                      <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                          <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                            Mã đơn hàng: #{currentOrder?.orderCode || 'DH...'}
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-0.5">
                            Đang chờ hệ thống xác nhận thanh toán...
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Hệ thống kiểm tra giao dịch mỗi 3 giây. Ngay khi ngân hàng báo tiền về, bạn sẽ được <strong>tự động duyệt vào khóa học ngay tức thì</strong>!
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Đang tự động xác nhận qua SePay Webhook (3s/lần)...</span>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            onClick={handleCheckOrder}
                            disabled={checkingOrderStatus}
                            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${checkingOrderStatus ? 'animate-spin' : ''}`} />
                            <span>{checkingOrderStatus ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái ngay'}</span>
                          </button>

                          <a
                            href="https://zalo.me"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Nhắn tin Zalo Admin duyệt nhanh trong 1 phút</span>
                          </a>

                          <button
                            onClick={() => setHasNotifiedTransfer(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-bold mt-1"
                          >
                            &larr; Xem lại thông tin chuyển khoản & mã QR
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* THÔNG TIN CHUYỂN KHOẢN & MÃ VIETQR */
                    <>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        {/* VietQR Image */}
                        <div className="w-44 h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                          <img
                            src={
                              currentOrder?.qrUrl ||
                              `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${course.price}&addInfo=${encodeURIComponent(
                                currentOrder?.transferContent || `HOCPHI KH${course.id} ${user?.phone || 'HV'}`
                              )}&accountName=${encodeURIComponent('CONG TY CO PHAN CONG NGHE GIAO DUC EDUSTUDY')}`
                            }
                            alt="Mã QR Chuyển khoản VietQR"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Payment Details */}
                        <div className="flex-1 space-y-2 text-xs w-full">
                          {currentOrder?.orderCode && (
                            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                              <span className="text-[11px] text-slate-400 font-semibold">Mã đơn hàng:</span>
                              <span className="font-mono font-black text-primary text-xs">
                                #{currentOrder.orderCode}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block">Ngân hàng thụ hưởng:</span>
                            <span className="font-extrabold text-slate-800">MBBank (Ngân hàng TMCP Quân Đội)</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block">Số tài khoản:</span>
                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                              <span className="font-black text-slate-900 tracking-wider">0988 888 888</span>
                              <button
                                onClick={() => copyToClipboard('0988888888', 'stk')}
                                className="text-primary hover:text-primary-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedField === 'stk' ? 'Đã sao chép' : 'Sao chép'}</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block">Chủ tài khoản:</span>
                            <span className="font-bold text-slate-800">CONG TY CO PHAN CONG NGHE GIAO DUC EDUSTUDY</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block">
                              Nội dung chuyển khoản (bắt buộc):
                            </span>
                            <div className="flex items-center justify-between bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200">
                              <span className="font-black text-orange-900 tracking-wide font-mono">
                                {currentOrder?.transferContent || `HOCPHI KH${course.id} ${user?.phone || 'HV'}`}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    currentOrder?.transferContent || `HOCPHI KH${course.id} ${user?.phone || 'HV'}`,
                                    'memo'
                                  )
                                }
                                className="text-orange-600 hover:text-orange-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedField === 'memo' ? 'Đã sao chép' : 'Sao chép'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Quy trình kích hoạt tự động:</strong> Mở App ngân hàng quét mã QR &rarr; Kiểm tra đúng số tiền và nội dung chuyển khoản &rarr; Bấm "Tôi đã chuyển khoản xong", Admin xác nhận thanh toán là bạn được tự động duyệt vào lớp ngay!
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => setHasNotifiedTransfer(true)}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tôi đã chuyển khoản xong</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVATION CODE (SINGLE USE TOKEN) */}
              {checkoutTab === 'code' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Bạn đã có mã kích hoạt / thẻ cào?</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Mỗi mã kích hoạt áp dụng cho 01 tài khoản duy nhất. Nhập mã để được vào học ngay tức thì 0 giây mà không cần chờ duyệt!
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/active-course?code=${course.id}`}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Đến trang kích hoạt mã ngay</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: CONSULTATION FORM */}
              {checkoutTab === 'consult' && (
                <form onSubmit={handleConsultSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh / phụ huynh *</label>
                    <input
                      type="text"
                      required
                      value={consultName}
                      onChange={(e) => setConsultName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={consultPhone}
                      onChange={(e) => setConsultPhone(e.target.value)}
                      placeholder="Ví dụ: 0987 654 321"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="p-3 bg-orange-50 rounded-xl text-[11px] text-orange-800">
                    Thầy cô tư vấn viên sẽ gọi điện giải đáp lộ trình học và hướng dẫn thanh toán nhận ưu đãi trong 15 phút.
                  </div>

                  <button
                    type="submit"
                    disabled={consultSent}
                    className="w-full py-3.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {consultSent ? 'Đang gửi đăng ký...' : 'Xác nhận đăng ký nhận tư vấn'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM BÀI GIẢNG MẪU (PREVIEW LESSON MODAL - TỐI ĐA 20% VÀ TỐI ĐA 2 BÀI) */}
      {previewLessonModalOpen && currentPreviewLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60">
                      Bài giảng mẫu miễn phí (Tối đa 20% khóa học)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Bài {selectedPreviewIndex + 1}/{maxPreviewCount}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base mt-0.5 truncate max-w-lg">
                    {currentPreviewLesson.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLessonModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Đóng bài giảng mẫu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WORKSPACE HỌC THỬ: Cột trái (video + ghi chú) | Cột phải (đề bài / chọn bài) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
              {/* CỘT TRÁI: Video ở trên, ghi chú ở dưới */}
              <div className="lg:col-span-8 flex flex-col overflow-y-auto lg:border-r border-slate-800">
                {/* Video Player Box */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden shrink-0">
              {(() => {
                const url = (currentPreviewLesson.videoUrl || '').trim();
                if (!url) {
                  return (
                    <iframe
                      src="https://www.youtube.com/embed/k5q6G6dG-dE?rel=0&modestbranding=1&autoplay=1"
                      title={currentPreviewLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                // 1. YouTube
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  const videoId = match && match[1] && match[1] !== 'dQw4w9WgXcQ' ? match[1] : 'k5q6G6dG-dE';
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
                      title={currentPreviewLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                // 2. Vimeo
                if (url.includes('vimeo.com')) {
                  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
                  const vimeoId = vimeoMatch ? vimeoMatch[1] : '';
                  if (vimeoId) {
                    return (
                      <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&autoplay=1`}
                        title={currentPreviewLesson.title}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                }

                // 3. Google Drive
                if (url.includes('drive.google.com')) {
                  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                  const driveId = driveMatch ? driveMatch[1] : '';
                  const embedUrl = driveId
                    ? `https://drive.google.com/file/d/${driveId}/preview`
                    : url.replace('/view', '/preview');
                  return (
                    <iframe
                      src={embedUrl}
                      title={currentPreviewLesson.title}
                      className="w-full h-full border-0"
                      allow="autoplay"
                      allowFullScreen
                    />
                  );
                }

                // 4. Direct HTML5 Video
                const isDirectVideo =
                  url.endsWith('.mp4') ||
                  url.includes('.mp4?') ||
                  url.includes('.webm') ||
                  url.includes('.mov') ||
                  url.includes('.m4v') ||
                  url.startsWith('blob:') ||
                  url.startsWith('data:video');

                if (isDirectVideo) {
                  return (
                    <video
                      controls
                      autoPlay
                      controlsList="nodownload"
                      src={url}
                      poster={course.thumbnailUrl}
                      className="w-full h-full object-contain"
                    >
                      Trình duyệt không hỗ trợ phát video HTML5.
                    </video>
                  );
                }

                // 5. Fallback
                return (
                  <iframe
                    src={url}
                    title={currentPreviewLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                );
              })()}
            </div>

                {/* Ghi chú học tập (dưới video, cột trái) */}
                <div className="p-4 space-y-3">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <StickyNote className="w-4 h-4" /> Ghi chú của bạn
                      </label>
                      <span className="text-[10px] text-slate-500">Tự lưu trên trình duyệt của bạn</span>
                    </div>
                    <textarea
                      value={previewNote}
                      onChange={(e) => {
                        setPreviewNote(e.target.value);
                        try {
                          localStorage.setItem(`preview_note_${currentPreviewLesson.id}`, e.target.value);
                        } catch {}
                      }}
                      rows={6}
                      placeholder="Ghi lại kiến thức trọng tâm, công thức, hoặc câu hỏi muốn hỏi lại thầy cô khi xem video..."
                      className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-slate-100 outline-hidden resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
              {/* /CỘT TRÁI */}

              {/* CỘT PHẢI: Thông tin bài học, Đề bài & Tài liệu, Chọn bài tiếp theo, CTA */}
              <div className="lg:col-span-4 flex flex-col overflow-y-auto bg-slate-950/40">
                <div className="p-4 space-y-4">
                  {/* Thông tin bài học */}
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {currentPreviewLesson.chapterName || 'Chương trình học'}
                    </span>
                    <h4 className="text-sm font-black text-white mt-0.5">{currentPreviewLesson.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {currentPreviewLesson.durationMinutes || 45} phút
                      </span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-semibold">Học thử</span>
                    </div>
                  </div>

                  {/* Đề bài & Tài liệu PDF */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" /> Đề bài & Tài liệu
                    </h5>
                    {currentPreviewLesson.materialUrl ? (
                      <a
                        href={currentPreviewLesson.materialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{currentPreviewLesson.materialName || 'Tải tài liệu PDF bài học'}</span>
                        <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/50 text-slate-400 border border-slate-700/60 text-xs rounded-xl">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Đề bài & bài tập đầy đủ sẽ mở khóa khi bạn kích hoạt khóa học.</span>
                      </div>
                    )}
                  </div>

                  {/* Chọn bài học thử tiếp theo */}
                  {previewLessons.length > 1 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-emerald-400" /> Chọn bài tiếp theo
                      </h5>
                      <div className="space-y-1.5">
                        {previewLessons.map((pl, pIdx) => (
                          <button
                            key={pl.id || pIdx}
                            type="button"
                            onClick={() => setSelectedPreviewIndex(pIdx)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                              selectedPreviewIndex === pIdx
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${selectedPreviewIndex === pIdx ? 'bg-white/20' : 'bg-slate-700'}`}>
                              {pIdx + 1}
                            </span>
                            <span className="flex-1 truncate">{pl.title}</span>
                            {pl.materialUrl && <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA mua khóa học */}
                  <div className="bg-gradient-to-br from-orange-950/50 to-amber-950/40 border-2 border-orange-500/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Mở khóa toàn bộ {lessons.length} bài học</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Kích hoạt để học trọn bộ bài giảng, đề thi quiz củng cố và tải toàn bộ tài liệu.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewLessonModalOpen(false);
                        handleOpenCheckout();
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 transition hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>MUA NGAY ({formatPrice(course.price)})</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* /CỘT PHẢI */}
            </div>
            {/* /WORKSPACE */}

          </div>
        </div>
      )}

    </div>
  );
};
