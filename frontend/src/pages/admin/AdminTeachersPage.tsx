import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { categoryApi } from '../../api/categoryApi';
import { Teacher, Subject } from '../../types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Star,
  Award,
  X,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('TOAN');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [rating, setRating] = useState(5.0);
  const [studentCount, setStudentCount] = useState(15000);
  const [achievements, setAchievements] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        adminApi.getAllTeachers(),
        categoryApi.getActiveSubjects().catch(() => []),
      ]);
      setTeachers(tData || []);
      setDynamicSubjects(sData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setName('');
    setTitle('Giảng viên Luyện thi THPT Quốc Gia');
    setSubject(dynamicSubjects.length > 0 ? dynamicSubjects[0].code : 'TOAN');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setBio('Nhiều năm kinh nghiệm luyện thi đại học, bồi dưỡng học sinh đạt điểm 9-10.');
    setExperienceYears(10);
    setRating(5.0);
    setStudentCount(20000);
    setAchievements('Thủ khoa tốt nghiệp ĐH Sư Phạm');
    setSortOrder(teachers.length + 1);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setTitle(t.title || '');
    setSubject(t.subject);
    setAvatarUrl(t.avatarUrl || '');
    setBio(t.bio || '');
    setExperienceYears(t.experienceYears || 10);
    setRating(t.rating || 5.0);
    setStudentCount(t.studentCount || 1000);
    setAchievements(t.achievements || '');
    setSortOrder(t.sortOrder ?? 1);
    setIsActive(t.isActive ?? true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name,
      title,
      subject,
      avatarUrl,
      bio,
      experienceYears: Number(experienceYears),
      rating: Number(rating),
      studentCount: Number(studentCount),
      achievements,
      sortOrder: Number(sortOrder),
      isActive,
    };

    try {
      if (editingTeacher) {
        await adminApi.updateTeacher(editingTeacher.id, payload);
      } else {
        await adminApi.createTeacher(payload);
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin giáo viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (t: Teacher) => {
    try {
      await adminApi.toggleTeacherStatus(t.id);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDelete = async (id: number, tName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa giáo viên "${tName}" không?`)) {
      return;
    }
    try {
      await adminApi.deleteTeacher(id);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa giáo viên');
    }
  };

  const filtered = teachers.filter((t) => {
    const matchSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.title && t.title.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (selectedSubjectFilter !== 'ALL' && t.subject !== selectedSubjectFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Ban cố vấn & giảng dạy THPT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Đội Ngũ Giáo Viên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thêm mới, sửa đổi thông tin, thứ tự hiển thị và hồ sơ thành tích các thầy cô trên hệ thống.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 transition-all self-start sm:self-auto hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm giáo viên mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên giáo viên, môn, học vị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedSubjectFilter('ALL')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedSubjectFilter === 'ALL'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({teachers.length})
          </button>
          {dynamicSubjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectFilter(s.code)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedSubjectFilter === s.code
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Teachers */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Đang tải danh sách giáo viên...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                t.isActive ? 'border-slate-200/80' : 'border-slate-300 bg-slate-50/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={t.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                    />
                    {!t.isActive && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-slate-700 text-white text-[9px] font-bold rounded-full">
                        Tạm ẩn
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary-50 text-primary">
                        {t.subject}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          #{t.sortOrder ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {t.rating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1 truncate">{t.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{t.title}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {t.bio}
                </p>

                {t.achievements && (
                  <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{t.achievements}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {t.experienceYears} năm kinh nghiệm
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      t.isActive
                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={t.isActive ? 'Tạm ẩn giáo viên' : 'Kích hoạt lại'}
                  >
                    {t.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p>Không tìm thấy giáo viên nào phù hợp.</p>
        </div>
      )}

      {/* Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTeacher ? 'Chỉnh Sửa Hồ Sơ Giáo Viên' : 'Thêm Giáo Viên Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên giáo viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thầy Chu Văn Biên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn giảng dạy *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  >
                    {dynamicSubjects.length > 0 ? (
                      dynamicSubjects.map((s) => (
                        <option key={s.id} value={s.code}>
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
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số năm kinh nghiệm</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị (Sort Order)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số học viên đã dạy</label>
                  <input
                    type="number"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học vị / Danh hiệu</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cựu Giảng Viên ĐHSP - Chuyên Gia Luyện Thi Số 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh đại diện (Avatar URL)</label>
                <div className="flex items-center gap-3">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiểu sử & Phong cách dạy</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả quá trình công tác, thành tích đào tạo..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thành tích nổi bật</label>
                <input
                  type="text"
                  placeholder="Tác giả sách 9+, 12 thủ khoa toàn quốc..."
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Hiển thị trên website</div>
                  <div className="text-[10px] text-slate-400">Bật/tắt hồ sơ công khai của thầy cô</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
