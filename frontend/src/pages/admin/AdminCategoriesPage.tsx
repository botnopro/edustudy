import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { Grade, Subject } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Layers,
  Palette
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects'>('grades');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Grade Modal
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeCode, setGradeCode] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [gradeDescription, setGradeDescription] = useState('');
  const [gradeSortOrder, setGradeSortOrder] = useState(1);
  const [gradeIsActive, setGradeIsActive] = useState(true);

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('Calculator');
  const [subjectColor, setSubjectColor] = useState('#3B82F6');
  const [subjectSortOrder, setSubjectSortOrder] = useState(1);
  const [subjectIsActive, setSubjectIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gData, sData] = await Promise.all([
        categoryApi.getAllGrades(),
        categoryApi.getAllSubjects(),
      ]);
      setGrades(gData || []);
      setSubjects(sData || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Grade Modal handlers
  const openCreateGrade = () => {
    setEditingGrade(null);
    setGradeCode('');
    setGradeName('');
    setGradeDescription('');
    setGradeSortOrder(grades.length + 1);
    setGradeIsActive(true);
    setErrorMsg(null);
    setIsGradeModalOpen(true);
  };

  const openEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeCode(grade.code);
    setGradeName(grade.name);
    setGradeDescription(grade.description || '');
    setGradeSortOrder(grade.sortOrder || 1);
    setGradeIsActive(grade.isActive ?? true);
    setErrorMsg(null);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeCode.trim() || !gradeName.trim()) {
      setErrorMsg('Vui lòng điền mã và tên khối lớp');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Grade> = {
        code: gradeCode.trim().toUpperCase(),
        name: gradeName.trim(),
        description: gradeDescription.trim(),
        sortOrder: gradeSortOrder,
        isActive: gradeIsActive,
      };

      if (editingGrade) {
        await categoryApi.updateGrade(editingGrade.id, payload);
      } else {
        await categoryApi.createGrade(payload);
      }

      setIsGradeModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin khối lớp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGrade = async (grade: Grade) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khối lớp "${grade.name}"?`)) {
      try {
        await categoryApi.deleteGrade(grade.id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa khối lớp');
      }
    }
  };

  const handleToggleGradeStatus = async (grade: Grade) => {
    try {
      await categoryApi.updateGrade(grade.id, { isActive: !grade.isActive });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái khối lớp');
    }
  };

  const handleToggleSubjectStatus = async (subject: Subject) => {
    try {
      await categoryApi.updateSubject(subject.id, { isActive: !subject.isActive });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái môn học');
    }
  };

  // Subject Modal handlers
  const openCreateSubject = () => {
    setEditingSubject(null);
    setSubjectCode('');
    setSubjectName('');
    setSubjectIcon('Calculator');
    setSubjectColor('#3B82F6');
    setSubjectSortOrder(subjects.length + 1);
    setSubjectIsActive(true);
    setErrorMsg(null);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjectCode(subj.code);
    setSubjectName(subj.name);
    setSubjectIcon(subj.icon || 'BookOpen');
    setSubjectColor(subj.color || '#3B82F6');
    setSubjectSortOrder(subj.sortOrder || 1);
    setSubjectIsActive(subj.isActive ?? true);
    setErrorMsg(null);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) {
      setErrorMsg('Vui lòng điền mã và tên môn học');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Subject> = {
        code: subjectCode.trim().toUpperCase(),
        name: subjectName.trim(),
        icon: subjectIcon.trim(),
        color: subjectColor.trim(),
        sortOrder: subjectSortOrder,
        isActive: subjectIsActive,
      };

      if (editingSubject) {
        await categoryApi.updateSubject(editingSubject.id, payload);
      } else {
        await categoryApi.createSubject(payload);
      }

      setIsSubjectModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu môn học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subj: Subject) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn học "${subj.name}"?`)) {
      try {
        await categoryApi.deleteSubject(subj.id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa môn học');
      }
    }
  };

  const filteredGrades = grades.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-600" /> Quản Lý Khối Lớp & Môn Học
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị và thiết lập danh mục khối lớp (10, 11, 12, ĐGNL, TSA, ...) và các môn học được hiển thị trên toàn hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'grades' ? (
            <button
              onClick={openCreateGrade}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Thêm Khối Lớp Mới
            </button>
          ) : (
            <button
              onClick={openCreateSubject}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Thêm Môn Học Mới
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'grades'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Khối Lớp ({grades.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'subjects'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Môn Học ({subjects.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tab 1: Grades Table */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 w-16 text-center">STT</th>
                <th className="py-3.5 px-4">Mã Khối</th>
                <th className="py-3.5 px-4">Tên Khối Lớp</th>
                <th className="py-3.5 px-4">Mô Tả Chương Trình</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Đang tải dữ liệu khối lớp...
                  </td>
                </tr>
              ) : filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Không tìm thấy khối lớp nào
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-500">
                      {grade.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      <span className="px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                        {grade.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{grade.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {grade.description || 'Chưa có mô tả'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleGradeStatus(grade)}
                        title={grade.isActive ? 'Bấm để ẩn khối lớp này trên toàn web' : 'Bấm để hiển thị lại khối lớp này'}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                          grade.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grade.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Đã ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditGrade(grade)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGrade(grade)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Subjects Table */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 w-16 text-center">STT</th>
                <th className="py-3.5 px-4">Mã Môn</th>
                <th className="py-3.5 px-4">Tên Môn Học</th>
                <th className="py-3.5 px-4">Màu Sắc Nhận Diện</th>
                <th className="py-3.5 px-4">Icon Đại Diện</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Đang tải danh sách môn học...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Không tìm thấy môn học nào
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-500">
                      {subject.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      <span className="px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                        {subject.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{subject.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: subject.color || '#3B82F6' }}
                        />
                        <span className="font-mono text-xs text-slate-600">
                          {subject.color || '#3B82F6'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {subject.icon || 'BookOpen'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleSubjectStatus(subject)}
                        title={subject.isActive ? 'Bấm để ẩn môn học này trên toàn web' : 'Bấm để hiển thị lại môn học này'}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                          subject.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {subject.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Đã ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditSubject(subject)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Modal */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingGrade ? 'Chỉnh Sửa Khối Lớp' : 'Thêm Khối Lớp Mới'}
              </h3>
              <button
                onClick={() => setIsGradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mã Khối Lớp (viết hoa không dấu) *
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: LOP_10, LOP_11, LOP_12, DGNL, TSA"
                  value={gradeCode}
                  onChange={(e) => setGradeCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên Hiển Thị *
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: Lớp 10, Lớp 11, Lớp 12, Đánh Giá Năng Lực"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mô Tả Chương Trình
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập mô tả chương trình học..."
                  value={gradeDescription}
                  onChange={(e) => setGradeDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={gradeSortOrder}
                    onChange={(e) => setGradeSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gradeIsActive}
                      onChange={(e) => setGradeIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Cho phép hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Khối Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingSubject ? 'Chỉnh Sửa Môn Học' : 'Thêm Môn Học Mới'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mã Môn Học (viết hoa không dấu) *
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: TOAN, VAT_LY, HOA_HOC, TIENG_ANH, ..."
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên Môn Học *
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: Toán Học, Vật Lý, Hóa Học, Tiếng Anh"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600" /> Màu nhận diện
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={subjectColor}
                      onChange={(e) => setSubjectColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={subjectColor}
                      onChange={(e) => setSubjectColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tên Icon Lucide
                  </label>
                  <input
                    type="text"
                    placeholder="Calculator, Zap, ..."
                    value={subjectIcon}
                    onChange={(e) => setSubjectIcon(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={subjectSortOrder}
                    onChange={(e) => setSubjectSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subjectIsActive}
                      onChange={(e) => setSubjectIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Cho phép hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Môn Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
