import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;          // trang hiện tại (0-based)
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Thanh điều hướng phân trang dùng chung cho các bảng Admin.
 * Hiển thị khoảng bản ghi đang xem + các nút chuyển trang (có rút gọn khi nhiều trang).
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  className = '',
}) => {
  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  // Cửa sổ số trang quanh trang hiện tại (tối đa 5 nút số)
  const pages: number[] = [];
  const windowSize = 5;
  let start = Math.max(0, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages - 1, start + windowSize - 1);
  start = Math.max(0, Math.min(start, end - windowSize + 1));
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/60 ${className}`}>
      <div className="text-[11px] font-semibold text-slate-500">
        Hiển thị <strong className="text-slate-800">{from}</strong>–<strong className="text-slate-800">{to}</strong> trên tổng{' '}
        <strong className="text-slate-800">{totalElements}</strong> bản ghi
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {start > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="min-w-8 px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              1
            </button>
            {start > 1 && <span className="px-1 text-slate-400 text-xs">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-8 px-2 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              p === page
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {p + 1}
          </button>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span className="px-1 text-slate-400 text-xs">…</span>}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="min-w-8 px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
