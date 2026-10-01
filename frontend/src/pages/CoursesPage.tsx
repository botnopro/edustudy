import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import { categoryApi } from '../api/categoryApi';
import { Course, Grade, Subject } from '../types';
import { CourseCard } from '../components/CourseCard';
import { CourseGridSkeleton } from '../components/CourseCardSkeleton';
import { Search, BookOpen, Filter, GraduationCap } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [dynamicGrades, setDynamicGrades] = useState<Grade[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentGrade = searchParams.get('grade') || 'ALL';
  const currentSubject = searchParams.get('subject') || 'ALL';
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  useEffect(() => {
    // Load active grades & subjects configured by admin (respects hidden categories strictly)
    Promise.all([
      categoryApi.getActiveGrades().catch(() => []),
      categoryApi.getActiveSubjects().catch(() => []),
    ]).then(([gData, sData]) => {
      setDynamicGrades(gData || []);
      setDynamicSubjects(sData || []);
      setCategoriesLoaded(true);
    });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getCourses({
          grade: currentGrade === 'ALL' ? undefined : currentGrade,
          subject: currentSubject === 'ALL' ? undefined : currentSubject,
          keyword: keyword.trim() || undefined,
        });
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentGrade, currentSubject, keyword]);

  const setGrade = (grade: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (grade === 'ALL') newParams.delete('grade');
    else newParams.set('grade', grade);
    setSearchParams(newParams);
  };

  const setSubject = (subject: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (subject === 'ALL') newParams.delete('subject');
    else newParams.set('subject', subject);
    setSearchParams(newParams);
  };

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Thư viện khóa học trực tuyến</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Danh Sách Khóa Học & Luyện Thi ĐGNL
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chương trình đào tạo toàn diện, bám sát cấu trúc thi mới nhất.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
          
          {/* Grade selection (Filtered strictly by admin's active grades) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Khối lớp:</span>
            <button
              onClick={() => setGrade('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentGrade === 'ALL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả khóa học
            </button>
            {dynamicGrades.length > 0 ? (
              dynamicGrades.map((g) => {
                const isSelected =
                  currentGrade === g.code ||
                  currentGrade.replace('LOP_', '') === g.code.replace('LOP_', '');
                return (
                  <button
                    key={g.code}
                    onClick={() => setGrade(g.code)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })
            ) : !categoriesLoaded ? (
              <span className="text-xs text-slate-400">Đang tải khối lớp...</span>
            ) : null}
          </div>

          {/* Subject selection - DYNAMICALLY FILTERED BY ADMIN'S ACTIVE SUBJECTS */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Môn học:</span>
            <button
              onClick={() => setSubject('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentSubject === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả môn
            </button>
            {dynamicSubjects.length > 0 ? (
              dynamicSubjects.map((subj) => (
                <button
                  key={subj.code}
                  onClick={() => setSubject(subj.code)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    currentSubject === subj.code
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {subj.name}
                </button>
              ))
            ) : !categoriesLoaded ? (
              <span className="text-xs text-slate-400">Đang tải môn học...</span>
            ) : null}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm khóa học, giáo viên..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-500">
              <span>Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden text-slate-700 font-semibold"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Học phí: Thấp đến Cao</option>
                <option value="price-desc">Học phí: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

        </div>

        {/* Results */}
        {loading ? (
          <CourseGridSkeleton count={8} />
        ) : sortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCourses.map((course, i) => (
              <div
                key={course.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
              >
                <CourseCard
                  course={course}
                  onSelect={(c) => navigate(`/courses/${c.id}`)}
                  onActivateDirectly={(c) => navigate(`/active-course?code=${c.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Không tìm thấy khóa học nào phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
          </div>
        )}

      </div>
    </div>
  );
};
