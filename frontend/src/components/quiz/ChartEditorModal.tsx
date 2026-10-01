import React, { useState } from 'react';
import { ChartConfig } from '../../types';
import { ChartPlotter } from './ChartPlotter';
import { LineChart, X, Check, RefreshCw } from 'lucide-react';

interface ChartEditorModalProps {
  isOpen: boolean;
  initialConfig?: string;
  onClose: () => void;
  onSave: (configJson: string) => void;
}

export const ChartEditorModal: React.FC<ChartEditorModalProps> = ({
  isOpen,
  initialConfig,
  onClose,
  onSave,
}) => {
  const [chartType, setChartType] = useState<'function' | 'bar'>('function');
  const [title, setTitle] = useState('Đồ thị hàm số');
  const [expression, setExpression] = useState('x^3 - 3*x');
  const [xMin, setXMin] = useState(-3);
  const [xMax, setXMax] = useState(3);
  const [yMin, setYMin] = useState(-4);
  const [yMax, setYMax] = useState(4);
  const [pointsStr, setPointsStr] = useState('-1, 2, CĐ (-1;2)\n1, -2, CT (1;-2)');
  const [asymptoteV, setAsymptoteV] = useState('');
  const [asymptoteH, setAsymptoteH] = useState('');

  // Bar chart fields
  const [barLabels, setBarLabels] = useState('Toán, Lý, Hóa, Sinh, Anh');
  const [barValues, setBarValues] = useState('85, 78, 92, 68, 88');

  // Preset templates
  const applyPreset = (preset: string) => {
    setChartType('function');
    if (preset === 'cubic') {
      setTitle('Đồ thị hàm số bậc ba y = x³ - 3x');
      setExpression('x^3 - 3*x');
      setXMin(-2.5);
      setXMax(2.5);
      setYMin(-3.5);
      setYMax(3.5);
      setPointsStr('-1, 2, CĐ (-1; 2)\n1, -2, CT (1; -2)');
      setAsymptoteV('');
      setAsymptoteH('');
    } else if (preset === 'rational') {
      setTitle('Đồ thị hàm phân thức y = (2x - 1)/(x + 1)');
      setExpression('(2*x - 1)/(x + 1)');
      setXMin(-5);
      setXMax(4);
      setYMin(-4);
      setYMax(6);
      setPointsStr('0, -1, (0; -1)\n0.5, 0, (0.5; 0)');
      setAsymptoteV('-1');
      setAsymptoteH('2');
    } else if (preset === 'quartic') {
      setTitle('Đồ thị hàm trùng phương y = x⁴ - 2x² - 1');
      setExpression('x^4 - 2*x^2 - 1');
      setXMin(-2.2);
      setXMax(2.2);
      setYMin(-3);
      setYMax(3);
      setPointsStr('0, -1, CĐ (0; -1)\n-1, -2, CT (-1; -2)\n1, -2, CT (1; -2)');
      setAsymptoteV('');
      setAsymptoteH('');
    } else if (preset === 'parabola') {
      setTitle('Đồ thị parabol y = x² - 2x - 1');
      setExpression('x^2 - 2*x - 1');
      setXMin(-2);
      setXMax(4);
      setYMin(-3);
      setYMax(5);
      setPointsStr('1, -2, Đỉnh I(1; -2)');
      setAsymptoteV('');
      setAsymptoteH('');
    } else if (preset === 'bar') {
      setChartType('bar');
      setTitle('Phổ điểm khảo sát bài thi');
      setBarLabels('Dưới 5, 5 - 7, 7 - 8, 8 - 9, 9 - 10');
      setBarValues('12, 45, 80, 55, 20');
    }
  };

  // Build current config object
  const currentConfig: ChartConfig = React.useMemo(() => {
    if (chartType === 'bar') {
      const labels = barLabels.split(',').map((s) => s.trim()).filter(Boolean);
      const data = barValues.split(',').map((s) => Number(s.trim()) || 0);
      return {
        type: 'bar',
        title,
        labels,
        datasets: [{ label: 'Số lượng', data, color: '#0ea5e9' }],
      };
    }

    const points = pointsStr
      .split('\n')
      .map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const x = Number(parts[0]);
          const y = Number(parts[1]);
          if (!isNaN(x) && !isNaN(y)) {
            return { x, y, label: parts[2] || undefined };
          }
        }
        return null;
      })
      .filter(Boolean) as Array<{ x: number; y: number; label?: string }>;

    const vert = asymptoteV
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));
    const horiz = asymptoteH
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    return {
      type: 'function',
      title,
      expression,
      xMin,
      xMax,
      yMin,
      yMax,
      points,
      asymptotes: {
        vertical: vert.length > 0 ? vert : undefined,
        horizontal: horiz.length > 0 ? horiz : undefined,
      },
    };
  }, [
    chartType,
    title,
    expression,
    xMin,
    xMax,
    yMin,
    yMax,
    pointsStr,
    asymptoteV,
    asymptoteH,
    barLabels,
    barValues,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Công cụ vẽ biểu đồ & đồ thị tọa độ Oxy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Mẫu đồ thị có sẵn
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('cubic')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
                >
                  Hàm bậc 3 (x³ - 3x)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('rational')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
                >
                  Hàm nhất biến (Tiệm cận)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('quartic')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
                >
                  Hàm trùng phương bậc 4
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('parabola')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
                >
                  Parabol bậc 2
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('bar')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
                >
                  Biểu đồ cột (Thống kê)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tiêu đề biểu đồ
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {chartType === 'function' ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Biểu thức hàm số f(x)
                  </label>
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="ví dụ: x^3 - 3*x hoặc (2*x - 1)/(x + 1)"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Dùng x^2 cho lũy thừa, sin(x), cos(x), sqrt(x), (2*x - 1)/(x + 1)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block">xMin</label>
                    <input
                      type="number"
                      value={xMin}
                      onChange={(e) => setXMin(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block">xMax</label>
                    <input
                      type="number"
                      value={xMax}
                      onChange={(e) => setXMax(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block">yMin</label>
                    <input
                      type="number"
                      value={yMin}
                      onChange={(e) => setYMin(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block">yMax</label>
                    <input
                      type="number"
                      value={yMax}
                      onChange={(e) => setYMax(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Điểm đặc biệt (Cực trị, giao điểm) - mỗi dòng 1 điểm: x, y, nhãn
                  </label>
                  <textarea
                    rows={2}
                    value={pointsStr}
                    onChange={(e) => setPointsStr(e.target.value)}
                    placeholder="-1, 2, Cực đại (-1; 2)"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tiệm cận đứng (x =)
                    </label>
                    <input
                      type="text"
                      placeholder="-1"
                      value={asymptoteV}
                      onChange={(e) => setAsymptoteV(e.target.value)}
                      className="w-full px-3 py-1 text-xs border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tiệm cận ngang (y =)
                    </label>
                    <input
                      type="text"
                      placeholder="2"
                      value={asymptoteH}
                      onChange={(e) => setAsymptoteH(e.target.value)}
                      className="w-full px-3 py-1 text-xs border rounded-lg"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Các nhãn cột (cách nhau dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={barLabels}
                    onChange={(e) => setBarLabels(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Giá trị tương ứng (cách nhau dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={barValues}
                    onChange={(e) => setBarValues(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
              </>
            )}
          </div>

          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-100/70 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 mb-2">Xem trước đồ thị</span>
            <ChartPlotter config={currentConfig} width={380} height={260} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(JSON.stringify(currentConfig));
              onClose();
            }}
            className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" /> Sử dụng biểu đồ này
          </button>
        </div>
      </div>
    </div>
  );
};
