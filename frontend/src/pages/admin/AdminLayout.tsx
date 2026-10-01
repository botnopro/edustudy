import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  KeyRound,
  Users,
  Image,
  HelpCircle,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Layers
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Yêu cầu quyền Quản trị viên (Admin)</h2>
          <p className="text-xs text-slate-400 mb-6">
            Bạn cần đăng nhập bằng tài khoản có quyền Quản trị để quản lý dữ liệu khóa học, mã kích hoạt và nội dung website.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-extrabold rounded-xl transition-all shadow-md"
            >
              Đăng nhập tài khoản Admin
            </button>
            <Link
              to="/"
              className="block w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Quay về trang chủ người dùng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', label: 'Tổng quan hệ thống', icon: LayoutDashboard, exact: true },
    { path: '/admin/students', label: 'Quản lý Học sinh / SV', icon: GraduationCap },
    { path: '/admin/courses', label: 'Quản lý Khóa học', icon: BookOpen },
    { path: '/admin/categories', label: 'Khối lớp & Môn học', icon: Layers },
    { path: '/admin/codes', label: 'Quản lý Mã kích hoạt', icon: KeyRound },
    { path: '/admin/teachers', label: 'Quản lý Giáo viên', icon: Users },
    { path: '/admin/banners', label: 'Banner & Quảng cáo', icon: Image },
    { path: '/admin/faqs', label: 'FAQ & Đánh giá 9+', icon: HelpCircle },
  ];

  const isCurrent = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-white text-base">EDU</span>
              <span className="font-bold text-primary text-base">ADMIN</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Control Center
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Quản trị dữ liệu
          </div>
          {menuItems.map((item) => {
            const active = isCurrent(item.path, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User & Links Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Xem trang Web User</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-primary/40 object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.fullName}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Admin Quản Trị</div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
