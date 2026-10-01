import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import { Order, OrderStatus } from '../../types';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  BookOpen,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportToCsv } from '../../utils/exportUtils';
import { Pagination } from '../../components/admin/Pagination';

const PAGE_SIZE = 20;

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phân trang phía server
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<{ pending: number; completed: number; revenue: number }>({
    pending: 0,
    completed: 0,
    revenue: 0,
  });

  const fetchOrders = async (targetPage = page) => {
    setLoading(true);
    try {
      const [pageData, statsData] = await Promise.all([
        orderApi.getOrdersPaged({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          keyword: keyword.trim() || undefined,
          page: targetPage,
          size: PAGE_SIZE,
        }),
        orderApi.getOrdersStats(),
      ]);
      setOrders(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setStats({
        pending: statsData.pending || 0,
        completed: statsData.completed || 0,
        revenue: statsData.revenue || 0,
      });
    } catch (err: any) {
      console.error(err);
      setNotice({ type: 'error', text: 'Không thể tải danh sách đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchOrders(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOrders(0);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchOrders(p);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  };

  // DUYỆT ĐƠN HÀNG -> HỆ THỐNG TỰ ĐỘNG KÍCH HOẠT VÀO LỚP
  const handleApprove = async (order: Order) => {
    const confirmed = window.confirm(
      `Xác nhận học sinh "${order.userFullName}" đã chuyển khoản ${formatPrice(order.amount)} cho khóa học "${order.courseTitle}"?\n\nHệ thống sẽ TỰ ĐỘNG KÍCH HOẠT học sinh vào đúng lớp học này ngay tức thì mà bạn không cần phải add thủ công!`
    );
    if (!confirmed) return;

    setActionLoadingId(order.id);
    setNotice(null);
    try {
      await orderApi.approveOrder(order.id);
      setNotice({
        type: 'success',
        text: `Đã xác nhận thanh toán thành công đơn #${order.orderCode}! Học sinh "${order.userFullName}" đã được tự động duyệt vào khóa học "${order.courseTitle}" ngay lập tức.`,
      });
      await fetchOrders();
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi xác nhận đơn hàng',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // HỦY ĐƠN HÀNG
  const handleCancel = async (order: Order) => {
    const reason = window.prompt(`Nhập lý do hủy đơn hàng #${order.orderCode} (ví dụ: Chuyển sai số tiền, spam đơn...):`);
    if (reason === null) return;

    setActionLoadingId(order.id);
    setNotice(null);
    try {
      await orderApi.cancelOrder(order.id, reason);
      setNotice({
        type: 'success',
        text: `Đã hủy đơn hàng #${order.orderCode}.`,
      });
      await fetchOrders();
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi hủy đơn hàng',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Thống kê nhanh (toàn hệ thống, lấy từ server)
  const pendingCount = stats.pending;
  const completedCount = stats.completed;
  const totalRevenue = stats.revenue;

  const handleExportOrders = async () => {
    // Xuất toàn bộ đơn khớp bộ lọc hiện tại (không chỉ trang đang xem)
    let all: Order[] = [];
    try {
      all = await orderApi.getAllOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        keyword: keyword.trim() || undefined,
      });
    } catch {
      alert('Không tải được danh sách đơn hàng để xuất file.');
      return;
    }
    if (all.length === 0) {
      alert('Không có đơn hàng nào để xuất file!');
      return;
    }
    exportToCsv<Order>(
      all,
      [
        { header: 'Mã đơn hàng', accessor: o => o.orderCode },
        { header: 'Họ tên học sinh', accessor: o => o.userFullName || '' },
        { header: 'Email học sinh', accessor: o => o.userEmail || '' },
        { header: 'Số điện thoại', accessor: o => o.userPhone || '' },
        { header: 'Khóa học đăng ký', accessor: o => o.courseTitle || '' },
        { header: 'Học phí (VNĐ)', accessor: o => o.amount || 0 },
        { 
          header: 'Trạng thái', 
          accessor: o => o.status === 'COMPLETED' ? 'Đã kích hoạt' : o.status === 'PAID' ? 'Đã thanh toán' : o.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'
        },
        { header: 'Nội dung chuyển khoản', accessor: o => o.transferContent || '' },
        { header: 'Ngày tạo', accessor: o => o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '' },
        { header: 'Ngày duyệt', accessor: o => o.paidAt ? new Date(o.paidAt).toLocaleString('vi-VN') : '' },
        { header: 'Người duyệt', accessor: o => o.approvedBy || '' },
      ],
      'Yeu_cau_tham_gia_EduStudy'
    );
  };

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Thanh toán & Yêu cầu tham gia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Yêu Cầu Tham Gia Khóa Học
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ cần 1 click xác nhận thanh toán &rarr; Hệ thống tự động duyệt học sinh vào đúng khóa học ngay lập tức mà không cần tìm lớp để add!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Xuất danh sách đơn hàng ra file Excel / CSV (hỗ trợ tiếng Việt UTF-8 chuẩn)"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chờ duyệt yêu cầu</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingCount} yêu cầu</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Cần kiểm tra tiền về ngân hàng</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yêu cầu đã kích hoạt</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount} học sinh</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Học sinh đã vào học</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Doanh thu đã duyệt</span>
            <div className="text-2xl font-black text-primary mt-1">{formatPrice(totalRevenue)}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Từ các yêu cầu hoàn thành</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalElements})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ duyệt ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã duyệt tham gia ({completedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'CANCELLED'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy</span>
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên học sinh, email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition"
          />
        </form>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
          Đang tải danh sách đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Chưa có đơn hàng nào</h4>
          <p className="text-xs text-slate-400">
            Khi học sinh chọn mua khóa học qua mã VietQR, đơn hàng sẽ hiển thị ở đây để bạn xác nhận.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Mã đơn & Thời gian</th>
                  <th className="py-3.5 px-4">Học sinh đăng ký</th>
                  <th className="py-3.5 px-4">Khóa học đăng ký</th>
                  <th className="py-3.5 px-4">Số tiền & Cú pháp CK</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isCompleted = order.status === 'PAID';
                  const isCancelled = order.status === 'CANCELLED';
                  const isLoadingThis = actionLoadingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      {/* 1. Mã đơn & Thời gian */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 font-mono text-[11px]">
                            #{order.orderCode}
                          </span>
                          <button
                            onClick={() => handleCopy(order.orderCode, `code-${order.id}`)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Sao chép mã đơn"
                          >
                            {copiedId === `code-${order.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
                        </div>
                      </td>

                      {/* 2. Học sinh */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.userFullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{order.userEmail}</span>
                        </div>
                        {order.userPhone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.userPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Khóa học */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {order.courseThumbnail ? (
                            <img
                              src={order.courseThumbnail}
                              alt=""
                              className="w-10 h-8 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              KH
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/courses/${order.courseId}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-primary transition line-clamp-1 flex items-center gap-1"
                              title={order.courseTitle}
                            >
                              <span>{order.courseTitle}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </Link>
                            <Link
                              to={`/admin/courses/${order.courseId}/studio`}
                              className="text-[10px] text-blue-600 hover:underline font-bold mt-0.5 block"
                            >
                              Mở Studio lớp này &rarr;
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 4. Số tiền & Cú pháp */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-primary text-xs">
                          {formatPrice(order.amount)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px] text-slate-700 w-fit">
                          <span>{order.transferContent}</span>
                          <button
                            onClick={() => handleCopy(order.transferContent, `memo-${order.id}`)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Sao chép cú pháp"
                          >
                            {copiedId === `memo-${order.id}` ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 5. Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                            Chờ thanh toán
                          </span>
                        )}
                        {isCompleted && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đã duyệt vào lớp
                            </span>
                            {order.paidAt && (
                              <div className="text-[10px] text-slate-400">
                                {new Date(order.paidAt).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </div>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px]">
                            <XCircle className="w-3 h-3" />
                            Đã hủy
                          </span>
                        )}
                      </td>

                      {/* 6. Thao tác Duyệt (Tính năng trọng tâm) */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(order)}
                              disabled={isLoadingThis}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Xác nhận học sinh đã chuyển khoản -> Tự động duyệt vào lớp ngay tức thì!"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{isLoadingThis ? 'Đang duyệt...' : 'Xác nhận & Duyệt vào lớp'}</span>
                            </button>

                            <button
                              onClick={() => handleCancel(order)}
                              disabled={isLoadingThis}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hủy đơn hàng"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : isCompleted ? (
                          <div className="text-right text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Học sinh đã vào lớp</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Đơn đã đóng</span>
                        )}
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
        </div>
      )}

    </div>
  );
};
