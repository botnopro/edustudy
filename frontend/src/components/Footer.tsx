import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Award, BookCheck, Sparkles, GraduationCap } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-center gap-4 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Thầy Cô Thủ Khoa & Chuyên Gia</h4>
              <p className="text-xs text-slate-400 mt-1">Đội ngũ giáo viên luyện thi đại học hàng đầu Việt Nam</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <BookCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Chương Trình Chuẩn Bộ GD&ĐT</h4>
              <p className="text-xs text-slate-400 mt-1">Bám sát 100% ma trận đề thi Tốt nghiệp THPT & Đánh giá năng lực</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Kích Hoạt Tức Thì 24/7</h4>
              <p className="text-xs text-slate-400 mt-1">Nhập mã kích hoạt một lần duy nhất, học ngay trên mọi thiết bị</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold text-white">{siteConfig.brandPrefix}</span>
                <span className="text-xl font-bold text-primary">{siteConfig.brandSuffix}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              {siteConfig.description} Sát cánh toàn diện cùng sĩ tử trên hành trình chinh phục mọi nguyện vọng vào các trường Đại học danh tiếng hàng đầu Việt Nam.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>Hotline: <strong className="text-white">{siteConfig.contact.hotline}</strong> ({siteConfig.contact.hotlineHours})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>Email: <strong className="text-white">{siteConfig.contact.email}</strong></span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Links: Khóa học */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Chương trình học
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses?grade=12" className="hover:text-white transition-colors">
                  Khóa học Lớp 12 & Luyện thi THPT
                </Link>
              </li>
              <li>
                <Link to="/courses?grade=11" className="hover:text-white transition-colors">
                  Khóa học Lớp 11 - Nền tảng vững
                </Link>
              </li>
              <li>
                <Link to="/courses?grade=10" className="hover:text-white transition-colors">
                  Khóa học Lớp 10 - Khởi đầu cấp 3
                </Link>
              </li>
              <li>
                <Link to="/courses?grade=DGNL" className="hover:text-white transition-colors">
                  Đánh giá năng lực HSA & APT
                </Link>
              </li>
              <li>
                <Link to="/courses?grade=DGNL" className="hover:text-white transition-colors">
                  Đánh giá tư duy TSA Bách Khoa
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Hỗ trợ & Kích hoạt */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Kích hoạt & Trợ giúp
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="text-primary font-bold hover:underline flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mua ngay
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-white transition-colors">
                  Đội ngũ Giáo viên giảng dạy
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp FAQ
                </a>
              </li>
              <li>
                <Link to="/active-course#steps" className="hover:text-white transition-colors">
                  Hướng dẫn kích hoạt mã
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Chính sách & Quy định
            </h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Điều khoản dịch vụ & Bảo mật</li>
              <li>Chính sách hoàn tiền học phí</li>
              <li>Quy trình tiếp nhận khiếu nại</li>
              <li>Chính sách vận chuyển sách</li>
              <li>Hướng dẫn học qua website & app</li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            {siteConfig.copyright}
          </div>
          <div className="flex gap-4">
            <span>{siteConfig.license}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
