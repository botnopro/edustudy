import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Link as LinkIcon, Clipboard } from 'lucide-react';

interface ImagePasteZoneProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
}

export const ImagePasteZone: React.FC<ImagePasteZoneProps> = ({
  value = '',
  onChange,
  label = 'Hình ảnh đính kèm (Dán ảnh Ctrl+V / Tải file / Nhập URL)',
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Ctrl+V paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (base64) {
              onChange(base64);
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          onChange(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlBox(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Xóa ảnh
          </button>
        )}
      </div>

      {value ? (
        <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-center group">
          <img
            src={value}
            alt="Đính kèm"
            className="max-h-64 rounded object-contain border border-slate-300 shadow-sm"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-600 p-1.5 rounded-full shadow transition"
            title="Xóa hình ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          onPaste={handlePaste}
          tabIndex={0}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 focus:border-emerald-500 focus:bg-emerald-50/20 bg-slate-50/50 rounded-lg p-4 text-center transition-all cursor-pointer outline-none"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-emerald-600" />
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Nhấn <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-xs">Ctrl + V</kbd> để dán ảnh chụp màn hình
            </p>
            <p className="text-xs text-slate-400">
              hoặc nhấp chuột để chọn ảnh từ máy tính
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlBox(!showUrlBox);
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" /> Hoặc dán đường dẫn URL ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {showUrlBox && !value && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="url"
            placeholder="https://example.com/hinh-anh.png"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm"
          >
            Chèn
          </button>
        </div>
      )}
    </div>
  );
};
