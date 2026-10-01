import React from 'react';
import { Course } from '../types';
import {
  X,
  Star,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  KeyRound,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onActivate: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onActivate,
}) => {
  const navigate = useNavigate();
  if (!course) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const features = course.featuresList ? course.featuresList.split(';') : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with Background */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-white/20 text-white backdrop-blur-md">
              {course.grade === 'DGNL' ? 'ĐGNL / TSA Bách Khoa' : `Lớp ${course.grade}`}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-primary text-white">
              {course.subject}
            </span>
            {course.badge && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-400 text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {course.badge}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3">
            {course.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{course.rating?.toFixed(1) || '5.0'}</span>
              <span>({course.studentCount?.toLocaleString() || 1000} học viên)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-300" />
              <span>{course.totalLessons || 60} bài giảng chuyên sâu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-300" />
              <span>{course.totalHours || 80} giờ học video HD</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Teacher Info */}
          {course.teacher && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
              <img
                src={course.teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={course.teacher.name}
                className="w-14 h-14 rounded-full border-2 border-primary object-cover shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">{course.teacher.name}</h4>
                  <span className="text-[11px] font-semibold text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20">
                    Giảng viên chính
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{course.teacher.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.teacher.bio}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              Giới thiệu khóa học
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Target Audience */}
          {course.targetAudience && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Đối tượng phù hợp:</strong> {course.targetAudience}
              </div>
            </div>
          )}

          {/* Key Features */}
          {features.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
                Đặc quyền khóa học
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus Chapters */}
          {course.lessons && course.lessons.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Chương trình giảng dạy chi tiết</span>
                <span className="text-xs font-normal text-slate-500">{course.lessons.length} bài học mẫu</span>
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {course.lessons.map((lesson, idx) => (
                  <div key={lesson.id || idx} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayCircle className={`w-5 h-5 shrink-0 ${lesson.isFreePreview ? 'text-primary' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs text-slate-400 font-semibold">{lesson.chapterName}</div>
                        <div className="font-medium text-slate-800 truncate">{lesson.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.isFreePreview && (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-700">
                          Học thử miễn phí
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{lesson.durationMinutes || 45} phút</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Học phí trọn khóa (1 năm)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-primary">{formatPrice(course.price)}</span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-sm text-slate-400 line-through">{formatPrice(course.originalPrice)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onActivate(course);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-600 rounded-xl shadow-md shadow-primary/25 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mua ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
