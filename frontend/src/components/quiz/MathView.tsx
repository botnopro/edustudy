import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
}

// Helper: check if a line is a markdown table row (starts and ends with |)
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
}

// Helper: parse alignment from separator row like |:---|:---:|---:|
function parseAlignments(sepLine: string): Array<'left' | 'center' | 'right'> {
  const cells = sepLine
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());

  return cells.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

// Render inline content (KaTeX math, Markdown images, bold, italic, code)
const InlineContent: React.FC<{ text: string }> = ({ text }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Regex for:
    // 1. Markdown image: ![alt](url)
    // 2. Display math: $$...$$ or \[...\]
    // 3. Inline math: $...$ or \(...\)
    // 4. Standalone LaTeX environments: \begin{env}...\end{env}
    // 5. Bold: **text**
    // 6. Italic: *text*
    // 7. Inline code: `code`
    const regex = /(!\[.*?\]\(.*?\))|(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])|(\$[^$\n]+?\$|\\\([\s\S]*?\\\))|(\\begin\{(?:cases|aligned|matrix|pmatrix|bmatrix|array)\}[\s\S]*?\\end\{(?:cases|aligned|matrix|pmatrix|bmatrix|array)\})|(\*\*.*?\*\*)|(\*[^*\n]+?\*)|(`[^`\n]+?`)/g;

    const tokens: Array<{
      type: 'text' | 'image' | 'display-math' | 'inline-math' | 'bold' | 'italic' | 'code';
      value: string;
      extra?: string;
    }> = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          value: text.slice(lastIndex, match.index),
        });
      }

      const matchText = match[0];

      if (matchText.startsWith('![') && matchText.includes('](') && matchText.endsWith(')')) {
        // Markdown Image: ![alt](url)
        const alt = matchText.slice(2, matchText.indexOf(']('));
        const url = matchText.slice(matchText.indexOf('](') + 2, -1);
        tokens.push({
          type: 'image',
          value: url.trim(),
          extra: alt.trim(),
        });
      } else if (
        (matchText.startsWith('$$') && matchText.endsWith('$$')) ||
        (matchText.startsWith('\\[') && matchText.endsWith('\\]'))
      ) {
        // Display math
        const inner = matchText.startsWith('$$')
          ? matchText.slice(2, -2).trim()
          : matchText.slice(2, -2).trim();
        tokens.push({
          type: 'display-math',
          value: inner,
        });
      } else if (
        (matchText.startsWith('$') && matchText.endsWith('$')) ||
        (matchText.startsWith('\\(') && matchText.endsWith('\\)'))
      ) {
        // Inline math
        const inner = matchText.startsWith('$')
          ? matchText.slice(1, -1).trim()
          : matchText.slice(2, -2).trim();
        tokens.push({
          type: 'inline-math',
          value: inner,
        });
      } else if (matchText.startsWith('\\begin{')) {
        // Standalone KaTeX block
        tokens.push({
          type: 'display-math',
          value: matchText.trim(),
        });
      } else if (matchText.startsWith('**') && matchText.endsWith('**')) {
        // Bold
        tokens.push({
          type: 'bold',
          value: matchText.slice(2, -2),
        });
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        // Italic
        tokens.push({
          type: 'italic',
          value: matchText.slice(1, -1),
        });
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        // Code
        tokens.push({
          type: 'code',
          value: matchText.slice(1, -1),
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: 'text',
        value: text.slice(lastIndex),
      });
    }

    return tokens;
  }, [text]);

  return (
    <>
      {parts.map((token, idx) => {
        if (token.type === 'text') {
          return <span key={idx}>{token.value}</span>;
        }

        if (token.type === 'image') {
          return (
            <span key={idx} className="block my-2 text-center">
              <img
                src={token.value}
                alt={token.extra || 'Minh họa'}
                className="inline-block max-h-72 max-w-full rounded-xl border border-slate-200 shadow-sm object-contain bg-white"
                loading="lazy"
              />
              {token.extra && (
                <span className="block text-[11px] text-slate-500 italic mt-1">{token.extra}</span>
              )}
            </span>
          );
        }

        if (token.type === 'bold') {
          return (
            <strong key={idx} className="font-bold text-slate-900">
              <InlineContent text={token.value} />
            </strong>
          );
        }

        if (token.type === 'italic') {
          return (
            <em key={idx} className="italic text-slate-800">
              <InlineContent text={token.value} />
            </em>
          );
        }

        if (token.type === 'code') {
          return (
            <code
              key={idx}
              className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200"
            >
              {token.value}
            </code>
          );
        }

        // KaTeX Math rendering
        const isDisplay = token.type === 'display-math';
        try {
          const html = katex.renderToString(token.value, {
            displayMode: isDisplay,
            throwOnError: false,
            errorColor: '#ef4444',
            trust: true,
            strict: false,
          });

          return (
            <span
              key={idx}
              className={
                isDisplay
                  ? 'block my-3 text-center overflow-x-auto py-1.5 px-2 bg-slate-50/50 rounded-lg'
                  : 'inline-block px-1 align-baseline'
              }
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code key={idx} className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded text-xs font-mono">
              {token.value}
            </code>
          );
        }
      })}
    </>
  );
};

export const MathView: React.FC<MathViewProps> = ({ content, className = '' }) => {
  // Parse content into blocks: Markdown Tables vs Regular Paragraphs
  const blocks = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const result: Array<
      | { type: 'table'; headers: string[]; alignments: Array<'left' | 'center' | 'right'>; rows: string[][] }
      | { type: 'paragraph'; lines: string[] }
    > = [];

    let currentTableLines: string[] = [];
    let currentParagraphLines: string[] = [];

    const flushParagraph = () => {
      if (currentParagraphLines.length > 0) {
        result.push({
          type: 'paragraph',
          lines: [...currentParagraphLines],
        });
        currentParagraphLines = [];
      }
    };

    const flushTable = () => {
      if (currentTableLines.length >= 2) {
        const headerLine = currentTableLines[0];
        const sepLine = currentTableLines[1];
        const dataLines = currentTableLines.slice(2);

        // Check if sepLine is a separator line (contains | and ---)
        if (sepLine.includes('-') && sepLine.startsWith('|')) {
          const headers = headerLine
            .trim()
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());

          const alignments = parseAlignments(sepLine);

          const rows = dataLines.map((row) =>
            row
              .trim()
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim())
          );

          result.push({
            type: 'table',
            headers,
            alignments,
            rows,
          });
          currentTableLines = [];
          return;
        }
      }

      // If not a valid table, treat as regular text
      if (currentTableLines.length > 0) {
        currentParagraphLines.push(...currentTableLines);
        currentTableLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isTableRow(line)) {
        flushParagraph();
        currentTableLines.push(line);
      } else {
        flushTable();
        currentParagraphLines.push(line);
      }
    }

    flushTable();
    flushParagraph();

    return result;
  }, [content]);

  return (
    <div className={`math-view leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          return (
            <div
              key={bIdx}
              className="my-4 overflow-x-auto rounded-xl border border-slate-300 shadow-sm bg-white"
            >
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-300">
                    {block.headers.map((h, hIdx) => {
                      const align = block.alignments[hIdx] || 'left';
                      const alignClass =
                        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                      return (
                        <th
                          key={hIdx}
                          className={`px-3.5 py-2 font-bold border-r border-slate-300 last:border-r-0 ${alignClass}`}
                        >
                          <InlineContent text={h} />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {block.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/40 hover:bg-slate-100/50'}
                    >
                      {row.map((cell, cIdx) => {
                        const align = block.alignments[cIdx] || 'left';
                        const alignClass =
                          align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                        return (
                          <td
                            key={cIdx}
                            className={`px-3.5 py-2 border-r border-slate-200 last:border-r-0 ${alignClass}`}
                          >
                            <InlineContent text={cell} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Paragraph block
        return (
          <div key={bIdx} className="space-y-1 my-1">
            {block.lines.map((line, lIdx) => (
              <div key={lIdx} className="min-h-[1.25rem]">
                <InlineContent text={line} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
