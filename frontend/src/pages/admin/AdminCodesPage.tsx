import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ActivationCode, Course } from '../../types';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Search,
  Sparkles,
  X,
  Layers,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Download,
  Lock,
  Unlock,
  Pencil,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';
import { Pagination } from '../../components/admin/Pagination';

const PAGE_SIZE = 20;

export const AdminCodesPage: React.FC = () => {
  const navigate = useNavigate();
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'USED' | 'LOCKED' | 'EXPIRED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Phân trang phía server
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<{ total: number; available: number; used: number; lockedOrExpired: number }>({
    total: 0,
    available: 0,
    used: 0,
    lockedOrExpired: 0,
  });

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Single Form
  const [singleCode, setSingleCode] = useState('');
  const [singleCourseId, setSingleCourseId] = useState<number | ''>('');
  const [singleMaxUses, setSingleMaxUses] = useState(1);
  const [singleNotes, setSingleNotes] = useState('');
  const [singleExpiryPreset, setSingleExpiryPreset] = useState<'1y' | '6m' | 'forever'>('1y');

  // Batch Form
  const [batchCourseId, setBatchCourseId] = useState<number | ''>('');
  const [batchQty, setBatchQty] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('ACT-');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchExpiryPreset, setBatchExpiryPreset] = useState<'1y' | '6m' | 'forever'>('1y');

  // Edit Form
  const [editingCode, setEditingCode] = useState<ActivationCode | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState<string>('');
  const [editMaxUses, setEditMaxUses] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);

  // Tải danh sách khóa học (cho bộ lọc & form) một lần
  const fetchCourses = async () => {
    try {
      const coursesData = await adminApi.getAllCourses();
      setCourses(coursesData);
      if (coursesData.length > 0) {
        setSingleCourseId(coursesData[0].id);
        setBatchCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tải 1 trang mã kích hoạt theo bộ lọc hiện tại + thống kê KPI
  const fetchCodes = async (targetPage = page) => {
    setLoading(true);
    try {
      const [pageData, statsData] = await Promise.all([
        adminApi.getCodesPaged({
          search: search.trim() || undefined,
          courseId: selectedCourseFilter === 'ALL' ? undefined : Number(selectedCourseFilter),
          status: selectedStatusFilter === 'ALL' ? undefined : selectedStatusFilter,
          page: targetPage,
          size: PAGE_SIZE,
        }),
        adminApi.getCodesStats(),
      ]);
      setCodes(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setStats({
        total: statsData.total || 0,
        available: statsData.available || 0,
        used: statsData.used || 0,
        lockedOrExpired: statsData.lockedOrExpired || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại sau khi thêm/sửa/xóa: về trang 0 và tải lại
  const fetchData = async () => {
    setPage(0);
    await fetchCodes(0);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Khi đổi bộ lọc khóa học / trạng thái: về trang đầu
  useEffect(() => {
    setPage(0);
    fetchCodes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseFilter, selectedStatusFilter]);

  // Tìm kiếm: debounce 400ms rồi về trang đầu
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchCodes(0);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchCodes(p);
  };

  const generateClientRandomCode = (prefix = 'ACT-') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let block1 = '';
    let block2 = '';
    for (let i = 0; i < 4; i++) block1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) block2 += chars.charAt(Math.floor(Math.random() * chars.length));
    const p = prefix.endsWith('-') ? prefix : `${prefix}-`;
    return `${p}${block1}-${block2}`;
  };

  const getExpiryDateFromPreset = (preset: '1y' | '6m' | 'forever'): string | undefined => {
    if (preset === 'forever') return undefined;
    const now = new Date();
    if (preset === '1y') {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 6);
    }
    return now.toISOString();
  };

  const openSingleModal = () => {
    setSingleCode(generateClientRandomCode('ACT-'));
    setSingleMaxUses(1);
    setSingleNotes('');
    setSingleExpiryPreset('1y');
    setErrorMsg(null);
    setIsSingleModalOpen(true);
  };

  const openBatchModal = () => {
    setBatchQty(10);
    setBatchPrefix('ACT-');
    setBatchNotes('');
    setBatchExpiryPreset('1y');
    setErrorMsg(null);
    setIsBatchModalOpen(true);
  };

  const openEditModal = (codeItem: ActivationCode) => {
    setEditingCode(codeItem);
    setEditNotes(codeItem.notes || '');
    setEditMaxUses(codeItem.maxUses || 1);
    setEditIsActive(codeItem.isActive ?? true);
    setEditExpiresAt(
      codeItem.expiresAt ? new Date(codeItem.expiresAt).toISOString().split('T')[0] : ''
    );
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleExportCodesCsv = async () => {
    // Xuất toàn bộ mã khớp bộ lọc hiện tại (không chỉ trang đang xem)
    let all: ActivationCode[] = [];
    try {
      all = await adminApi.getAllCodes();
    } catch {
      alert('Không tải được danh sách mã để xuất file.');
      return;
    }
    const now = new Date();
    const kw = search.trim().toLowerCase();
    const listToExport = all.filter((c) => {
      const matchSearch =
        !kw ||
        c.code.toLowerCase().includes(kw) ||
        (c.courseTitle && c.courseTitle.toLowerCase().includes(kw)) ||
        (c.usedByEmail && c.usedByEmail.toLowerCase().includes(kw)) ||
        (c.notes && c.notes.toLowerCase().includes(kw));
      if (!matchSearch) return false;
      if (selectedCourseFilter !== 'ALL' && c.courseId !== Number(selectedCourseFilter)) return false;
      const isExhausted = c.usedCount >= c.maxUses;
      const isExpired = c.expiresAt ? new Date(c.expiresAt) <= now : false;
      const isLocked = !c.isActive;
      if (selectedStatusFilter === 'AVAILABLE') return !isExhausted && !isExpired && !isLocked;
      if (selectedStatusFilter === 'USED') return isExhausted;
      if (selectedStatusFilter === 'LOCKED') return isLocked;
      if (selectedStatusFilter === 'EXPIRED') return isExpired;
      return true;
    });
    if (listToExport.length === 0) {
      alert('Hiện không có mã kích hoạt nào để xuất file.');
      return;
    }
    exportToCsv<ActivationCode>(
      listToExport,
      [
        { header: 'Mã kích hoạt', accessor: c => c.code },
        { header: 'Khóa học áp dụng', accessor: c => c.courseTitle || '' },
        { header: 'Đã dùng', accessor: c => c.usedCount },
        { header: 'Số lượt tối đa', accessor: c => c.maxUses },
        { 
          header: 'Trạng thái', 
          accessor: c => !c.isActive ? 'Đã khóa' : (c.expiresAt && new Date(c.expiresAt) <= new Date()) ? 'Hết hạn' : (c.usedCount >= c.maxUses) ? 'Đã dùng hết' : 'Khả dụng'
        },
        { header: 'Học sinh kích hoạt gần nhất', accessor: c => c.usedByEmail || '' },
        { header: 'Ngày hết hạn', accessor: c => c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn' },
        { header: 'Ngày tạo', accessor: c => c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '' },
        { header: 'Ghi chú', accessor: c => c.notes || '' },
      ],
      'Ma_kich_hoat_EduStudy'
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleCourseId) {
      setErrorMsg('Vui lòng chọn khóa học');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await adminApi.createCode({
        code: singleCode.trim() || undefined,
        courseId: Number(singleCourseId),
        maxUses: Number(singleMaxUses),
        notes: singleNotes,
        expiresAt: getExpiryDateFromPreset(singleExpiryPreset),
      });
      setIsSingleModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tạo mã kích hoạt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCourseId) {
      setErrorMsg('Vui lòng chọn khóa học');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await adminApi.batchGenerateCodes({
        courseId: Number(batchCourseId),
        quantity: Number(batchQty),
        prefix: batchPrefix.trim().toUpperCase(),
        notes: batchNotes,
        expiresAt: getExpiryDateFromPreset(batchExpiryPreset),
      });
      setIsBatchModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi sinh hàng loạt mã');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await adminApi.updateCode(editingCode.id, {
        notes: editNotes,
        maxUses: Number(editMaxUses),
        isActive: editIsActive,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : undefined,
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi cập nhật mã');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: ActivationCode) => {
    try {
      await adminApi.toggleCodeStatus(item.id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thay đổi trạng thái mã');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã kích hoạt "${code}" không?`)) {
      return;
    }
    try {
      await adminApi.deleteCode(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa mã');
    }
  };

  // Quick stats (toàn hệ thống, lấy từ server)
  const totalCodesCount = stats.total;
  const availableCodesCount = stats.available;
  const usedCodesCount = stats.used;
  const lockedOrExpiredCount = stats.lockedOrExpired;

  // Server đã lọc & phân trang -> dùng trực tiếp danh sách trả về
  const filtered = codes;

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <KeyRound className="w-4 h-4" />
            <span>Hệ thống phân phối bản quyền & Thẻ cào</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Mã Kích Hoạt Khóa Học
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo, phân phối, theo dõi lịch sử kích hoạt và khóa/mở khóa mã thẻ học trực tuyến.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCodesCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Tải toàn bộ danh sách mã kích hoạt ra file Excel / CSV UTF-8"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel / CSV</span>
          </button>
          <button
            onClick={openSingleModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo 1 mã random</span>
          </button>
          <button
            onClick={openBatchModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Tạo hàng loạt mã</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalCodesCount}</div>
            <div className="text-xs font-semibold text-slate-500">Tổng mã phát hành</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{availableCodesCount}</div>
            <div className="text-xs font-semibold text-slate-500">Khả dụng (Chờ dùng)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-orange-600">{usedCodesCount}</div>
            <div className="text-xs font-semibold text-slate-500">Đã kích hoạt thành công</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{lockedOrExpiredCount}</div>
            <div className="text-xs font-semibold text-slate-500">Tạm khóa / Hết hạn</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, khóa học, email, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Course Dropdown Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-slate-700 font-semibold"
            >
              <option value="ALL">Tất cả khóa học ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [Lớp {c.grade}] {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tab Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          {(['ALL', 'AVAILABLE', 'USED', 'LOCKED', 'EXPIRED'] as const).map((status) => {
            const labels: Record<string, string> = {
              ALL: 'Tất cả',
              AVAILABLE: 'Khả dụng',
              USED: 'Đã dùng',
              LOCKED: 'Tạm khóa',
              EXPIRED: 'Hết hạn',
            };
            const isSel = selectedStatusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Đang tải mã kích hoạt...</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Mã kích hoạt</th>
                  <th className="py-3.5 px-4">Khóa học mở khóa</th>
                  <th className="py-3.5 px-4 text-center">Lượt dùng</th>
                  <th className="py-3.5 px-4">Người đã kích hoạt</th>
                  <th className="py-3.5 px-4">Thời hạn</th>
                  <th className="py-3.5 px-4">Ghi chú</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isExhausted = item.usedCount >= item.maxUses;
                  const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-primary bg-primary-50 px-2.5 py-1 rounded-lg border border-primary/20 tracking-wider">
                            {item.code}
                          </span>
                          <button
                            onClick={() => handleCopy(item.code)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Sao chép mã"
                          >
                            {copiedCode === item.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-slate-900 max-w-xs truncate" title={item.courseTitle}>
                        {item.courseTitle}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800">{item.usedCount}</span>
                        <span className="text-slate-400"> / {item.maxUses}</span>
                      </td>

                      <td className="py-3 px-4">
                        {item.usedByEmail ? (
                          <div>
                            <button
                              onClick={() => navigate(`/admin/students?search=${encodeURIComponent(item.usedByEmail || '')}`)}
                              className="font-bold text-slate-800 hover:text-primary flex items-center gap-1 group text-left cursor-pointer"
                              title="Bấm để xem hồ sơ và khóa học của học sinh này"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[170px]">
                                {item.usedByEmail}
                              </span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary shrink-0 transition-opacity" />
                            </button>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.usedAt ? new Date(item.usedAt).toLocaleString('vi-VN') : 'Đã kích hoạt'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Chưa sử dụng
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {item.expiresAt ? (
                          <span className={isExpired ? 'text-rose-600 font-bold' : ''}>
                            {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          'Vĩnh viễn'
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        <div className="max-w-[180px] truncate" title={item.notes || ''}>
                          {item.notes || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            !item.isActive
                              ? 'bg-slate-200 text-slate-700 border border-slate-300'
                              : isExpired
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isExhausted
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {!item.isActive
                            ? 'Tạm khóa'
                            : isExpired
                            ? 'Hết hạn'
                            : isExhausted
                            ? 'Đã dùng hết'
                            : 'Khả dụng'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              item.isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={item.isActive ? 'Khóa mã này lại' : 'Mở khóa mã này'}
                          >
                            {item.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Code Button */}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa mã (ghi chú, hạn dùng, số lượt)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(item.id, item.code)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa mã"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
          </>
        ) : (
          <div className="p-16 text-center text-slate-400 text-xs">
            <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>Không tìm thấy mã kích hoạt nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {/* Modal Single Code */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">Tạo Một Mã Kích Hoạt Mới</h3>
              <button onClick={() => setIsSingleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khóa học áp dụng *</label>
                <select
                  required
                  value={singleCourseId}
                  onChange={(e) => setSingleCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [Lớp {c.grade}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Mã kích hoạt (Ngẫu nhiên bảo mật)</label>
                  <button
                    type="button"
                    onClick={() => setSingleCode(generateClientRandomCode('ACT-'))}
                    className="text-xs font-semibold text-primary hover:text-primary-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Đổi mã ngẫu nhiên khác
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ACT-XXXX-XXXX"
                  value={singleCode}
                  onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden text-sm uppercase font-mono font-bold text-primary tracking-wider"
                />
              </div>

              {/* Security Notice: Single-Use Guarantee */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bảo mật chống dùng chung mã:</strong> Mỗi mã kích hoạt mặc định chỉ có <strong>01 lượt sử dụng duy nhất</strong> (`maxUses = 1`). Sau khi học sinh kích hoạt thành công, mã sẽ tự động khóa vĩnh viễn, người khác không thể sử dụng lại.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời hạn sử dụng</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleExpiryPreset('1y')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      singleExpiryPreset === '1y'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    1 Năm (Chuẩn)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleExpiryPreset('6m')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      singleExpiryPreset === '6m'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    6 Tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleExpiryPreset('forever')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      singleExpiryPreset === 'forever'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Vĩnh viễn
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú (nguồn phát hành / đối tác)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thẻ cào đính kèm sách Toán 12 tái bản"
                  value={singleNotes}
                  onChange={(e) => setSingleNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo mã kích hoạt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Batch Generate */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Tạo Hàng Loạt Mã Ngẫu Nhiên</h3>
                <p className="text-[11px] text-slate-500">Sinh tự động danh sách mã ngẫu nhiên độc nhất</p>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khóa học áp dụng *</label>
                <select
                  required
                  value={batchCourseId}
                  onChange={(e) => setBatchCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [Lớp {c.grade}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng mã *</label>
                  <select
                    value={batchQty}
                    onChange={(e) => setBatchQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold"
                  >
                    <option value={5}>5 mã</option>
                    <option value={10}>10 mã</option>
                    <option value={20}>20 mã</option>
                    <option value={50}>50 mã</option>
                    <option value={100}>100 mã</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiền tố mã (Prefix)</label>
                  <input
                    type="text"
                    required
                    placeholder="ACT-, PRO12-"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời hạn sử dụng</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchExpiryPreset('1y')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      batchExpiryPreset === '1y'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    1 Năm
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchExpiryPreset('6m')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      batchExpiryPreset === '6m'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    6 Tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchExpiryPreset('forever')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                      batchExpiryPreset === 'forever'
                        ? 'bg-primary-50 text-primary border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Vĩnh viễn
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đợt phát hành</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đợt in tem cào sách tháng 10/2026"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang tạo...' : `Sinh ${batchQty} mã ngay`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Code */}
      {isEditModalOpen && editingCode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Chỉnh Sửa Mã Kích Hoạt</h3>
                <span className="font-mono font-bold text-xs text-primary">{editingCode.code}</span>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCode} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Khóa học áp dụng:</div>
                <div className="font-bold text-slate-800 text-sm">{editingCode.courseTitle}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Đã sử dụng: <strong className="text-slate-900">{editingCode.usedCount}</strong> / {editingCode.maxUses} lượt
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượt sử dụng tối đa</label>
                <input
                  type="number"
                  min={editingCode.usedCount || 1}
                  value={editMaxUses}
                  onChange={(e) => setEditMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn</label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Để trống nếu muốn mã có hiệu lực vĩnh viễn.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú nguồn phát hành</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đổi cho khách hàng VIP"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Trạng thái kích hoạt</div>
                  <div className="text-[10px] text-slate-400">Cho phép hoặc tạm dừng học sinh sử dụng mã này</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
