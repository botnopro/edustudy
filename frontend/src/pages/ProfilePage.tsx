import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  GraduationCap,
  School,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('security');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(12);
  const [schoolName, setSchoolName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setGradeLevel(user.gradeLevel || 12);
      setSchoolName(user.schoolName || '');
    }
  }, [isAuthenticated, user]);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, label: 'Rất mạnh', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(newPassword);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        gradeLevel,
        schoolName: schoolName.trim() || undefined,
      });
      setProfileSuccess('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecuritySuccess(null);
    setSecurityError(null);

    if (newPassword.length < 6) {
      setSecurityError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      setSecurityLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      setSecurityLoading(false);
      return;
    }

    try {
      await authApi.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      setSecuritySuccess('Đổi mật khẩu thành công! Tài khoản của bạn đã được cập nhật bảo mật.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(null), 4000);
    } catch (err: any) {
      setSecurityError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setSecurityLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-900">Bảo mật & Tài khoản</span>
        </div>

        {/* 1. PROFILE BANNER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                alt={user.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary shadow-sm bg-orange-50"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]" title="Tài khoản hoạt động an toàn">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Tài khoản đã xác thực
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                </span>
                {user.gradeLevel && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> Lớp {user.gradeLevel}
                  </span>
                )}
                {user.schoolName && (
                  <span className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                    <School className="w-3.5 h-3.5 text-slate-400" /> {user.schoolName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center">
            <Link
              to="/my-courses"
              className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Khóa học của tôi
            </Link>
          </div>
        </div>

        {/* 2. TABS NAVIGATION */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-2">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bảo Mật Tài Khoản & Mật Khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Thông Tin Cá Nhân</span>
          </button>
        </div>

        {/* 3. TAB 1: BẢO MẬT TÀI KHOẢN (ACCOUNT SECURITY) */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: Change Password Form */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu định kỳ</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Cập Nhật Mật Khẩu Mới
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nên sử dụng mật khẩu mạnh kết hợp chữ cái, số và ký tự đặc biệt để bảo vệ tài khoản học tập của bạn.
                </p>
              </div>

              {securitySuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{securitySuccess}</span>
                </div>
              )}

              {securityError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <span className="font-semibold">{securityError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                {/* Current Password */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng..."
                      className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Mật khẩu mới (Tối thiểu 6 ký tự) *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                        <span className="font-extrabold text-slate-800">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full rounded-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full rounded-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full rounded-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={securityLoading}
                    className="w-full py-3.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{securityLoading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Security Status & Session Guard */}
            <div className="space-y-6">
              
              {/* Account Security Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Bảo vệ tài khoản</h4>
                    <p className="text-[11px] text-slate-400">Trạng thái an toàn</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600">Mã hóa mật khẩu</span>
                    <span className="font-extrabold text-emerald-600">BCrypt v2.1</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600">Phiên đăng nhập JWT</span>
                    <span className="font-extrabold text-emerald-600">Tự động hết hạn</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600">Email bảo mật</span>
                    <span className="font-extrabold text-emerald-600 truncate max-w-[120px]">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Current Device Session */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  Thiết bị & Phiên hoạt động
                </h4>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
                  <Laptop className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">Thiết bị hiện tại</div>
                    <div className="text-[11px] text-slate-500">
                      Đang hoạt động &bull; Trình duyệt Web
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold pt-1">
                      ● Phiên làm việc được bảo vệ
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất khỏi thiết bị này</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 4. TAB 2: THÔNG TIN CÁ NHÂN (PROFILE EDIT) */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                Thông Tin Cá Nhân
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cập nhật thông tin để thầy cô và trợ giảng hỗ trợ bạn trong suốt quá trình ôn luyện.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="font-semibold">{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email đăng nhập (Không thể thay đổi)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987 654 321"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Khối lớp học
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-bold"
                  >
                    <option value={12}>Lớp 12</option>
                    <option value={11}>Lớp 11</option>
                    <option value={10}>Lớp 10</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trường THPT đang theo học
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ví dụ: THPT Chu Văn An, Hà Nội"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {profileLoading ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
