import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { AdminStats } from '../../types';
import {
  BookOpen,
  Users,
  KeyRound,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 sm:p-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Trung tâm điều khiển Quản trị Hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tổng Quan Hệ Thống Quản Trị
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý dữ liệu công khai hiển thị cho khách và học sinh: Khóa học, Giáo viên, Mã kích hoạt, Banners.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khóa học</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalCourses || 0}</div>
            <Link to="/admin/courses" className="text-xs font-bold text-primary hover:underline mt-2 inline-flex items-center gap-1">
              <span>Quản lý</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã kích hoạt</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalActivationCodes || 0}</div>
            <Link to="/admin/codes" className="text-xs font-bold text-primary hover:underline mt-2 inline-flex items-center gap-1">
              <span>Tạo & Quản lý</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đội ngũ giáo viên</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalTeachers || 0}</div>
            <Link to="/admin/teachers" className="text-xs font-bold text-primary hover:underline mt-2 inline-flex items-center gap-1">
              <span>Xem danh sách</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt kích hoạt</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalActivations || 0}</div>
            <span className="text-xs font-medium text-emerald-600 mt-2 block">
              100% tự động
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
          Thao tác nhanh thường dùng
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/courses"
            className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 hover:bg-orange-100/70 transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              +
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">Thêm khóa học mới</div>
              <div className="text-xs text-slate-500">Tạo khóa học lớp 10, 11, 12</div>
            </div>
          </Link>

          <Link
            to="/admin/codes"
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/70 transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🔑
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">Tạo hàng loạt mã kích hoạt</div>
              <div className="text-xs text-slate-500">Sinh mã cho sách và chiến dịch</div>
            </div>
          </Link>

          <Link
            to="/admin/teachers"
            className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/70 transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              👨‍🏫
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">Thêm giáo viên mới</div>
              <div className="text-xs text-slate-500">Cập nhật hồ sơ & thành tích</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activations Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Nhật Ký Kích Hoạt Khóa Học Gần Đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các lượt kích hoạt thành công từ học sinh trên toàn hệ thống
            </p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary-50 px-3 py-1 rounded-full">
            Realtime
          </span>
        </div>

        {stats?.recentActivations && stats.recentActivations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Học viên</th>
                  <th className="py-3 px-6">Khóa học kích hoạt</th>
                  <th className="py-3 px-6">Mã đã dùng</th>
                  <th className="py-3 px-6">Thời gian kích hoạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentActivations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{item.userEmail}</td>
                    <td className="py-3.5 px-6 font-bold text-primary">{item.courseTitle}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-700 bg-slate-50 rounded">
                      {item.activationCode}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(item.activatedAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Chưa có lượt kích hoạt nào được ghi nhận. Hãy dùng thử mã tại trang Kích hoạt khóa học!
          </div>
        )}
      </div>

    </div>
  );
};
