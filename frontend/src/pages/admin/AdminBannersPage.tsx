import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Banner } from '../../types';
import { Image, Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('ƯU ĐÃI NĂM HỌC MỚI');
  const [imageUrl, setImageUrl] = useState('');
  const [actionText, setActionText] = useState('Kích hoạt ngay');
  const [actionLink, setActionLink] = useState('/active-course');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('ƯU ĐÃI NĂM HỌC MỚI');
    setImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80');
    setActionText('Kích hoạt ngay');
    setActionLink('/active-course');
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || '');
    setImageUrl(b.imageUrl || '');
    setActionText(b.actionText || 'Xem ngay');
    setActionLink(b.actionLink || '/active-course');
    setSortOrder(b.sortOrder || 1);
    setIsActive(b.isActive ?? true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title,
      subtitle,
      badge,
      imageUrl,
      actionText,
      actionLink,
      sortOrder: Number(sortOrder),
      isActive,
    };

    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, payload);
      } else {
        await adminApi.createBanner(payload);
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, bTitle: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa banner "${bTitle}" không?`)) {
      return;
    }
    try {
      await adminApi.deleteBanner(id);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa banner');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Image className="w-4 h-4" />
            <span>Nội dung giao diện trang chủ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Banner & Quảng Cáo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Các banner và thông điệp nổi bật hiển thị cho khách và người dùng chưa đăng nhập khi truy cập website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 transition-all self-start sm:self-auto hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm banner mới</span>
        </button>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Đang tải banner...</p>
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-21/9 bg-slate-900 overflow-hidden">
                  <img
                    src={b.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'}
                    alt={b.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                    {b.badge && (
                      <span className="self-start px-2 py-0.5 text-[10px] font-extrabold bg-primary rounded-md mb-1 shadow">
                        {b.badge}
                      </span>
                    )}
                    <h3 className="font-black text-base line-clamp-1">{b.title}</h3>
                    <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{b.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Nút bấm: <strong className="text-slate-800">{b.actionText}</strong></span>
                    <span>Đường dẫn: <strong className="text-primary">{b.actionLink}</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {b.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-slate-600 hover:text-primary hover:bg-white rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          Chưa có banner nào được tạo.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingBanner ? 'Sửa Banner' : 'Tạo Banner Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề chính *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="KÍCH HOẠT KHÓA HỌC THPT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả phụ</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Mở cánh cửa bước vào Đại học top đầu..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Huy hiệu (Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="ƯU ĐÃI NĂM HỌC MỚI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh Banner URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhãn nút bấm (Button text)</label>
                  <input
                    type="text"
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder="Kích hoạt ngay"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Liên kết nút bấm (Link)</label>
                  <input
                    type="text"
                    value={actionLink}
                    onChange={(e) => setActionLink(e.target.value)}
                    placeholder="/active-course"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="bActive" className="font-bold text-slate-700">
                  Hiển thị banner này trên website
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
