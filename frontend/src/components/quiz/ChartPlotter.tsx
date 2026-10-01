import React, { useMemo } from 'react';
import { ChartConfig } from '../../types';

interface ChartPlotterProps {
  config: ChartConfig | string | null | undefined;
  width?: number;
  height?: number;
  className?: string;
}

// Preprocess natural math expressions (e.g., 2x -> 2*x, (x-1)(x+2) -> (x-1)*(x+2))
function preprocessExpression(raw: string): string {
  let expr = raw.trim();

  // Replace power operator
  expr = expr.replace(/\^/g, '**');

  // Replace functions with Math counterparts before inserting multiplication signs
  expr = expr
    .replace(/\bsin\(/g, '__SIN__(')
    .replace(/\bcos\(/g, '__COS__(')
    .replace(/\btan\(/g, '__TAN__(')
    .replace(/\bsqrt\(/g, '__SQRT__(')
    .replace(/\babs\(/g, '__ABS__(')
    .replace(/\bln\(/g, '__LN__(')
    .replace(/\blog\(/g, '__LOG__(');

  // Insert multiplication between number and x: 2x -> 2*x, 3.5x -> 3.5*x
  expr = expr.replace(/(\d(?:\.\d+)?)\s*x/gi, '$1*x');

  // Insert multiplication between number and parentheses: 2(x -> 2*(x
  expr = expr.replace(/(\d(?:\.\d+)?)\s*\(/g, '$1*(');

  // Insert multiplication between ) and (: ) ( -> )*(
  expr = expr.replace(/\)\s*\(/g, ')*(');

  // Insert multiplication between x and (: x( -> x*(
  expr = expr.replace(/x\s*\(/gi, 'x*(');

  // Restore Math functions
  expr = expr
    .replace(/__SIN__\(/g, 'Math.sin(')
    .replace(/__COS__\(/g, 'Math.cos(')
    .replace(/__TAN__\(/g, 'Math.tan(')
    .replace(/__SQRT__\(/g, 'Math.sqrt(')
    .replace(/__ABS__\(/g, 'Math.abs(')
    .replace(/__LN__\(/g, 'Math.log(')
    .replace(/__LOG__\(/g, 'Math.log10(');

  return expr;
}

// Simple and safe math expression evaluator for function plotting
function evaluateExpression(expr: string, x: number): number | null {
  try {
    let sanitized = preprocessExpression(expr);

    // Replace variable x (ensuring word boundaries)
    sanitized = sanitized.replace(/\bx\b/gi, `(${x})`);

    // eslint-disable-next-line no-eval
    const result = Function(`"use strict"; return (${sanitized});`)();
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}

export const ChartPlotter: React.FC<ChartPlotterProps> = ({
  config: rawConfig,
  width = 460,
  height = 300,
  className = '',
}) => {
  const config: ChartConfig | null = useMemo(() => {
    if (!rawConfig) return null;
    if (typeof rawConfig === 'object') return rawConfig;
    try {
      return JSON.parse(rawConfig);
    } catch {
      return null;
    }
  }, [rawConfig]);

  if (!config) return null;

  // 1. RENDER STATISTICAL BAR / LINE / PIE CHART
  if (config.type === 'bar' && config.labels && config.datasets) {
    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const labels = config.labels;
    const dataset = config.datasets[0] || { data: [], label: 'Data', color: '#3B82F6' };
    const maxVal = Math.max(...dataset.data, 10);
    const barWidth = Math.min(40, chartW / (labels.length * 1.5));

    return (
      <div className={`flex flex-col items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm ${className}`}>
        {config.title && (
          <h4 className="text-xs font-semibold text-slate-700 mb-2">{config.title}</h4>
        )}
        <svg width={width} height={height} className="overflow-visible">
          {/* Y Axis */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" strokeWidth="1.5" />
          {/* X Axis */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Bars */}
          {dataset.data.map((val, idx) => {
            const barH = (val / maxVal) * chartH;
            const x = padding + (idx + 0.5) * (chartW / labels.length) - barWidth / 2;
            const y = height - padding - barH;
            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={dataset.color || '#3B82F6'}
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                  fontWeight="600"
                >
                  {val}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // 2. RENDER MATHEMATICAL FUNCTION PLOT (Oxy Coordinate System)
  const xMin = config.xMin ?? -5;
  const xMax = config.xMax ?? 5;
  const yMin = config.yMin ?? -5;
  const yMax = config.yMax ?? 5;

  const pad = 35;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  // Convert (x, y) math coordinate to SVG (px, py)
  const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => pad + ((yMax - y) / (yMax - yMin)) * plotH;

  const originX = toSvgX(0);
  const originY = toSvgY(0);

  // Sample points for the function curve
  const pathD = useMemo(() => {
    if (!config.expression) return '';
    const steps = 300;
    const dx = (xMax - xMin) / steps;
    let d = '';
    let isDrawing = false;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = evaluateExpression(config.expression, x);

      if (y === null || y < yMin - 15 || y > yMax + 15) {
        isDrawing = false;
        continue;
      }

      const sx = toSvgX(x);
      const sy = toSvgY(y);

      if (!isDrawing) {
        d += ` M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
        isDrawing = true;
      } else {
        d += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }
    }
    return d;
  }, [config.expression, xMin, xMax, yMin, yMax]);

  return (
    <div className={`flex flex-col items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {config.title && (
        <h4 className="text-xs font-semibold text-slate-800 mb-1">{config.title}</h4>
      )}
      <svg width={width} height={height} className="select-none overflow-hidden rounded bg-slate-50/50">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
          </marker>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: Math.floor(xMax - xMin) + 1 }).map((_, i) => {
          const x = Math.ceil(xMin) + i;
          if (x === 0) return null;
          const sx = toSvgX(x);
          return (
            <line
              key={`grid-x-${x}`}
              x1={sx}
              y1={pad}
              x2={sx}
              y2={height - pad}
              stroke="#e2e8f0"
              strokeDasharray="2,2"
            />
          );
        })}
        {Array.from({ length: Math.floor(yMax - yMin) + 1 }).map((_, i) => {
          const y = Math.ceil(yMin) + i;
          if (y === 0) return null;
          const sy = toSvgY(y);
          return (
            <line
              key={`grid-y-${y}`}
              x1={pad}
              y1={sy}
              x2={width - pad}
              y2={sy}
              stroke="#e2e8f0"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* X Axis (Ox) */}
        <line
          x1={pad - 15}
          y1={originY}
          x2={width - pad + 20}
          y2={originY}
          stroke="#475569"
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />
        <text x={width - pad + 22} y={originY + 4} fontSize="12" fill="#334155" fontWeight="600">
          x
        </text>

        {/* Y Axis (Oy) */}
        <line
          x1={originX}
          y1={height - pad + 15}
          x2={originX}
          y2={pad - 20}
          stroke="#475569"
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />
        <text x={originX + 6} y={pad - 20} fontSize="12" fill="#334155" fontWeight="600">
          y
        </text>

        {/* Origin O */}
        <text x={originX - 12} y={originY + 14} fontSize="11" fill="#64748b" fontWeight="600">
          O
        </text>

        {/* Vertical Asymptotes */}
        {config.asymptotes?.vertical?.map((va, idx) => {
          const sx = toSvgX(va);
          return (
            <g key={`va-${idx}`}>
              <line
                x1={sx}
                y1={pad}
                x2={sx}
                y2={height - pad}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text x={sx + 4} y={pad + 12} fontSize="10" fill="#ef4444">
                x = {va}
              </text>
            </g>
          );
        })}

        {/* Horizontal Asymptotes */}
        {config.asymptotes?.horizontal?.map((ha, idx) => {
          const sy = toSvgY(ha);
          return (
            <g key={`ha-${idx}`}>
              <line
                x1={pad}
                y1={sy}
                x2={width - pad}
                y2={sy}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text x={width - pad - 35} y={sy - 4} fontSize="10" fill="#ef4444">
                y = {ha}
              </text>
            </g>
          );
        })}

        {/* Function Curve */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Highlighted Points (Extrema, Intercepts) */}
        {config.points?.map((pt, idx) => {
          const sx = toSvgX(pt.x);
          const sy = toSvgY(pt.y);
          return (
            <g key={`pt-${idx}`}>
              <circle cx={sx} cy={sy} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              {pt.label && (
                <text
                  x={sx + 6}
                  y={sy - 6}
                  fontSize="10.5"
                  fill="#1e293b"
                  fontWeight="600"
                  className="bg-white/80"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
