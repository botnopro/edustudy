import React, { useState, useEffect } from 'react';
import { courseApi } from '../api/courseApi';
import { Teacher } from '../types';
import { Users, Star, Award, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await courseApi.getTeachers();
        setTeachers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-extrabold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Đội ngũ giáo viên chuyên môn cao</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Đội Ngũ Thầy Cô Đồng Hành Cùng Học Sinh
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Đội ngũ các chuyên gia, cựu giảng viên đại học, thủ khoa toàn quốc giàu kinh nghiệm bồi dưỡng học sinh giỏi và luyện thi đại học đạt điểm 9-10.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Đang tải danh sách giáo viên...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={t.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-orange-100 shadow-md mx-auto"
                    />
                    <span className="absolute bottom-1 right-2 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-primary text-white shadow-md">
                      {t.subject}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">{t.name}</h3>
                  <div className="text-xs font-bold text-primary mt-1 line-clamp-1">{t.title}</div>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed text-left">
                    {t.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  {t.achievements && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{t.achievements}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t.experienceYears || 10}+ năm kinh nghiệm</span>
                    <span className="font-bold text-amber-500">★ {t.rating?.toFixed(1) || '5.0'}</span>
                  </div>

                  <Link
                    to={`/courses?keyword=${encodeURIComponent(t.name)}`}
                    className="w-full py-2 bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem các khóa học của thầy/cô</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
