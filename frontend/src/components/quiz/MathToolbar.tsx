import React, { useState } from 'react';
import {
  Table as TableIcon,
  Image as ImageIcon,
  Calculator,
  Compass,
  Layers,
  ChevronDown,
  X,
  Upload,
  Clipboard,
  Link as LinkIcon
} from 'lucide-react';

interface MathToolbarProps {
  onInsert: (snippet: string) => void;
}

export const MathToolbar: React.FC<MathToolbarProps> = ({ onInsert }) => {
  const [activeTab, setActiveTab] = useState<'math' | 'geo' | 'table' | 'symbols'>('math');
  const [isCustomTableOpen, setIsCustomTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(4);

  // Quick image insert modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imgAlt, setImgAlt] = useState('Hình minh họa');
  const [imgUrl, setImgUrl] = useState('');

  // Math categories
  const algebraTools = [
    { label: 'Phân số', snippet: '$\\frac{a}{b}$', desc: 'Phân số a/b' },
    { label: 'Căn bậc 2', snippet: '$\\sqrt{x}$', desc: 'Căn bậc hai' },
    { label: 'Căn bậc n', snippet: '$\\sqrt[n]{x}$', desc: 'Căn bậc n' },
    { label: 'Số mũ (x²)', snippet: '$x^{2}$', desc: 'Lũy thừa' },
    { label: 'Chỉ số (x₁)', snippet: '$x_{1}$', desc: 'Chỉ số dưới' },
    { label: 'Đạo hàm', snippet: "$y'$", desc: 'Đạo hàm bậc nhất' },
    { label: 'Tích phân', snippet: '$\\int_{a}^{b} f(x) dx$', desc: 'Tích phân xác định' },
    { label: 'Nguyên hàm', snippet: '$\\int f(x) dx$', desc: 'Nguyên hàm' },
    { label: 'Giới hạn (lim)', snippet: '$\\lim_{x \\to x_0} f(x)$', desc: 'Giới hạn' },
    { label: 'Hệ phương trình', snippet: '$\\begin{cases} 2x + y = 5 \\\\ x - 3y = 2 \\end{cases}$', desc: 'Hệ phương trình' },
    { label: 'Logarit', snippet: '$\\log_a b$', desc: 'Logarit cơ số a' },
    { label: 'Logarit tự nhiên', snippet: '$\\ln x$', desc: 'Ln x' },
    { label: 'Cộng trừ (±)', snippet: '$\\pm$', desc: 'Dấu ±' },
    { label: 'Vô cực (∞)', snippet: '$\\infty$', desc: 'Vô cực' },
    { label: 'Tương đương', snippet: '$\\Leftrightarrow$', desc: 'Dấu tương đương' },
    { label: 'Suy ra', snippet: '$\\Rightarrow$', desc: 'Dấu suy ra' },
  ];

  const geometryTools = [
    { label: 'Vector u', snippet: '$\\vec{u}$', desc: 'Vector u' },
    { label: 'Vector AB', snippet: '$\\overrightarrow{AB}$', desc: 'Vector AB' },
    { label: 'Góc ABC', snippet: '$\\widehat{ABC}$', desc: 'Góc ABC' },
    { label: 'Vuông góc', snippet: '$\\perp$', desc: 'Vuông góc' },
    { label: 'Song song', snippet: '$\\parallel$', desc: 'Song song' },
    { label: 'Tam giác', snippet: '$\\triangle ABC$', desc: 'Tam giác ABC' },
    { label: 'Độ (°)', snippet: '$90^\\circ$', desc: 'Độ góc' },
    { label: 'Alpha (α)', snippet: '$\\alpha$', desc: 'Alpha' },
    { label: 'Beta (β)', snippet: '$\\beta$', desc: 'Beta' },
    { label: 'Pi (π)', snippet: '$\\pi$', desc: 'Số pi' },
    { label: 'Delta (Δ)', snippet: '$\\Delta$', desc: 'Delta' },
    { label: 'Omega (ω)', snippet: '$\\omega$', desc: 'Omega' },
    { label: 'Ma trận', snippet: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$', desc: 'Ma trận 2x2' },
  ];

  const symbolTools = [
    { label: 'Thuộc (∈)', snippet: '$\\in$', desc: 'Thuộc tập hợp' },
    { label: 'Không thuộc (∉)', snippet: '$\\notin$', desc: 'Không thuộc' },
    { label: 'Tập con (⊂)', snippet: '$\\subset$', desc: 'Tập con' },
    { label: 'Hợp (∪)', snippet: '$\\cup$', desc: 'Hợp' },
    { label: 'Giao (∩)', snippet: '$\\cap$', desc: 'Giao' },
    { label: 'Tập rỗng (∅)', snippet: '$\\emptyset$', desc: 'Tập rỗng' },
    { label: 'Tập số thực (ℝ)', snippet: '$\\mathbb{R}$', desc: 'Tập số thực' },
    { label: 'Tập số nguyên (ℤ)', snippet: '$\\mathbb{Z}$', desc: 'Tập số nguyên' },
    { label: 'Với mọi (∀)', snippet: '$\\forall$', desc: 'Với mọi' },
    { label: 'Tồn tại (∃)', snippet: '$\\exists$', desc: 'Tồn tại' },
  ];

  // Variations & Tables templates
  const insertVariationTableCubic = () => {
    const template = `
| $x$ | $-\\infty$ | | $-1$ | | $1$ | | $+\\infty$ |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $y'$ | | $+$ | $0$ | $-$ | $0$ | $+$ | |
| $y$ | $-\\infty$ | $\\nearrow$ | $2$ | $\\searrow$ | $-2$ | $\\nearrow$ | $+\\infty$ |
`.trim();
    onInsert(template);
  };

  const insertVariationTableFraction = () => {
    const template = `
| $x$ | $-\\infty$ | | $-1$ | | $+\\infty$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| $y'$ | | $+$ | $\\parallel$ | $+$ | |
| $y$ | $2$ | $\\nearrow$ | $+\\infty \\parallel -\\infty$ | $\\nearrow$ | $2$ |
`.trim();
    onInsert(template);
  };

  const insertSignTable = () => {
    const template = `
| $x$ | $-\\infty$ | | $1$ | | $3$ | | $+\\infty$ |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $f'(x)$ | | $+$ | $0$ | $-$ | $0$ | $+$ | |
`.trim();
    onInsert(template);
  };

  const insertStatsTable = () => {
    const template = `
| Điểm số | $0 - 4$ | $5 - 6$ | $7 - 8$ | $9 - 10$ |
| :---: | :---: | :---: | :---: | :---: |
| Tần số | $5$ | $16$ | $21$ | $8$ |
`.trim();
    onInsert(template);
  };

  const handleGenerateCustomTable = () => {
    const rows = Math.max(1, Math.min(20, tableRows));
    const cols = Math.max(1, Math.min(10, tableCols));

    let header = '| ' + Array.from({ length: cols }, (_, i) => `Cột ${i + 1}`).join(' | ') + ' |';
    let separator = '| ' + Array.from({ length: cols }, () => ':---:').join(' | ') + ' |';
    let dataRows = '';

    for (let r = 1; r <= rows; r++) {
      dataRows += '\n| ' + Array.from({ length: cols }, (_, c) => `Ô ${r}.${c + 1}`).join(' | ') + ' |';
    }

    const tableMarkdown = `${header}\n${separator}${dataRows}`;
    onInsert(tableMarkdown);
    setIsCustomTableOpen(false);
  };

  const handleInsertImage = () => {
    if (!imgUrl.trim()) return;
    const snippet = `![${imgAlt.trim() || 'Hình minh họa'}](${imgUrl.trim()})`;
    onInsert(snippet);
    setImgUrl('');
    setIsImageModalOpen(false);
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
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
              setImgUrl(base64);
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
          setImgUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 space-y-2.5">
      {/* Top Bar: Tabs & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('math')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'math' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Đại số & Giải tích
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('geo')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'geo' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Hình học & Vector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-600" /> Bảng biến thiên & Bảng số liệu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('symbols')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'symbols' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Ký hiệu & Tập hợp
          </button>
        </div>

        {/* Quick Image Insertion Button */}
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Chèn ảnh vào bài (Ctrl+V / Link)
        </button>
      </div>

      {/* Tab 1: Algebra & Calculus */}
      {activeTab === 'math' && (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {algebraTools.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(t.snippet)}
              title={t.desc}
              className="px-2 py-1 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded font-mono transition shadow-sm"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: Geometry & Vectors */}
      {activeTab === 'geo' && (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {geometryTools.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(t.snippet)}
              title={t.desc}
              className="px-2 py-1 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded font-mono transition shadow-sm"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: Tables & Variation Tables */}
      {activeTab === 'table' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Mẫu bảng thông dụng:</span>
            <button
              type="button"
              onClick={insertVariationTableCubic}
              className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-md font-semibold transition shadow-sm"
            >
              + Bảng biến thiên hàm bậc 3
            </button>
            <button
              type="button"
              onClick={insertVariationTableFraction}
              className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-md font-semibold transition shadow-sm"
            >
              + Bảng biến thiên phân thức (có 2 gạch ∥)
            </button>
            <button
              type="button"
              onClick={insertSignTable}
              className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-md font-semibold transition shadow-sm"
            >
              + Bảng xét dấu đạo hàm
            </button>
            <button
              type="button"
              onClick={insertStatsTable}
              className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-md font-semibold transition shadow-sm"
            >
              + Bảng số liệu thống kê
            </button>
            <button
              type="button"
              onClick={() => setIsCustomTableOpen(true)}
              className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition shadow-sm flex items-center gap-1"
            >
              <TableIcon className="w-3 h-3" /> Tạo bảng tùy chỉnh...
            </button>
          </div>

          {/* Quick symbols for variation tables */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">Ký hiệu trong bảng:</span>
            <button
              type="button"
              onClick={() => onInsert(' $\\nearrow$ ')}
              title="Mũi tên đi lên (đồng biến)"
              className="px-2 py-0.5 text-xs bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded font-bold"
            >
              ↗ Đồng biến ($\nearrow$)
            </button>
            <button
              type="button"
              onClick={() => onInsert(' $\\searrow$ ')}
              title="Mũi tên đi xuống (nghịch biến)"
              className="px-2 py-0.5 text-xs bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded font-bold"
            >
              ↘ Nghịch biến ($\searrow$)
            </button>
            <button
              type="button"
              onClick={() => onInsert(' $\\parallel$ ')}
              title="Hai gạch không xác định"
              className="px-2 py-0.5 text-xs bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded font-bold"
            >
              ∥ Không xác định ($\parallel$)
            </button>
            <button
              type="button"
              onClick={() => onInsert(' $+\\infty$ ')}
              className="px-2 py-0.5 text-xs bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 rounded font-mono"
            >
              +∞
            </button>
            <button
              type="button"
              onClick={() => onInsert(' $-\\infty$ ')}
              className="px-2 py-0.5 text-xs bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 rounded font-mono"
            >
              -∞
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Sets & Symbols */}
      {activeTab === 'symbols' && (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {symbolTools.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(t.snippet)}
              title={t.desc}
              className="px-2 py-1 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded font-mono transition shadow-sm"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Table Dialog */}
      {isCustomTableOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-emerald-600" /> Tạo bảng số liệu tùy chỉnh
              </h4>
              <button
                type="button"
                onClick={() => setIsCustomTableOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số cột:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số hàng dữ liệu:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomTableOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGenerateCustomTable}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Chèn Bảng Vào Bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Image Insertion Dialog */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" /> Chèn hình ảnh vào nội dung
              </h4>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mô tả / Chú thích ảnh:
                </label>
                <input
                  type="text"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  placeholder="ví dụ: Đồ thị hàm số bậc ba / Hình chóp S.ABCD"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Paste or Upload Zone */}
              <div
                onPaste={handlePasteImage}
                tabIndex={0}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 p-4 rounded-xl text-center cursor-pointer bg-slate-50/50 outline-none"
              >
                <input
                  type="file"
                  accept="image/*"
                  id="toolbarImgFileInput"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="toolbarImgFileInput" className="cursor-pointer block space-y-1">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Clipboard className="w-4 h-4 text-emerald-600" />
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Nhấn <kbd className="px-1 py-0.5 bg-slate-200 rounded font-mono text-[10px]">Ctrl + V</kbd> để dán ảnh chụp màn hình
                  </p>
                  <p className="text-[11px] text-slate-400">hoặc nhấp chuột để chọn ảnh từ máy tính</p>
                </label>
              </div>

              {/* URL input */}
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Preview image */}
              {imgUrl && (
                <div className="max-h-36 overflow-hidden rounded-lg border border-slate-200 p-1 flex items-center justify-center bg-slate-50">
                  <img src={imgUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!imgUrl.trim()}
                onClick={handleInsertImage}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50"
              >
                Chèn Ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
