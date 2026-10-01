import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { X, Mail, Lock, User, Phone, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(12);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        const res = await authApi.login({ email, password });
        login(res.accessToken, res.user);
        closeAuthModal();
      } else {
        const res = await authApi.register({
          email,
          password,
          fullName,
          phone,
          gradeLevel,
        });
        login(res.accessToken, res.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Thao tác không thành công, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'student') => {
    setError(null);
    setLoading(true);
    try {
      const creds =
        role === 'admin'
          ? { email: 'admin@qandastudy.com', password: 'admin123' }
          : { email: 'hocsinh@qandastudy.com', password: 'student123' };
      const res = await authApi.login(creds);
      login(res.accessToken, res.user);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập nhanh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-gradient-to-tr from-primary via-orange-500 to-orange-400 p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-yellow-200" />
          </div>
          <h3 className="text-xl font-extrabold">
            {authModalTab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Học Viên'}
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            {authModalTab === 'login'
              ? 'Đăng nhập để mua khóa học và xem bài giảng'
              : 'Tham gia cùng hơn 100.000+ học sinh trên toàn quốc'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 p-2 bg-slate-50 gap-2">
          <button
            onClick={() => {
              setError(null);
              openAuthModal('login');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setError(null);
              openAuthModal('register');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Quick Demo Login Chips */}
        <div className="px-6 pt-4 pb-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Đăng nhập nhanh thử nghiệm:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-orange-100/70 hover:bg-orange-200 text-orange-900 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-orange-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Admin Hệ Thống</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-blue-100/70 hover:bg-blue-200 text-blue-900 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Học sinh Lớp 12</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="0912..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden transition-all"
                  >
                    <option value={12}>Lớp 12</option>
                    <option value={11}>Lớp 11</option>
                    <option value={10}>Lớp 10</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-hidden transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-600 text-white font-extrabold rounded-xl shadow-md shadow-primary/25 transition-all hover:scale-101 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : authModalTab === 'login' ? (
              'Đăng Nhập Ngay'
            ) : (
              'Hoàn Tất Đăng Ký'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
