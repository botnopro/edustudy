import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseApi } from '../api/courseApi';
import { categoryApi } from '../api/categoryApi';
import { Course, Grade } from '../types';
import { siteConfig } from '../config/siteConfig';
import {
  Search,
  BookOpen,
  Sparkles,
  KeyRound,
  Users,
  GraduationCap,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [gradesLoaded, setGradesLoaded] = useState(false);

  // Load active grades configured by admin
  useEffect(() => {
    categoryApi.getActiveGrades()
      .then((data) => {
        setDynamicGrades(data || []);
        setGradesLoaded(true);
      })
      .catch(() => setGradesLoaded(true));
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await courseApi.getCourses({ keyword: searchQuery.trim() });
        setSearchResults(results.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">{siteConfig.brandPrefix}</span>
                <span className="text-xl font-bold text-primary tracking-tight">{siteConfig.brandSuffix}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 -mt-1">
                {siteConfig.slogan}
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm khóa học Toán, Lý, Hóa, Thầy Chu Văn Biên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-primary/40 rounded-full outline-hidden transition-all duration-200 shadow-inner"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kết quả tìm kiếm ({searchResults.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {searchResults.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                        navigate(`/courses/${course.id}`);
                      }}
                      className="w-full p-3 text-left hover:bg-orange-50/50 flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-primary mb-0.5">
                          Lớp {course.grade} &bull; {course.teacherName}
                        </div>
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {course.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Trang chủ
            </Link>

            {/* Courses Dropdown */}
            <div className="relative" onMouseLeave={() => setIsGradeDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsGradeDropdownOpen(true)}
                onClick={() => navigate('/courses')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/courses') ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Khóa học</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isGradeDropdownOpen && (
                <div
                  onMouseEnter={() => setIsGradeDropdownOpen(true)}
                  className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <Link
                    to="/courses"
                    className="flex items-center px-4 py-2 text-xs font-bold text-primary hover:bg-primary-50 transition-colors"
                  >
                    <span>Tất cả khóa học</span>
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  {dynamicGrades.length > 0 ? (
                    dynamicGrades.map((g) => (
                      <Link
                        key={g.id || g.code}
                        to={`/courses?grade=${g.code}`}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors font-medium"
                      >
                        <span>{g.name}</span>
                      </Link>
                    ))
                  ) : !gradesLoaded ? (
                    <div className="px-4 py-2 text-xs text-slate-400">Đang tải danh mục...</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Active Course Link - Highlighted */}
            <Link
              to="/active-course"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all shadow-xs ${
                isActive('/active-course')
                  ? 'bg-primary text-white shadow-primary/30 ring-2 ring-primary/40'
                  : 'bg-primary-50 text-primary hover:bg-primary-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mua ngay</span>
            </Link>

            <Link
              to="/teachers"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/teachers') ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Giáo viên</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-courses"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/my-courses') ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Khóa học của tôi</span>
              </Link>
            )}
          </nav>

          {/* User Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.fullName}
                    </span>
                    <span className="text-[10px] font-semibold text-primary">
                      {isAdmin ? 'Quản trị viên' : `Học sinh Lớp ${user?.gradeLevel || '12'}`}
                    </span>
                  </div>
                  <img
                    src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs text-slate-600">Đăng nhập với email</div>
                      <div className="text-sm font-semibold text-slate-800 truncate">{user?.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <span>Bảo mật & Tài khoản</span>
                    </Link>

                    <Link
                      to="/my-courses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors font-medium"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Khóa học đã kích hoạt</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 bg-orange-50/60 hover:bg-orange-100 transition-colors font-bold"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Trang Quản trị Admin</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-sm shadow-primary/20 transition-all hover:shadow-md"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Trang chủ
          </Link>
          <Link
            to="/courses"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Khóa học
          </Link>
          <Link
            to="/active-course"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-bold text-primary bg-primary-50"
          >
            ✨ Mua ngay khóa học
          </Link>
          <Link
            to="/teachers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Đội ngũ giáo viên
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                🛡️ Bảo mật & Tài khoản
              </Link>
              <Link
                to="/my-courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Khóa học của tôi
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-orange-600 bg-orange-50"
            >
              🛡️ Quản trị Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
