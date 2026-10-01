import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { courseApi } from '../../api/courseApi';
import { categoryApi } from '../../api/categoryApi';
import { Course, Teacher, Grade, Subject } from '../../types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  // Quick Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<string>('12');
  const [subject, setSubject] = useState<string>('TOAN');
  const [teacherId, setTeacherId] = useState<number | ''>('');
  const [price, setPrice] = useState<number>(990000);
  const [originalPrice, setOriginalPrice] = useState<number>(1800000);
  const [discountPercent, setDiscountPercent] = useState<number>(45);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [badge, setBadge] = useState('HOT');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [totalLessons, setTotalLessons] = useState(60);
  const [totalHours, setTotalHours] = useState(80);
  const [isActive, setIsActive] = useState(true);
  const [featuresList, setFeaturesList] = useState('');

  // Học phí bán được tự động tính từ Giá gốc và % Giảm giá (không cần nhập tay)
  useEffect(() => {
    const base = Number(originalPrice) || 0;
    const disc = Number(discountPercent) || 0;
    setPrice(Math.max(0, Math.round(base * (1 - disc / 100))));
  }, [originalPrice, discountPercent]);

  const fetchCoursesAndTeachers = async () => {
    setLoading(true);
    try {
      const [cData, tData, gData, sData] = await Promise.all([
        adminApi.getAllCourses(),
        courseApi.getTeachers(),
        categoryApi.getActiveGrades().catch(() => []),
        categoryApi.getActiveSubjects().catch(() => []),
      ]);
      setCourses(cData);
      setTeachers(tData);
      setDynamicGrades(gData || []);
      setDynamicSubjects(sData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCourseStudio = (course: Course) => {
    navigate(`/admin/courses/${course.id}/studio`);
  };

  useEffect(() => {
    fetchCoursesAndTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setGrade(dynamicGrades.length > 0 ? dynamicGrades[0].code : '12');
    setSubject(dynamicSubjects.length > 0 ? dynamicSubjects[0].code : 'TOAN');
    setTeacherId(teachers.length > 0 ? teachers[0].id : '');
    setPrice(990000);
    setOriginalPrice(1800000);
    setDiscountPercent(45);
    setThumbnailUrl('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80');
    setBadge('HOT');
    setDescription('Khóa học toàn diện bám sát chương trình GDPT mới, luyện thi hiệu quả đạt điểm 9+.');
    setTargetAudience('Học sinh THPT ôn thi mục tiêu điểm cao.');
    setTotalLessons(0);
    setTotalHours(0);
    setIsActive(true);
    setFeaturesList('Lý thuyết & phương pháp giải nhanh;Bộ đề thi thực chiến;Hỗ trợ học tập 24/7');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setGrade(c.grade);
    setSubject(c.subject);
    setTeacherId(c.teacherId || (teachers.length > 0 ? teachers[0].id : ''));
    setPrice(c.price);
    setOriginalPrice(c.originalPrice || c.price);
    setDiscountPercent(c.discountPercent || 0);
    setThumbnailUrl(c.thumbnailUrl || '');
    setBadge(c.badge || '');
    setDescription(c.description || '');
    setTargetAudience(c.targetAudience || '');
    setTotalLessons(c.totalLessons || 0);
    setTotalHours(c.totalHours || 0);
    setIsActive(c.isActive ?? true);
    setFeaturesList(c.featuresList || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title,
      grade,
      subject,
      teacherId: teacherId !== '' ? Number(teacherId) : null,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discountPercent: Number(discountPercent),
      thumbnailUrl,
      badge,
      description,
      targetAudience,
      totalLessons: Number(totalLessons),
      totalHours: Number(totalHours),
      isActive,
      featuresList,
    };

    try {
      if (editingCourse) {
        await adminApi.updateCourse(editingCourse.id, payload);
        setIsModalOpen(false);
        await fetchCoursesAndTeachers();
      } else {
        const created = await adminApi.createCourse(payload);
        setIsModalOpen(false);
        await fetchCoursesAndTeachers();
        // Automatically open the Course Studio so the user can immediately add lessons, videos, and quizzes!
        if (created) {
          openCourseStudio(created);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể lưu khóa học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}" không?`)) {
      return;
    }
    try {
      await adminApi.deleteCourse(id);
      fetchCoursesAndTeachers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa khóa học');
    }
  };

  const filtered = courses.filter((c) => {
    const matchGrade = selectedGrade === 'ALL' || c.grade === selectedGrade;
    const matchSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(search.toLowerCase()));
    return matchGrade && matchSearch;
  });

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Quản trị chương trình học</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Khóa Học
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết kế giáo trình bài học, thêm video giảng dạy, gắn đề thi trắc nghiệm Quiz và theo dõi bảng xếp hạng học sinh.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 transition-all self-start sm:self-auto hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khóa học mới</span>
        </button>
      </div>

      {/* Filter and Search Bar with Dynamic Grades from Admin */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khóa học, giáo viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Grade filter buttons loaded dynamically according to Admin visibility settings */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedGrade('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedGrade === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          {dynamicGrades.length > 0 ? (
            dynamicGrades.map((g) => (
              <button
                key={g.id || g.code}
                onClick={() => setSelectedGrade(g.code)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedGrade === g.code
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.name}
              </button>
            ))
          ) : (
            ['12', '11', '10', 'DGNL'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'DGNL' ? 'ĐGNL' : `Lớp ${g}`}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Đang tải danh sách khóa học...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Khóa học</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Môn</th>
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Học phí</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=120&q=80'}
                          alt={course.title}
                          className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer"
                          onClick={() => openCourseStudio(course)}
                        />
                        <div>
                          <div
                            onClick={() => openCourseStudio(course)}
                            className="font-bold text-slate-900 line-clamp-1 hover:text-primary transition cursor-pointer"
                            title="Bấm để mở Studio thiết kế bài học, video và đề thi quiz"
                          >
                            {course.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span
                              onClick={() => navigate(`/admin/courses/${course.id}/studio`)}
                              className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              title="Bấm để xem danh sách học viên và thêm học viên vào lớp"
                            >
                              <Users className="w-3 h-3" /> {course.studentCount || 0} học viên
                            </span>
                            <span>&bull;</span>
                            <span>{course.totalLessons || 0} bài học</span>
                            <span>&bull;</span>
                            <span>{course.totalHours || 0} giờ</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 font-extrabold text-[10px] rounded-md bg-slate-100 text-slate-800">
                        {course.grade === 'DGNL' ? 'ĐGNL / TSA' : `Lớp ${course.grade}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {course.subject}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {course.teacherName || course.teacher?.name || 'Chưa gán'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-primary">{formatPrice(course.price)}</div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatPrice(course.originalPrice)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          course.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {course.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openCourseStudio(course)}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-xs cursor-pointer hover:scale-102"
                          title="Mở Studio: Thêm bài học, video, học viên và soạn đề Quiz"
                        >
                          <Layers className="w-3.5 h-3.5" /> Studio Khóa Học
                        </button>
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa nhanh khóa học"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy khóa học nào phù hợp.
          </div>
        )}
      </div>

      {/* Add / Edit Quick Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề khóa học *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Khóa PRO-X Luyện thi THPT Quốc Gia môn Toán"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp (Theo cài đặt Admin) *</label>
                  <select
                    value={grade}
                    onChange={(e: any) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
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
                        <option value="DGNL">ĐGNL HSA & TSA</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học *</label>
                  <select
                    value={subject}
                    onChange={(e: any) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  >
                    {dynamicSubjects.length > 0 ? (
                      dynamicSubjects.map((s) => (
                        <option key={s.id || s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="TOAN">Toán Học</option>
                        <option value="VAT_LY">Vật Lý</option>
                        <option value="HOA_HOC">Hóa Học</option>
                        <option value="SINH_HOC">Sinh Học</option>
                        <option value="TIENG_ANH">Tiếng Anh</option>
                        <option value="NGU_VAN">Ngữ Văn</option>
                        <option value="TONG_HOP">Tổng Hợp / ĐGNL</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
                  <select
                    value={teacherId}
                    onChange={(e: any) => setTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
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
                  <label className="block font-bold text-slate-700 mb-1">Huy hiệu (Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="HOT, NEW, BEST_SELLER..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá gốc (VNĐ) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">% Giảm giá</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Học phí bán (tự tính)</label>
                  <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-700 flex items-center h-[34px]">
                    {formatPrice(price)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh đại diện (Thumbnail URL)</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả khóa học</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chi tiết về nội dung giảng dạy, phương pháp, lộ trình..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đặc quyền nổi bật (cách nhau bởi dấu chấm phẩy ;)</label>
                <input
                  type="text"
                  value={featuresList}
                  onChange={(e) => setFeaturesList(e.target.value)}
                  placeholder="Lý thuyết & phương pháp;Bộ đề thực chiến;Hỗ trợ 24/7"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">
                  Hiển thị khóa học này cho học sinh trên website
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu khóa học'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
