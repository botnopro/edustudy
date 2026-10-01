import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { courseApi } from '../../api/courseApi';
import { categoryApi } from '../../api/categoryApi';
import { studentApi } from '../../api/studentApi';
import { Course, Lesson, Teacher, Grade, Subject, CourseStudentLeaderboard, CourseStudent, Student } from '../../types';
import { AdminQuizModal } from '../../components/admin/AdminQuizModal';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Video,
  Clock,
  HelpCircle,
  Trophy,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  PlayCircle,
  Loader2,
  Check,
  Users,
  UserPlus,
  UserMinus,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  FileText,
  Paperclip,
  Download,
  X
} from 'lucide-react';

export const AdminCourseStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'lessons' | 'leaderboard' | 'students' | 'settings'>('lessons');

  // Lesson Form State
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonChapter, setLessonChapter] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState<number>(45);
  const [lessonSortOrder, setLessonSortOrder] = useState<number>(1);
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonMaterialUrl, setLessonMaterialUrl] = useState('');
  const [lessonMaterialName, setLessonMaterialName] = useState('');
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);

  // Upload file PDF tài liệu (lưu base64 vào DB)
  const materialFileInputRef = useRef<HTMLInputElement | null>(null);
  const [materialUploadError, setMaterialUploadError] = useState<string | null>(null);
  const MATERIAL_MAX_BYTES = 5 * 1024 * 1024; // 5MB

  const handleMaterialFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setMaterialUploadError('Chỉ chấp nhận file PDF.');
      e.target.value = '';
      return;
    }
    if (file.size > MATERIAL_MAX_BYTES) {
      setMaterialUploadError(`File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Giới hạn 5MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLessonMaterialUrl(dataUrl);
      if (!lessonMaterialName.trim()) {
        setLessonMaterialName(file.name);
      }
    };
    reader.onerror = () => setMaterialUploadError('Không đọc được file. Vui lòng thử lại.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quiz Modal State for a specific lesson
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<Lesson | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<CourseStudentLeaderboard[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Course Students Roster State
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState('');
  const [studentActionNotice, setStudentActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Student to Course Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [allSystemStudents, setAllSystemStudents] = useState<Student[]>([]);
  const [loadingSystemStudents, setLoadingSystemStudents] = useState(false);
  const [systemStudentSearch, setSystemStudentSearch] = useState('');
  const [addingStudentId, setAddingStudentId] = useState<number | null>(null);

  // Fetch Course Students
  const fetchCourseStudents = async () => {
    if (!id) return;
    setLoadingStudents(true);
    try {
      const data = await adminApi.getCourseStudents(Number(id));
      setCourseStudents(data || []);
    } catch (err: any) {
      console.error(err);
      setStudentActionNotice({ type: 'error', text: err.response?.data?.message || 'Không thể tải danh sách học viên' });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Open Add Student Modal
  const handleOpenAddStudentModal = async () => {
    setIsAddStudentModalOpen(true);
    setSystemStudentSearch('');
    setLoadingSystemStudents(true);
    try {
      const data = await studentApi.getAllStudents();
      setAllSystemStudents(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingSystemStudents(false);
    }
  };

  // Add a student directly to the course
  const handleAddStudentToCourse = async (student: Student) => {
    if (!id) return;
    setAddingStudentId(student.id);
    setStudentActionNotice(null);
    try {
      await adminApi.addStudentToCourse(Number(id), student.id);
      setStudentActionNotice({
        type: 'success',
        text: `Đã thêm thành công học sinh ${student.fullName} (${student.email}) vào lớp học! Học sinh có thể vào học ngay lập tức.`,
      });
      // Refresh students
      await fetchCourseStudents();
      // Update local course studentCount
      setCourse((prev) => (prev ? { ...prev, studentCount: (prev.studentCount || 0) + 1 } : null));
      setIsAddStudentModalOpen(false);
    } catch (err: any) {
      setStudentActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi thêm học sinh vào lớp',
      });
    } finally {
      setAddingStudentId(null);
    }
  };

  // Remove a student from the course
  const handleRemoveStudentFromCourse = async (student: CourseStudent) => {
    if (!id) return;
    const confirmed = window.confirm(
      `Xác nhận xóa học sinh "${student.fullName}" (${student.email}) ra khỏi lớp học?\nHọc sinh này sẽ không thể tiếp tục truy cập bài học và làm bài kiểm tra của khóa này.`
    );
    if (!confirmed) return;

    setLoadingStudents(true);
    setStudentActionNotice(null);
    try {
      await adminApi.removeStudentFromCourse(Number(id), student.userId);
      setStudentActionNotice({
        type: 'success',
        text: `Đã xóa học sinh "${student.fullName}" khỏi lớp học.`,
      });
      await fetchCourseStudents();
      setCourse((prev) => (prev ? { ...prev, studentCount: Math.max(0, (prev.studentCount || 1) - 1) } : null));
    } catch (err: any) {
      setStudentActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi xóa học sinh khỏi khóa học',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchCourseStudents();
    }
  }, [activeTab]);

  // Course Settings State
  const [settingTitle, setSettingTitle] = useState('');
  const [settingGrade, setSettingGrade] = useState('12');
  const [settingSubject, setSettingSubject] = useState('TOAN');
  const [settingTeacherId, setSettingTeacherId] = useState<number | ''>('');
  const [settingPrice, setSettingPrice] = useState<number>(990000);
  const [settingOriginalPrice, setSettingOriginalPrice] = useState<number>(1800000);
  const [settingDiscountPercent, setSettingDiscountPercent] = useState<number>(45);
  const [settingThumbnailUrl, setSettingThumbnailUrl] = useState('');
  const [settingDescription, setSettingDescription] = useState('');
  const [settingFeaturesList, setSettingFeaturesList] = useState('');
  const [settingIsActive, setSettingIsActive] = useState(true);
  const [settingSubmitting, setSettingSubmitting] = useState(false);
  const [settingSuccessMsg, setSettingSuccessMsg] = useState<string | null>(null);

  // Học phí bán tự động tính từ Giá gốc và % Giảm giá
  useEffect(() => {
    const base = Number(settingOriginalPrice) || 0;
    const disc = Number(settingDiscountPercent) || 0;
    setSettingPrice(Math.max(0, Math.round(base * (1 - disc / 100))));
  }, [settingOriginalPrice, settingDiscountPercent]);

  // Load course details & dependencies
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseData, teachersData, gradesData, subjectsData] = await Promise.all([
        courseApi.getCourseById(Number(id)),
        courseApi.getTeachers().catch(() => []),
        categoryApi.getActiveGrades().catch(() => []),
        categoryApi.getActiveSubjects().catch(() => []),
      ]);

      setCourse(courseData);
      setTeachers(teachersData || []);
      setDynamicGrades(gradesData || []);
      setDynamicSubjects(subjectsData || []);

      if (courseData) {
        setSettingTitle(courseData.title);
        setSettingGrade(courseData.grade);
        setSettingSubject(courseData.subject);
        setSettingTeacherId(courseData.teacherId || '');
        setSettingPrice(courseData.price);
        setSettingOriginalPrice(courseData.originalPrice || courseData.price);
        setSettingDiscountPercent(courseData.discountPercent || 0);
        setSettingThumbnailUrl(courseData.thumbnailUrl || '');
        setSettingDescription(courseData.description || '');
        setSettingFeaturesList(courseData.featuresList || '');
        setSettingIsActive(courseData.isActive ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    if (!id) return;
    setLoadingLeaderboard(true);
    try {
      const data = await adminApi.getCourseLeaderboard(Number(id));
      setLeaderboard(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  // Open Create Lesson Form
  const handleOpenAddLesson = () => {
    const existingLessons = course?.lessons || [];
    const lastChapter = existingLessons.length > 0 ? existingLessons[existingLessons.length - 1].chapterName : 'Chương 1: Khởi động';
    setEditingLesson(null);
    setLessonTitle('');
    setLessonChapter(lastChapter || 'Chương 1: Khởi động');
    setLessonVideoUrl('');
    setLessonMaterialUrl('');
    setLessonMaterialName('');
    setLessonDuration(45);
    setLessonSortOrder(existingLessons.length + 1);
    setLessonIsFree(false);
    setLessonError(null);
    setIsAddingLesson(true);
  };

  // Open Edit Lesson Form
  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonChapter(lesson.chapterName);
    setLessonVideoUrl(lesson.videoUrl || '');
    setLessonMaterialUrl(lesson.materialUrl || '');
    setLessonMaterialName(lesson.materialName || '');
    setLessonDuration(lesson.durationMinutes || 45);
    setLessonSortOrder(lesson.sortOrder || 1);
    setLessonIsFree(lesson.isFreePreview || false);
    setLessonError(null);
    setIsAddingLesson(true);
  };

  // Save Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setLessonSubmitting(true);
    setLessonError(null);

    const payload: Partial<Lesson> = {
      title: lessonTitle.trim(),
      chapterName: lessonChapter.trim() || 'Chương 1: Tổng quan',
      videoUrl: lessonVideoUrl.trim(),
      materialUrl: lessonMaterialUrl.trim() || undefined,
      materialName: lessonMaterialName.trim() || undefined,
      durationMinutes: lessonDuration,
      sortOrder: lessonSortOrder,
      isFreePreview: lessonIsFree,
    };

    try {
      if (editingLesson) {
        await adminApi.updateLesson(editingLesson.id, payload);
      } else {
        await adminApi.addLesson(course.id, payload);
      }
      setIsAddingLesson(false);
      setEditingLesson(null);
      await loadData();
    } catch (err: any) {
      setLessonError(err.message || 'Lỗi khi lưu bài học');
    } finally {
      setLessonSubmitting(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lesson.title}" không? Toàn bộ câu hỏi Quiz đi kèm cũng sẽ bị xóa.`)) {
      return;
    }
    try {
      await adminApi.deleteLesson(lesson.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bài học');
    }
  };

  // Open Quiz Modal
  const handleOpenQuiz = (lesson: Lesson) => {
    setSelectedLessonForQuiz(lesson);
    setIsQuizModalOpen(true);
  };

  // Save Course Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSettingSubmitting(true);
    setSettingSuccessMsg(null);

    const payload = {
      title: settingTitle.trim(),
      grade: settingGrade,
      subject: settingSubject,
      teacherId: settingTeacherId || null,
      price: settingPrice,
      originalPrice: settingOriginalPrice,
      discountPercent: settingDiscountPercent,
      thumbnailUrl: settingThumbnailUrl.trim(),
      description: settingDescription.trim(),
      featuresList: settingFeaturesList.trim(),
      isActive: settingIsActive,
    };

    try {
      await adminApi.updateCourse(course.id, payload);
      setSettingSuccessMsg('Cập nhật thông tin khóa học thành công!');
      setTimeout(() => setSettingSuccessMsg(null), 3000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật khóa học');
    } finally {
      setSettingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Đang tải Studio quản lý khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy khóa học này</h2>
        <Link to="/admin/courses" className="mt-4 inline-block text-primary font-bold text-xs">
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const lessons = course.lessons || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. STUDIO TOP BAR (Header) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/courses" className="hover:text-primary flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" /> Quản lý khóa học
              </Link>
              <span>/</span>
              <span className="text-orange-400 font-bold uppercase">Studio Khóa Học</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {course.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                {course.grade === 'DGNL' ? 'ĐGNL / TSA' : `Lớp ${course.grade}`}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                {course.subject}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course.id}`}
              target="_blank"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" /> Xem trang học sinh
            </Link>
            <Link
              to="/admin/courses"
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition"
            >
              Về danh sách
            </Link>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-4 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'lessons'
                  ? 'border-primary text-primary bg-orange-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Giáo trình bài học ({lessons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'border-primary text-primary bg-orange-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Bảng xếp hạng</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'students'
                  ? 'border-primary text-primary bg-orange-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Học viên trong lớp ({courseStudents.length || course?.studentCount || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-primary text-primary bg-orange-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cài đặt & Lớp học</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'lessons' && !isAddingLesson && (
              <button
                onClick={handleOpenAddLesson}
                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm bài học mới
              </button>
            )}

            {activeTab === 'students' && (
              <button
                onClick={handleOpenAddStudentModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Thêm học viên vào lớp
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* TAB 1: CURRICULUM, LESSONS & QUIZZES */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            
            {/* Form Add / Edit Lesson */}
            {isAddingLesson && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-primary/40 shadow-xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {editingLesson ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingLesson(false);
                      setEditingLesson(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg text-sm"
                  >
                    ✕ Đóng
                  </button>
                </div>

                {lessonError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {lessonError}
                  </div>
                )}

                <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Tiêu đề bài học *
                      </label>
                      <input
                        type="text"
                        required
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="Ví dụ: Bài 1: Tính đơn điệu và cực trị của hàm số"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tên chương *
                      </label>
                      <input
                        type="text"
                        required
                        value={lessonChapter}
                        onChange={(e) => setLessonChapter(e.target.value)}
                        placeholder="Chương 1: Ứng dụng đạo hàm"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                      />
                    </div>
                  </div>

                  {/* Video URL + Thời lượng (nhập tay) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block font-bold text-slate-700">
                        Link Video bài giảng (Youtube, MP4, HLS, Google Drive...)
                      </label>
                      <input
                        type="text"
                        value={lessonVideoUrl}
                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... hoặc link mp4"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Thời lượng (Phút) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={lessonDuration}
                        onChange={(e) => setLessonDuration(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Lesson Attachments / Study Materials */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-800">Tài liệu học tập & Đề PDF đính kèm (Tùy chọn)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên tài liệu / Phiếu bài tập
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Phiếu bài tập số 1 & Tóm tắt lý thuyết.pdf"
                          value={lessonMaterialName}
                          onChange={(e) => setLessonMaterialName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                          <Paperclip className="w-3 h-3 text-blue-600" />
                          Đường link file (URL tải PDF)
                        </label>
                        <input
                          type="url"
                          placeholder="https://... hoặc đường dẫn file PDF"
                          value={lessonMaterialUrl.startsWith('data:') ? '' : lessonMaterialUrl}
                          onChange={(e) => setLessonMaterialUrl(e.target.value)}
                          disabled={lessonMaterialUrl.startsWith('data:')}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Hoặc: tải trực tiếp file PDF lên (lưu vào hệ thống) */}
                    <div className="pt-1">
                      <input
                        ref={materialFileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleMaterialFileSelected}
                        className="hidden"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => materialFileInputRef.current?.click()}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          Tải lên file PDF (tối đa 5MB)
                        </button>

                        {lessonMaterialUrl.startsWith('data:') && (
                          <span className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
                            <FileText className="w-3.5 h-3.5" />
                            Đã đính kèm file PDF ({(((lessonMaterialUrl.length * 3) / 4) / 1024 / 1024).toFixed(1)}MB)
                            <button
                              type="button"
                              onClick={() => setLessonMaterialUrl('')}
                              className="text-rose-500 hover:text-rose-700 font-bold"
                              title="Gỡ file đã tải lên"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>
                      {materialUploadError && (
                        <p className="text-[11px] text-rose-600 font-semibold pt-1.5">{materialUploadError}</p>
                      )}
                      <p className="text-[11px] text-slate-400 pt-1">
                        Bạn có thể dán link PDF ở ô trên <strong>hoặc</strong> tải trực tiếp file lên (file sẽ được lưu vào hệ thống).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="lessonIsFreeStudio"
                      checked={lessonIsFree}
                      onChange={(e) => setLessonIsFree(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="lessonIsFreeStudio" className="font-bold text-slate-700 cursor-pointer">
                      Cho phép học sinh xem trước bài học này miễn phí (Học thử)
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingLesson(false);
                        setEditingLesson(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={lessonSubmitting}
                      className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-extrabold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {lessonSubmitting ? 'Đang lưu...' : editingLesson ? 'Cập nhật bài học' : 'Lưu bài học'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Empty state or Lessons List */}
            {lessons.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Khóa học hiện đang trống, chưa có bài học nào!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Bạn hãy bắt đầu bằng cách thêm các bài học video và tích hợp các đề thi Quiz (trắc nghiệm 4 đáp án, trả lời ngắn, tự luận, KaTeX, đồ thị) cho học sinh nhé.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddLesson}
                  className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-primary/25 transition flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm bài học đầu tiên ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-5 bg-white border border-slate-200 hover:border-primary/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-wider">
                          {lesson.chapterName}
                        </div>
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {lesson.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lesson.durationMinutes || 45} phút
                          </span>
                          {lesson.videoUrl && (
                            <span className="flex items-center gap-1 text-blue-600 font-bold">
                              <Video className="w-3.5 h-3.5" /> Có video bài giảng
                            </span>
                          )}
                          {lesson.isFreePreview && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[11px]">
                              Học thử miễn phí
                            </span>
                          )}
                          {lesson.materialUrl && (
                            <a
                              href={lesson.materialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md text-[11px] flex items-center gap-1 transition"
                              title="Tải hoặc xem tài liệu đính kèm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Tài liệu: {lesson.materialName || 'File PDF đính kèm'}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenQuiz(lesson)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:scale-102"
                        title="Soạn đề thi Quiz trắc nghiệm 4 đáp án, trả lời ngắn, tự luận, KaTeX, Oxy cho bài học này"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Soạn Quiz / Đề thi</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditLesson(lesson)}
                        className="p-2.5 text-slate-600 hover:text-primary hover:bg-orange-50 rounded-xl transition cursor-pointer"
                        title="Sửa bài học"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteLesson(lesson)}
                        className="p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Bảng Xếp Hạng Học Sinh Khóa Học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thống kê học sinh đã kích hoạt khóa học, số quiz hoàn thành và điểm số trung bình.
                </p>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Làm mới
              </button>
            </div>

            {loadingLeaderboard ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Đang tải bảng xếp hạng...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Chưa có học viên nộp bài</h4>
                <p className="text-xs text-slate-400">
                  Khi học sinh kích hoạt khóa học và làm quiz, bảng xếp hạng sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase">
                    <tr>
                      <th className="py-3.5 px-4">Thứ hạng</th>
                      <th className="py-3.5 px-4">Học viên</th>
                      <th className="py-3.5 px-4">Ngày kích hoạt</th>
                      <th className="py-3.5 px-4">Số quiz đã làm</th>
                      <th className="py-3.5 px-4">Điểm trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {leaderboard.map((item, idx) => {
                      const rank = idx + 1;
                      return (
                        <tr key={item.userId} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span
                              className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                                rank === 1
                                  ? 'bg-amber-400 text-white shadow-xs'
                                  : rank === 2
                                  ? 'bg-slate-300 text-slate-800'
                                  : rank === 3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{item.fullName}</div>
                            <div className="text-[11px] text-slate-400">{item.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.activatedAt ? new Date(item.activatedAt).toLocaleDateString('vi-VN') : 'Mới kích hoạt'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {item.quizzesCompleted} bài
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black">
                              {item.averagePercentage?.toFixed(1) || 0}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENTS ROSTER & ASSIGNMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Header action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchKeyword}
                  onChange={(e) => setStudentSearchKeyword(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại học sinh..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  Tổng số: <strong className="text-slate-900">{courseStudents.length}</strong> học viên
                </span>
                <button
                  onClick={handleOpenAddStudentModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm học viên vào lớp</span>
                </button>
              </div>
            </div>

            {/* Action Notice Alert */}
            {studentActionNotice && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                  studentActionNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {studentActionNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-semibold">{studentActionNotice.text}</span>
                </div>
                <button
                  onClick={() => setStudentActionNotice(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Students Table */}
            {loadingStudents ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                Đang tải danh sách học viên trong lớp...
              </div>
            ) : courseStudents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-800">Chưa có học sinh nào trong lớp</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Khóa học này hiện chưa có học sinh kích hoạt mã hoặc đăng ký. Bạn có thể bấm nút bên dưới để thêm bất kỳ học sinh nào vào lớp ngay lập tức!
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleOpenAddStudentModal}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Thêm học viên đầu tiên
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Học viên</th>
                      <th className="py-3.5 px-4">Liên hệ & Trường</th>
                      <th className="py-3.5 px-4">Ngày tham gia</th>
                      <th className="py-3.5 px-4">Hình thức vào lớp</th>
                      <th className="py-3.5 px-4">Hạn truy cập</th>
                      <th className="py-3.5 px-4 text-center">Tiến độ</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseStudents
                      .filter((st) => {
                        if (!studentSearchKeyword.trim()) return true;
                        const kw = studentSearchKeyword.toLowerCase();
                        return (
                          st.fullName?.toLowerCase().includes(kw) ||
                          st.email?.toLowerCase().includes(kw) ||
                          st.phone?.includes(kw)
                        );
                      })
                      .map((st) => {
                        const isDirect = !st.activationCode || st.activationCode === 'ADMIN_GRANT' || st.activationCode === 'ADMIN_DIRECT_ADD';
                        return (
                          <tr key={st.enrollmentId || st.userId} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                  {st.avatarUrl ? (
                                    <img src={st.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    st.fullName?.charAt(0) || 'H'
                                  )}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    <span>{st.fullName}</span>
                                    {st.gradeLevel && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[9px]">
                                        Lớp {st.gradeLevel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{st.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-700 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{st.phone || 'Chưa cập nhật SĐT'}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                {st.schoolName || 'Chưa cập nhật trường'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {st.activatedAt ? new Date(st.activatedAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                            </td>
                            <td className="py-3.5 px-4">
                              {isDirect ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                  Admin cấp trực tiếp
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 font-mono">
                                  <span>Mã: {st.activationCode}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {st.expiresAt ? new Date(st.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                                <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${Math.min(100, st.progressPercent || 0)}%` }}
                                  />
                                </div>
                                <span className="text-[11px]">{st.progressPercent || 0}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleRemoveStudentFromCourse(st)}
                                title="Xóa học sinh ra khỏi lớp"
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & GRADE */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Cài Đặt Khóa Học & Phân Loại Lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các khối lớp được tải tự động theo cấu hình bật/tắt của Admin.
              </p>
            </div>

            {settingSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề khóa học *</label>
                <input
                  type="text"
                  required
                  value={settingTitle}
                  onChange={(e) => setSettingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp (Theo cài đặt Admin) *</label>
                  <select
                    value={settingGrade}
                    onChange={(e) => setSettingGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold"
                  >
                    {dynamicGrades.length > 0 ? (
                      dynamicGrades.map((g) => (
                        <option key={g.id || g.code} value={g.code}>
                          {g.name} ({g.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="12">Lớp 12</option>
                        <option value="11">Lớp 11</option>
                        <option value="10">Lớp 10</option>
                        <option value="DGNL">ĐGNL</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học *</label>
                  <select
                    value={settingSubject}
                    onChange={(e) => setSettingSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold"
                  >
                    {dynamicSubjects.length > 0 ? (
                      dynamicSubjects.map((s) => (
                        <option key={s.id || s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="TOAN">Toán</option>
                        <option value="VAT_LY">Vật Lý</option>
                        <option value="HOA_HOC">Hóa Học</option>
                        <option value="SINH_HOC">Sinh Học</option>
                        <option value="TIENG_ANH">Tiếng Anh</option>
                        <option value="NGU_VAN">Ngữ Văn</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
                  <select
                    value={settingTeacherId}
                    onChange={(e) => setSettingTeacherId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ảnh bìa (Thumbnail URL)</label>
                  <input
                    type="url"
                    value={settingThumbnailUrl}
                    onChange={(e) => setSettingThumbnailUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingOriginalPrice}
                    onChange={(e) => setSettingOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">% Giảm giá</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settingDiscountPercent}
                    onChange={(e) => setSettingDiscountPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Học phí bán (tự tính)</label>
                  <div className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-700 flex items-center">
                    {settingPrice.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả khóa học</label>
                <textarea
                  rows={3}
                  value={settingDescription}
                  onChange={(e) => setSettingDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đặc quyền nổi bật (cách nhau bởi dấu chấm phẩy ;)</label>
                <input
                  type="text"
                  value={settingFeaturesList}
                  onChange={(e) => setSettingFeaturesList(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="settingIsActiveStudio"
                  checked={settingIsActive}
                  onChange={(e) => setSettingIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="settingIsActiveStudio" className="font-bold text-slate-700 cursor-pointer">
                  Hiển thị khóa học này cho học sinh trên website
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={settingSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white font-black rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {settingSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Admin Quiz Modal for selected lesson */}
      <AdminQuizModal
        isOpen={isQuizModalOpen}
        lesson={selectedLessonForQuiz}
        onClose={() => {
          setIsQuizModalOpen(false);
          loadData();
        }}
      />

      {/* MODAL THÊM HỌC VIÊN VÀO LỚP HỌC */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Thêm Học Viên Vào Lớp Học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp: <strong className="text-slate-800">{course?.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={systemStudentSearch}
                  onChange={(e) => setSystemStudentSearch(e.target.value)}
                  placeholder="Gõ tên, email hoặc số điện thoại học sinh để tìm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-hidden focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingSystemStudents ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Đang tải danh sách học sinh hệ thống...
                </div>
              ) : (
                (() => {
                  const filtered = allSystemStudents.filter((s) => {
                    if (!systemStudentSearch.trim()) return true;
                    const kw = systemStudentSearch.toLowerCase();
                    return (
                      s.fullName?.toLowerCase().includes(kw) ||
                      s.email?.toLowerCase().includes(kw) ||
                      s.phone?.includes(kw)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-10 text-center text-slate-400 text-xs">
                        Không tìm thấy học sinh nào phù hợp với từ khóa "{systemStudentSearch}".
                      </div>
                    );
                  }

                  return filtered.map((s) => {
                    const isAlreadyEnrolled = courseStudents.some((cs) => cs.userId === s.id);
                    const isAddingThis = addingStudentId === s.id;

                    return (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                            {s.avatarUrl ? (
                              <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              s.fullName?.charAt(0) || 'H'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{s.fullName}</span>
                              {s.gradeLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[9px]">
                                  Lớp {s.gradeLevel}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {s.email} {s.phone ? `• ${s.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isAlreadyEnrolled ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã trong lớp
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddStudentToCourse(s)}
                              disabled={isAddingThis}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isAddingThis ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" /> Đang thêm...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" /> Thêm vào lớp
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Học sinh được thêm sẽ có quyền vào học và làm bài ngay lập tức.</span>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
