import React from 'react';
import { ActivationResponse } from '../types';
import { CheckCircle2, Sparkles, BookOpen, Clock, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivationSuccessModalProps {
  result: ActivationResponse | null;
  onClose: () => void;
}

export const ActivationSuccessModal: React.FC<ActivationSuccessModalProps> = ({
  result,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!result || !result.success) return null;

  const { course } = result;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="w-16 h-16 bg-white text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black">KÍCH HOẠT THÀNH CÔNG!</h3>
          <p className="text-emerald-100 text-sm mt-1">
            Khóa học đã được mở khóa và lưu vào tài khoản của bạn.
          </p>
        </div>

        {/* Course Card Preview */}
        <div className="p-6 space-y-5 text-left">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-4 items-center">
            <img
              src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=300&q=80'}
              alt={course.title}
              className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary-100 text-primary">
                Lớp {course.grade} &bull; {course.subject}
              </span>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1">
                {course.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Giảng viên: {course.teacherName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100">
              <div className="text-slate-400 font-medium">Mã đã dùng</div>
              <div className="font-extrabold text-primary text-sm mt-0.5">{result.activationCode}</div>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <div className="text-slate-400 font-medium">Thời hạn học</div>
              <div className="font-extrabold text-emerald-700 text-sm mt-0.5">1 năm (365 ngày)</div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate('/my-courses');
            }}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-600 text-white font-extrabold rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-101 flex items-center justify-center gap-2"
          >
            <span>Vào học ngay tại Khóa học của tôi</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
