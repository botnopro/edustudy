import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { FaqItem, Testimonial } from '../../types';
import {
  HelpCircle,
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  Award,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

export const AdminFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'faq' | 'testimonial'>('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // FAQ Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('ACTIVATION');
  const [faqSortOrder, setFaqSortOrder] = useState(1);
  const [faqIsActive, setFaqIsActive] = useState(true);

  // Testimonial Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Testimonial | null>(null);
  const [studentName, setStudentName] = useState('');
  const [school, setSchool] = useState('');
  const [score, setScore] = useState('');
  const [content, setContent] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [courseName, setCourseName] = useState('');
  const [testSortOrder, setTestSortOrder] = useState(1);
  const [testIsActive, setTestIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fData, tData] = await Promise.all([
        adminApi.getAllFaqs(),
        adminApi.getAllTestimonials(),
      ]);
      setFaqs(fData || []);
      setTestimonials(tData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FAQ Handlers
  const openCreateFaq = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory(selectedCategory !== 'ALL' ? selectedCategory : 'ACTIVATION');
    setFaqSortOrder(faqs.length + 1);
    setFaqIsActive(true);
    setErrorMsg(null);
    setIsFaqModalOpen(true);
  };

  const openEditFaq = (f: FaqItem) => {
    setEditingFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category || 'ACTIVATION');
    setFaqSortOrder(f.sortOrder ?? 1);
    setFaqIsActive(f.isActive ?? true);
    setErrorMsg(null);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const payload = {
      question,
      answer,
      category,
      sortOrder: Number(faqSortOrder),
      isActive: faqIsActive,
    };
    try {
      if (editingFaq) {
        await adminApi.updateFaq(editingFaq.id, payload);
      } else {
        await adminApi.createFaq(payload);
      }
      setIsFaqModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFaqStatus = async (id: number) => {
    try {
      await adminApi.toggleFaqStatus(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi trạng thái FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await adminApi.deleteFaq(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Testimonial Handlers
  const openCreateTest = () => {
    setEditingTest(null);
    setStudentName('');
    setSchool('');
    setScore('29.0 Điểm Khối A00');
    setContent('Nhờ tham gia khóa học trực tuyến mà em đã nắm vững các công thức giải nhanh và đỗ nguyện vọng 1.');
    setAvatarUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80');
    setTargetExam('Thủ khoa ĐH Bách Khoa');
    setCourseName('Khóa PRO-X Toán 12');
    setTestSortOrder(testimonials.length + 1);
    setTestIsActive(true);
    setErrorMsg(null);
    setIsTestModalOpen(true);
  };

  const openEditTest = (t: Testimonial) => {
    setEditingTest(t);
    setStudentName(t.studentName);
    setSchool(t.school || '');
    setScore(t.score || '');
    setContent(t.content);
    setAvatarUrl(t.avatarUrl || '');
    setTargetExam(t.targetExam || '');
    setCourseName(t.courseName || '');
    setTestSortOrder(t.sortOrder ?? 1);
    setTestIsActive(t.isActive ?? true);
    setErrorMsg(null);
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const payload = {
      studentName,
      school,
      score,
      content,
      avatarUrl,
      targetExam,
      courseName,
      sortOrder: Number(testSortOrder),
      isActive: testIsActive,
    };
    try {
      if (editingTest) {
        await adminApi.updateTestimonial(editingTest.id, payload);
      } else {
        await adminApi.createTestimonial(payload);
      }
      setIsTestModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await adminApi.deleteTestimonial(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((f) => {
    const matchSearch =
      !faqSearch.trim() ||
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase());

    if (!matchSearch) return false;
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Nội dung hỗ trợ & Tin cậy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý FAQ & Đánh Giá Học Sinh 9+
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các câu hỏi thường gặp và thành tích học viên hiển thị trên trang Kích hoạt khóa học.
          </p>
        </div>

        <button
          onClick={activeTab === 'faq' ? openCreateFaq : openCreateTest}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 transition-all self-start sm:self-auto hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'faq' ? 'Thêm câu hỏi FAQ' : 'Thêm gương mặt 9+'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-6 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
            activeTab === 'faq'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Câu hỏi thường gặp FAQ ({faqs.length})
        </button>
        <button
          onClick={() => setActiveTab('testimonial')}
          className={`pb-3 px-6 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
            activeTab === 'testimonial'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Gương mặt Thủ khoa & 9+ ({testimonials.length})
        </button>
      </div>

      {/* Tab 1: FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm trong câu hỏi hoặc câu trả lời..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'ACTIVATION', label: 'Kích hoạt' },
                { id: 'COURSE', label: 'Khóa học' },
                { id: 'PAYMENT', label: 'Thanh toán' },
                { id: 'ACCOUNT', label: 'Tài khoản' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of FAQs */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Đang tải danh sách FAQ...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((f) => (
                <div
                  key={f.id}
                  className={`bg-white p-5 rounded-2xl border shadow-xs flex items-start justify-between gap-4 transition-all ${
                    f.isActive ? 'border-slate-200/80' : 'border-slate-300 bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[10px] text-primary bg-primary-50 px-2 py-0.5 rounded">
                        {f.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Thứ tự: #{f.sortOrder ?? 0}
                      </span>
                      {!f.isActive && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          Đang ẩn
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{f.question}</h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{f.answer}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFaqStatus(f.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        f.isActive
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={f.isActive ? 'Ẩn câu hỏi này' : 'Hiển thị câu hỏi'}
                    >
                      {f.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditFaq(f)}
                      className="p-1.5 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Không có câu hỏi FAQ nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Testimonials */}
      {activeTab === 'testimonial' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                    alt={t.studentName}
                    className="w-12 h-12 rounded-2xl object-cover border border-primary/20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">{t.studentName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{t.school}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[10px] rounded-lg border border-amber-200/60">
                      {t.score}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 italic line-clamp-3 leading-relaxed">
                  "{t.content}"
                </p>

                {t.courseName && (
                  <div className="mt-3 text-[10px] font-bold text-primary bg-primary-50 px-2 py-1 rounded-lg">
                    Học viên: {t.courseName}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => openEditTest(t)}
                  className="p-1.5 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                  title="Sửa"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTest(t.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingFaq ? 'Chỉnh Sửa Câu Hỏi FAQ' : 'Thêm Câu Hỏi FAQ Mới'}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề FAQ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  >
                    <option value="ACTIVATION">Kích hoạt mã</option>
                    <option value="COURSE">Khóa học & Lộ trình</option>
                    <option value="PAYMENT">Thanh toán & Học phí</option>
                    <option value="ACCOUNT">Tài khoản học sinh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={faqSortOrder}
                    onChange={(e) => setFaqSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Câu hỏi (Question) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Một mã kích hoạt dùng được cho mấy máy?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Câu trả lời (Answer) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nội dung giải đáp chi tiết cho học sinh..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Hiển thị công khai</div>
                  <div className="text-[10px] text-slate-400">Bật/tắt hiển thị câu hỏi này trên trang chủ</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faqIsActive}
                    onChange={(e) => setFaqIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTest ? 'Chỉnh Sửa Gương Mặt 9+' : 'Thêm Gương Mặt Thủ Khoa 9+'}
              </h3>
              <button onClick={() => setIsTestModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ tên học sinh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trường THPT</label>
                  <input
                    type="text"
                    placeholder="THPT Chuyên Hà Nội - Amsterdam"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm thi / Thành tích *</label>
                  <input
                    type="text"
                    required
                    placeholder="29.25 Khối A00 (Toán 10)"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu / Trường đỗ</label>
                <input
                  type="text"
                  placeholder="Thủ khoa ĐH Ngoại Thương, Á khoa ĐH Y..."
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khóa học đã theo học</label>
                <input
                  type="text"
                  placeholder="PRO-X Toán 12, VIP Vật Lý 12..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh đại diện học sinh</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lời chia sẻ / Cảm nghĩ *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chia sẻ phương pháp học và cảm nhận về khóa học..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
