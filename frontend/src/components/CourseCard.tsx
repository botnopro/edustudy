import React from 'react';
import { Course } from '../types';
import { Star, Users, Clock, BookOpen, KeyRound, Sparkles } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelect?: (course: Course) => void;
  onActivateDirectly?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  onActivateDirectly,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'TOAN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VAT_LY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HOA_HOC':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SINH_HOC':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'TIENG_ANH':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'NGU_VAN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getBadgeLabel = (badge: string) => {
    const map: Record<string, string> = {
      BEST_SELLER: 'Bán chạy',
      HOT: 'Hot',
      NEW: 'Mới',
      TRENDING: 'Xu hướng',
    };
    if (map[badge]) return map[badge];
    // Prettify arbitrary admin-defined badges like "PRO_2026" -> "Pro 2026"
    return badge
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getSubjectName = (subject: string) => {
    switch (subject) {
      case 'TOAN': return 'Toán Học';
      case 'VAT_LY': return 'Vật Lý';
      case 'HOA_HOC': return 'Hóa Học';
      case 'SINH_HOC': return 'Sinh Học';
      case 'TIENG_ANH': return 'Tiếng Anh';
      case 'NGU_VAN': return 'Ngữ Văn';
      case 'TONG_HOP': return 'ĐGNL / ĐGTD';
      default: return subject;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-soft-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ease-smooth flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Grade Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
            {course.grade === 'DGNL' ? 'ĐGNL / TSA' : `Lớp ${course.grade}`}
          </span>
          {course.badge && (
            <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg bg-primary text-white shadow-md shadow-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {getBadgeLabel(course.badge)}
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {course.discountPercent && course.discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-xs px-2 py-1 rounded-md shadow-md">
            -{course.discountPercent}%
          </div>
        )}

        {/* Teacher Avatar Overlay */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
          <img
            src={course.teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={course.teacherName || 'Teacher'}
            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-md"
          />
          <span className="text-xs font-semibold text-white drop-shadow-md">
            {course.teacherName || course.teacher?.name}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Subject & Stats */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getSubjectColor(course.subject)}`}>
              {getSubjectName(course.subject)}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 font-normal">({course.studentCount?.toLocaleString() || 1000})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect && onSelect(course)}
            className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
            title={course.title}
          >
            {course.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalLessons || 60} bài giảng</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalHours || 80} giờ học</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-primary leading-tight">
              {formatPrice(course.price)}
            </div>
            {course.originalPrice && course.originalPrice > course.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatPrice(course.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect && onSelect(course)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Chi tiết
            </button>
            <button
              onClick={() => onActivateDirectly ? onActivateDirectly(course) : (onSelect && onSelect(course))}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-sm shadow-primary/20 transition-all hover:scale-102"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kích hoạt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
