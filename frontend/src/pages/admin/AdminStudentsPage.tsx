import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { adminApi } from '../../api/adminApi';
import { Student, StudentRequest, Course } from '../../types';
import {
  GraduationCap,
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  School,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  Sparkles,
  KeyRound,
  RefreshCw,
  Download
} from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';
import { Pagination } from '../../components/admin/Pagination';

const PAGE_SIZE = 20;

export const AdminStudentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');

  // Phân trang phía server
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<{ total: number; active: number; grade12: number; grade11: number; grade10: number }>({
    total: 0,
    active: 0,
    grade12: 0,
    grade11: 0,
    grade10: 0,
  });

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(12);
  const [schoolName, setSchoolName] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detail & Course Assignment Modal
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Security: Reset Password Modal
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Student | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const cData = await adminApi.getAllCourses();
      setCourses(cData || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Tải 1 trang học sinh theo bộ lọc + thống kê KPI
  const fetchStudents = async (targetPage = page) => {
    setLoading(true);
    try {
      const [pageData, statsData] = await Promise.all([
        studentApi.getStudentsPaged({
          keyword: search.trim() || undefined,
          gradeLevel: selectedGrade === 'ALL' ? undefined : (selectedGrade as number),
          page: targetPage,
          size: PAGE_SIZE,
        }),
        studentApi.getStudentsStats(),
      ]);
      setStudents(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        grade12: statsData.grade12 || 0,
        grade11: statsData.grade11 || 0,
        grade10: statsData.grade10 || 0,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại sau khi thêm/sửa/xóa: về trang đầu
  const fetchData = async () => {
    setPage(0);
    await fetchStudents(0);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Đổi khối lớp -> về trang đầu
  useEffect(() => {
    setPage(0);
    fetchStudents(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  // Tìm kiếm: debounce 400ms rồi về trang đầu
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchStudents(0);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchStudents(p);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setGradeLevel(12);
    setSchoolName('');
    setActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setEmail(student.email);
    setPassword('');
    setPhone(student.phone || '');
    setGradeLevel(student.gradeLevel || 12);
    setSchoolName(student.schoolName || '');
    setActive(student.active ?? true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên và email');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: StudentRequest = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() ? password.trim() : undefined,
        phone: phone.trim() || undefined,
        gradeLevel,
        schoolName: schoolName.trim() || undefined,
        active,
      };

      if (editingStudent) {
        await studentApi.updateStudent(editingStudent.id, payload);
      } else {
        await studentApi.createStudent(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin học sinh');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản học sinh "${student.fullName}"?`)) {
      try {
        await studentApi.deleteStudent(student.id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa học sinh');
      }
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const nextAction = student.active ? 'KHÓA' : 'MỞ KHÓA';
    if (window.confirm(`Bạn có chắc chắn muốn ${nextAction} tài khoản học sinh "${student.fullName}"?`)) {
      try {
        await studentApi.toggleStudentStatus(student.id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi cập nhật trạng thái');
      }
    }
  };

  const handleOpenResetModal = (student: Student) => {
    setResetPasswordStudent(student);
    setNewPasswordInput('');
    setResetSuccessMsg(null);
    setResetErrorMsg(null);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(res);
  };

  const handleSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStudent || !newPasswordInput.trim()) return;
    if (newPasswordInput.trim().length < 6) {
      setResetErrorMsg('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setIsResetting(true);
    setResetErrorMsg(null);
    try {
      await studentApi.resetStudentPassword(resetPasswordStudent.id, newPasswordInput.trim());
      setResetSuccessMsg(`Đã đặt lại mật khẩu cho học sinh "${resetPasswordStudent.fullName}" thành công!`);
      setTimeout(() => {
        setResetPasswordStudent(null);
        setResetSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setResetErrorMsg(err.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setIsResetting(false);
    }
  };

  const openDetailModal = async (student: Student) => {
    try {
      const full = await studentApi.getStudentById(student.id);
      setDetailStudent(full);
      setSelectedCourseToAssign('');
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải chi tiết học sinh');
    }
  };

  const handleAssignCourse = async () => {
    if (!detailStudent || !selectedCourseToAssign) return;
    setIsAssigning(true);
    try {
      await studentApi.assignCourse(detailStudent.id, Number(selectedCourseToAssign));
      // Refresh detail
      const refreshed = await studentApi.getStudentById(detailStudent.id);
      setDetailStudent(refreshed);
      setSelectedCourseToAssign('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gán khóa học');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRevokeCourse = async (courseId: number) => {
    if (!detailStudent) return;
    if (window.confirm('Bạn có chắc chắn muốn thu hồi khóa học này của học sinh?')) {
      try {
        await studentApi.revokeCourse(detailStudent.id, courseId);
        const refreshed = await studentApi.getStudentById(detailStudent.id);
        setDetailStudent(refreshed);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi thu hồi khóa học');
      }
    }
  };

  // Server đã lọc & phân trang -> dùng trực tiếp
  const filtered = students;

  const totalGrade12 = stats.grade12;
  const totalGrade11 = stats.grade11;
  const totalGrade10 = stats.grade10;
  const totalActive = stats.active;

  const handleExportStudents = async () => {
    // Xuất toàn bộ học sinh khớp bộ lọc hiện tại (không chỉ trang đang xem)
    let list: Student[] = [];
    try {
      list = await studentApi.getAllStudents({
        keyword: search.trim() || undefined,
        gradeLevel: selectedGrade === 'ALL' ? undefined : (selectedGrade as number),
      });
    } catch {
      alert('Không tải được danh sách học sinh để xuất file.');
      return;
    }
    if (list.length === 0) {
      alert('Không có học sinh nào để xuất file!');
      return;
    }
    exportToCsv<Student>(
      list,
      [
        { header: 'ID', accessor: s => s.id },
        { header: 'Họ và tên', accessor: s => s.fullName },
        { header: 'Email', accessor: s => s.email },
        { header: 'Số điện thoại', accessor: s => s.phone || '' },
        { header: 'Khối lớp', accessor: s => s.gradeLevel ? `Lớp ${s.gradeLevel}` : '' },
        { header: 'Trường học', accessor: s => s.schoolName || '' },
        { header: 'Số khóa học sở hữu', accessor: s => s.enrolledCoursesCount || 0 },
        { header: 'Số bài kiểm tra đã làm', accessor: s => s.quizSubmissionsCount || 0 },
        { header: 'Trạng thái', accessor: s => s.active ? 'Đang hoạt động' : 'Đã khóa' },
        { header: 'Ngày tham gia', accessor: s => s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '' },
      ],
      'Danh_sach_hoc_sinh_EduStudy'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" /> Quản lý học viên & sinh viên
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh Sách Học Sinh & Sinh Viên ({totalElements})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị thông tin học viên, trường THPT, khối lớp, phân quyền, gán khóa học và theo dõi lịch sử học tập.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportStudents}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Xuất danh sách học sinh ra file Excel / CSV (hỗ trợ tiếng Việt)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel / CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Học Sinh Mới
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Tổng học sinh</div>
            <div className="text-xl font-black text-slate-800">{stats.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Đang hoạt động</div>
            <div className="text-xl font-black text-emerald-600">{totalActive}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Khối Lớp 12</div>
            <div className="text-xl font-black text-purple-600">{totalGrade12}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Khối Lớp 10 & 11</div>
            <div className="text-xl font-black text-amber-600">{totalGrade10 + totalGrade11}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt, trường..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'Tất cả', value: 'ALL' },
            { label: 'Lớp 12', value: 12 },
            { label: 'Lớp 11', value: 11 },
            { label: 'Lớp 10', value: 10 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setSelectedGrade(item.value as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedGrade === item.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <th className="py-3.5 px-4">Học sinh</th>
              <th className="py-3.5 px-4">Khối lớp & Trường THPT</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4 text-center">Khóa học đã kích hoạt</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách học sinh...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Không tìm thấy học sinh nào phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px]">
                        Lớp {student.gradeLevel || 12}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{student.schoolName || 'Chưa cập nhật trường'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {student.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {student.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openDetailModal(student)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition text-xs inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> {student.enrolledCoursesCount} khóa học
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(student)}
                      title={student.active ? 'Bấm để khóa tài khoản' : 'Bấm để mở khóa tài khoản'}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                        student.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {student.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Đã khóa
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleToggleStatus(student)}
                      className={`p-1.5 rounded-lg transition ${
                        student.active
                          ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={student.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {student.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenResetModal(student)}
                      className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Đặt lại mật khẩu cho học sinh"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDetailModal(student)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Xem chi tiết & Gán khóa học"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Chỉnh sửa thông tin"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Create / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingStudent ? 'Chỉnh Sửa Học Sinh' : 'Thêm Tài Khoản Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: Nguyễn Minh Anh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email đăng nhập *
                </label>
                <input
                  type="email"
                  placeholder="ví dụ: hocsinh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingStudent ? 'Đặt lại mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu khởi tạo'}
                </label>
                <input
                  type="password"
                  placeholder={editingStudent ? 'Nhập mật khẩu mới...' : 'Mặc định: student123'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={12}>Lớp 12 (Thi THPT QG)</option>
                    <option value={11}>Lớp 11</option>
                    <option value={10}>Lớp 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Trường THPT
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: THPT Chuyên Hà Nội - Amsterdam"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Tài khoản đang hoạt động bình thường
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail & Course Enrollments Modal */}
      {isDetailOpen && detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={detailStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={detailStudent.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h3 className="font-bold text-base">{detailStudent.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    {detailStudent.email} &bull; Lớp {detailStudent.gradeLevel} &bull; {detailStudent.schoolName || 'Chưa có trường'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Direct Grant Course Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Gán trực tiếp khóa học mới cho học sinh
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedCourseToAssign}
                    onChange={(e) => setSelectedCourseToAssign(Number(e.target.value) || '')}
                    className="flex-1 w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Chọn khóa học cần gán --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [Lớp {c.grade} - {c.subject}] {c.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignCourse}
                    disabled={!selectedCourseToAssign || isAssigning}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isAssigning ? 'Đang gán...' : 'Gán quyền truy cập'}
                  </button>
                </div>
              </div>

              {/* List of Enrolled Courses */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span>Khóa học đã kích hoạt ({detailStudent.enrolledCourses?.length || 0})</span>
                </h4>

                {!detailStudent.enrolledCourses || detailStudent.enrolledCourses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl text-xs">
                    Học sinh này chưa kích hoạt khóa học nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailStudent.enrolledCourses.map((enr) => (
                      <div
                        key={enr.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {enr.courseTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Mã: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">{enr.activationCode}</code> &bull; Tiến độ: {enr.progressPercent}%
                          </div>
                        </div>

                        <button
                          onClick={() => handleRevokeCourse(enr.courseId)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition shrink-0"
                          title="Hủy quyền truy cập"
                        >
                          Thu hồi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Student Password Modal */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Đặt Lại Mật Khẩu</h3>
                  <p className="text-[11px] text-slate-500">Cấp lại mật khẩu đăng nhập cho học sinh</p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResetPassword} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px]">Học sinh:</div>
                <div className="font-bold text-slate-800 text-sm">{resetPasswordStudent.fullName}</div>
                <div className="text-slate-500 text-[11px] font-mono">{resetPasswordStudent.email}</div>
              </div>

              {resetErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
                  {resetErrorMsg}
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                  {resetSuccessMsg}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu mới *</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Tạo tự động
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nhập tối thiểu 6 ký tự hoặc bấm 'Tạo tự động'..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mật khẩu được mã hóa an toàn bằng BCrypt trên máy chủ.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !newPasswordInput.trim()}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isResetting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
