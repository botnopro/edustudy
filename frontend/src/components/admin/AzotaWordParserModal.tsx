import React, { useState, useRef } from 'react';
import { QuizQuestion } from '../../types';
import { quizApi } from '../../api/quizApi';
import { MathView } from '../quiz/MathView';
import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Cấu hình worker cho pdf.js (đóng gói cùng ứng dụng, chạy offline)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
import {
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  Layers,
  HelpCircle,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';

interface AzotaWordParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: number;
  onSuccess: () => void;
}

interface ParsedQuestionItem {
  idTemp: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

const SAMPLE_EXAM_2025 = `PHẦN I. TRẮC NGHIỆM 4 LỰA CHỌN (Chọn 1 phương án đúng A, B, C, D)
Câu 1: Cho hàm số y = f(x) có đạo hàm f'(x) = x(x - 2)^2. Điểm cực tiểu của hàm số là:
A. x = 0
B. x = 2
C. x = -2
D. Không có cực tiểu
Đáp án: A
Lời giải: Ta có f'(x) = 0 <=> x = 0 hoặc x = 2. Qua nghiệm x = 0 thì f'(x) đổi dấu từ âm sang dương nên x = 0 là điểm cực tiểu.

Câu 2: Nguyên hàm của hàm số f(x) = e^{2x} là:
A. \\frac{1}{2} e^{2x} + C
B. 2e^{2x} + C
C. e^{2x} + C
D. e^x + C
Đáp án: A
Lời giải: \\int e^{2x} dx = \\frac{1}{2} e^{2x} + C.

Câu 3: Tập xác định của hàm số y = \\ln(x - 1) là:
A. (1; +∞)
B. [1; +∞)
C. (-∞; 1)
D. R \\ {1}
Đáp án: A

PHẦN II. TRẢ LỜI NGẮN (Điền đáp số)
Câu 4: Cho hình lăng trụ đứng ABC.A'B'C' có đáy ABC là tam giác vuông cân tại A, AB = a. Biết thể tích khối lăng trụ bằng 2a^3. Tính chiều cao của khối lăng trụ theo a.
Đáp án: 4
Lời giải: S_{ABC} = \\frac{1}{2} a^2. V = S \\cdot h => 2a^3 = \\frac{1}{2} a^2 \\cdot h => h = 4a.

PHẦN III. TỰ LUẬN
Câu 5: Tìm giá trị lớn nhất và nhỏ nhất của hàm số y = x + \\frac{4}{x} trên đoạn [1; 4].
Đáp án: GTLN = 5 khi x = 1 hoặc x = 4; GTNN = 4 khi x = 2
Lời giải: y' = 1 - 4/x^2 = 0 <=> x = 2 (nhận). y(1) = 5, y(2) = 4, y(4) = 5.

Ghi chú: Có thể để riêng BẢNG ĐÁP ÁN trắc nghiệm ở cuối đề thay cho "Đáp án:" từng câu, ví dụ:
ĐÁP ÁN: 1A 2A 3A
`;

export const AzotaWordParserModal: React.FC<AzotaWordParserModalProps> = ({
  isOpen,
  onClose,
  quizId,
  onSuccess,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [defaultPoints, setDefaultPoints] = useState(10);
  const [isImporting, setIsImporting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Đọc file Word/PDF/TXT
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  // Trích xuất text từ file PDF bằng pdf.js
  const extractPdfText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let full = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = '';
      for (const item of content.items as any[]) {
        if (typeof item.str === 'string') {
          pageText += item.str;
          pageText += item.hasEOL ? '\n' : ' ';
        }
      }
      full += pageText + '\n';
    }
    return full;
  };

  // Xử lý khi người dùng chọn/kéo-thả file
  const handleFilePicked = async (file: File | undefined | null) => {
    if (!file) return;
    setFileReadError(null);
    setLoadedFileName(null);
    setIsReadingFile(true);
    try {
      const name = file.name.toLowerCase();
      let text = '';

      if (name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (name.endsWith('.pdf')) {
        text = await extractPdfText(await file.arrayBuffer());
      } else if (name.endsWith('.txt')) {
        text = await file.text();
      } else if (name.endsWith('.doc')) {
        throw new Error('File .doc (Word đời cũ) không đọc trực tiếp được. Hãy mở bằng Word rồi "Lưu dưới dạng" .docx và tải lại.');
      } else {
        throw new Error('Chỉ hỗ trợ file Word (.docx), PDF (.pdf) hoặc văn bản (.txt).');
      }

      if (!text.trim()) {
        setFileReadError('Không trích xuất được nội dung văn bản từ file (có thể là PDF scan từ ảnh). Bạn hãy copy-paste thủ công vào ô bên dưới.');
        return;
      }

      setLoadedFileName(file.name);
      setRawText(text);
      runParser(text);
    } catch (err: any) {
      setFileReadError(err.message || 'Lỗi khi đọc file. Vui lòng thử lại hoặc dán văn bản thủ công.');
    } finally {
      setIsReadingFile(false);
    }
  };

  // Smart Parser Engine
  const runParser = (textToParse: string) => {
    if (!textToParse.trim()) {
      setParsedQuestions([]);
      return;
    }

    // Tách riêng BẢNG ĐÁP ÁN trắc nghiệm ở cuối đề (nếu có), ví dụ: "ĐÁP ÁN: 1A 2B 3C" hoặc "1.A 2.B".
    const answerKeyMap: Record<number, string> = {};
    let workingText = textToParse;
    const keyHeaderMatch = textToParse.match(/(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN(?:\s*CHÍNH\s*THỨC)?|ANSWER\s*KEYS?)\s*[:\-]?\s*([\s\S]+)$/i);
    if (keyHeaderMatch && keyHeaderMatch.index !== undefined) {
      const pairs = Array.from(keyHeaderMatch[1].matchAll(/(\d{1,3})\s*[\.\-\):]?\s*([A-Da-d])\b/g));
      // Chỉ coi là bảng đáp án tổng khi có từ 2 cặp "số + chữ" trở lên
      if (pairs.length >= 2) {
        pairs.forEach((p) => { answerKeyMap[parseInt(p[1], 10)] = p[2].toUpperCase(); });
        workingText = textToParse.substring(0, keyHeaderMatch.index).trim();
      }
    }

    const lines = workingText.split('\n');
    type PartType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
    let currentPart: PartType = 'MULTIPLE_CHOICE';

    // Group text into raw question blocks
    const questionBlocks: Array<{ rawText: string; inferredPart: PartType; qNumber: number | null }> = [];

    let currentBlock = '';
    let currentNumber: number | null = null;

    // Nhận diện loại phần theo từ khóa (đã bỏ dạng Đúng/Sai -> quy về trắc nghiệm)
    const detectPart = (t: string): PartType | null => {
      if (/trả\s*lời\s*ngắn|điền\s*(?:đáp|kết|số)/i.test(t)) return 'SHORT_ANSWER';
      if (/tự\s*luận/i.test(t)) return 'ESSAY';
      if (/trắc\s*nghiệm|nhiều\s*phương\s*án|đúng\s*sai/i.test(t)) return 'MULTIPLE_CHOICE';
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Tiêu đề phần (PHẦN ... hoặc theo từ khóa, dòng ngắn, không phải câu hỏi)
      const isPartHeader = /^(?:PHẦN|Phần|PART)\b/i.test(trimmed);
      const detected = detectPart(trimmed);
      const isQuestionLine = /^(?:Câu|Bài|Question)\s*\d+/i.test(trimmed);
      if (!isQuestionLine && (isPartHeader || (detected && trimmed.length < 120))) {
        if (detected) currentPart = detected;
        continue;
      }

      // Bắt đầu câu hỏi: "Câu X:", "Bài X.", "Question X:"
      const qStartMatch = trimmed.match(/^(?:Câu|Bài|Question)\s*(\d+)[\s\:\.\-]+/i);
      if (qStartMatch) {
        if (currentBlock.trim()) {
          questionBlocks.push({ rawText: currentBlock.trim(), inferredPart: currentPart, qNumber: currentNumber });
        }
        currentBlock = line;
        currentNumber = parseInt(qStartMatch[1], 10);
      } else {
        currentBlock += '\n' + line;
      }
    }

    if (currentBlock.trim()) {
      questionBlocks.push({ rawText: currentBlock.trim(), inferredPart: currentPart, qNumber: currentNumber });
    }

    // Now parse each block into ParsedQuestionItem
    const results: ParsedQuestionItem[] = [];

    questionBlocks.forEach((block, idx) => {
      const blockText = block.rawText;
      let inferredType: PartType = block.inferredPart;

      // Có đủ phương án A-D -> chắc chắn là trắc nghiệm
      const hasOptions = /(?:^|\n)\s*[A-D]\s*[\.\)]/i.test(blockText);
      if (hasOptions) {
        inferredType = 'MULTIPLE_CHOICE';
      }

      // Extract Explanation
      let explanation = '';
      const explMatch = blockText.match(/(?:Lời giải|Hướng dẫn giải|Giải chi tiết|Explanation)[\s\:\-]+([\s\S]+)$/i);
      let textWithoutExpl = blockText;
      if (explMatch && explMatch.index !== undefined) {
        explanation = explMatch[1].trim();
        textWithoutExpl = blockText.substring(0, explMatch.index).trim();
      }

      // Extract Answer Line
      let rawAnswer = '';
      const ansMatch = textWithoutExpl.match(/(?:Đáp án|Đáp số|Chọn|Key|Answer)[\s\:\-]+([^\n]+)/i);
      let textWithoutAns = textWithoutExpl;
      if (ansMatch && ansMatch.index !== undefined) {
        rawAnswer = ansMatch[1].trim();
        textWithoutAns = (
          textWithoutExpl.substring(0, ansMatch.index) +
          '\n' +
          textWithoutExpl.substring(ansMatch.index + ansMatch[0].length)
        ).trim();
      }

      if (inferredType === 'MULTIPLE_CHOICE') {
        // Find Option A, B, C, D
        const optMatches = Array.from(textWithoutAns.matchAll(/(?:^|\n)\s*([A-D])\s*[\.\)]\s*([^\n]+)/g));
        let optA = '';
        let optB = '';
        let optC = '';
        let optD = '';
        let firstOptIndex = -1;

        optMatches.forEach((m) => {
          const letter = m[1].toUpperCase();
          const val = m[2].trim();
          if (firstOptIndex === -1 && m.index !== undefined) {
            firstOptIndex = m.index;
          }
          if (letter === 'A') optA = val;
          else if (letter === 'B') optB = val;
          else if (letter === 'C') optC = val;
          else if (letter === 'D') optD = val;
        });

        // Question text is before options
        let qBody = firstOptIndex !== -1 ? textWithoutAns.substring(0, firstOptIndex).trim() : textWithoutAns;
        qBody = qBody.replace(/^(?:Câu|Bài|Question)\s*\d+[\s\:\.\-]+/i, '').trim();

        // Đáp án: ưu tiên "Đáp án: X" nội tuyến, nếu không có thì tra bảng đáp án cuối đề theo số câu
        let correctKey = '';
        const letterMatch = rawAnswer.match(/[A-D]/i);
        if (letterMatch) {
          correctKey = letterMatch[0].toUpperCase();
        } else if (block.qNumber != null && answerKeyMap[block.qNumber]) {
          correctKey = answerKeyMap[block.qNumber];
        }
        if (!correctKey) correctKey = 'A';

        results.push({
          idTemp: `q_${Date.now()}_${idx}`,
          questionText: qBody,
          questionType: 'MULTIPLE_CHOICE',
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          correctAnswer: correctKey,
          explanation,
          points: defaultPoints,
        });
      } else if (inferredType === 'SHORT_ANSWER') {
        let qBody = textWithoutAns.replace(/^(?:Câu|Bài|Question)\s*\d+[\s\:\.\-]+/i, '').trim();
        results.push({
          idTemp: `q_${Date.now()}_${idx}`,
          questionText: qBody,
          questionType: 'SHORT_ANSWER',
          correctAnswer: rawAnswer || '0',
          explanation,
          points: defaultPoints,
        });
      } else {
        // ESSAY
        let qBody = textWithoutAns.replace(/^(?:Câu|Bài|Question)\s*\d+[\s\:\.\-]+/i, '').trim();
        results.push({
          idTemp: `q_${Date.now()}_${idx}`,
          questionText: qBody,
          questionType: 'ESSAY',
          correctAnswer: rawAnswer || 'Xem hướng dẫn chấm chi tiết',
          explanation,
          points: defaultPoints,
        });
      }
    });

    setParsedQuestions(results);
    setActiveTab('preview');
  };

  const handleApplySample = () => {
    setRawText(SAMPLE_EXAM_2025);
    runParser(SAMPLE_EXAM_2025);
  };

  const handleDeleteItem = (index: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index: number) => {
    const item = parsedQuestions[index];
    const dup = { ...item, idTemp: `q_${Date.now()}_dup` };
    setParsedQuestions((prev) => [
      ...prev.slice(0, index + 1),
      dup,
      ...prev.slice(index + 1),
    ]);
  };

  const handleSaveToQuiz = async () => {
    if (parsedQuestions.length === 0) {
      alert('Không có câu hỏi nào để nhập.');
      return;
    }

    setIsImporting(true);
    try {
      const payload: Partial<QuizQuestion>[] = parsedQuestions.map((q, idx) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || defaultPoints,
        sortOrder: idx + 1,
      }));

      await quizApi.addQuestionsBatch(quizId, payload);
      alert(`Đã nhập thành công ${payload.length} câu hỏi vào đề thi!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nhập câu hỏi hàng loạt');
    } finally {
      setIsImporting(false);
    }
  };

  const getBadgeType = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">Trắc nghiệm 4 đáp án</span>;
      case 'SHORT_ANSWER':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700">Trả lời ngắn</span>;
      case 'ESSAY':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700">Tự luận</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                Bóc tách đề thi tự động phong cách Azota
                <span className="text-[10px] bg-emerald-400/30 text-white px-2 py-0.5 rounded-full font-semibold">
                  Chuẩn Bộ GD&ĐT 2025
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90">
                Tải file Word/PDF hoặc dán văn bản — tự bóc tách Trắc nghiệm 4 đáp án, Trả lời ngắn & Tự luận (hỗ trợ công thức KaTeX)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch & Quick Actions */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'input'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              1. Tải file / Dán đề thi
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-teal-600" />
              2. Xem trước kết quả ({parsedQuestions.length} câu)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplySample}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Tải đề mẫu 2025 (4 phần)
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold pl-2 border-l border-slate-300">
              <span>Điểm/câu:</span>
              <input
                type="number"
                value={defaultPoints}
                onChange={(e) => setDefaultPoints(Number(e.target.value) || 10)}
                className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'input' ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Quy tắc nhận diện thông minh (Chuẩn giáo viên & Azota):</p>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                    <li>Đánh dấu câu: <strong>Câu 1:</strong>, <strong>Bài 1.</strong>, <strong>Câu 2:</strong></li>
                    <li>Trắc nghiệm: <strong>A.</strong>, <strong>B.</strong>, <strong>C.</strong>, <strong>D.</strong> kèm <strong>Đáp án: A</strong> ngay dưới mỗi câu</li>
                    <li>Hoặc để <strong>BẢNG ĐÁP ÁN</strong> ở cuối đề, ví dụ: <code className="bg-emerald-100 px-1 rounded">ĐÁP ÁN: 1A 2C 3B 4D</code> — hệ thống tự gán theo số câu</li>
                    <li>Trả lời ngắn: <strong>Đáp án: 4</strong> hoặc <strong>Đáp số: 1/2</strong></li>
                    <li>Tự luận: đặt dưới mục <strong>PHẦN ... Tự luận</strong>, kèm <strong>Đáp án/Hướng dẫn chấm</strong></li>
                    <li>Lời giải chi tiết: Bắt đầu bằng <strong>Lời giải:</strong> hoặc <strong>Hướng dẫn giải:</strong></li>
                    <li>Hỗ trợ công thức Toán học KaTeX: <code className="bg-emerald-100 px-1 rounded">$x^2 + y^2 = 1$</code> hoặc <code className="bg-emerald-100 px-1 rounded">$$\int f(x)dx$$</code></li>
                  </ul>
                </div>
              </div>

              {/* Tải trực tiếp file Word / PDF lên */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  handleFilePicked(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <div
                onClick={() => !isReadingFile && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isReadingFile) handleFilePicked(e.dataTransfer.files?.[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer ${
                  isReadingFile
                    ? 'border-emerald-300 bg-emerald-50/60 cursor-wait'
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 bg-white'
                }`}
              >
                {isReadingFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    Đang đọc & bóc tách nội dung file...
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-sm">
                      <Upload className="w-5 h-5 text-emerald-600" />
                      Tải lên file Word (.docx) hoặc PDF (.pdf)
                    </div>
                    <p className="text-xs text-slate-500">
                      Bấm để chọn file hoặc kéo-thả vào đây. Hệ thống tự đọc nội dung và bóc tách câu hỏi.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Cũng hỗ trợ .txt · File .doc đời cũ hãy lưu lại thành .docx
                    </p>
                  </div>
                )}
              </div>

              {loadedFileName && !fileReadError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã đọc file: <strong>{loadedFileName}</strong> — nội dung đã được nạp vào ô bên dưới.
                </div>
              )}
              {fileReadError && (
                <div className="flex items-start gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fileReadError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="h-px flex-1 bg-slate-200" />
                Hoặc dán văn bản thủ công
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán toàn bộ văn bản đề thi từ file Word (Ctrl + V) vào đây... Hệ thống sẽ tự động bóc tách từng câu hỏi, đáp án và lời giải chi tiết."
                className="w-full h-80 p-4 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl font-mono text-xs text-slate-800 focus:outline-hidden leading-relaxed resize-none shadow-inner"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => runParser(rawText)}
                  disabled={!rawText.trim()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> Bóc tách & Xem trước
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {parsedQuestions.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Chưa có câu hỏi nào được bóc tách</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vui lòng chuyển qua tab "1. Dán văn bản đề thi" để dán nội dung hoặc bấm "Tải đề mẫu 2025".
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-700">
                      Đã nhận diện thành công: <strong className="text-emerald-600 text-sm">{parsedQuestions.length}</strong> câu hỏi
                    </span>
                    <button
                      onClick={() => setActiveTab('input')}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      &larr; Quay lại chỉnh sửa văn bản gốc
                    </button>
                  </div>

                  {parsedQuestions.map((q, idx) => {
                    return (
                      <div
                        key={q.idTemp || idx}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            {getBadgeType(q.questionType)}
                            <span className="text-xs text-slate-400 font-semibold">
                              ({q.points} điểm)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDuplicateItem(idx)}
                              title="Nhân bản câu này"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              title="Xóa câu này"
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="pl-9">
                          <MathView
                            content={q.questionText}
                            className="text-xs font-semibold text-slate-900 leading-relaxed"
                          />
                        </div>

                        {/* Options depending on type */}
                        <div className="pl-9 space-y-2">
                          {q.questionType === 'MULTIPLE_CHOICE' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {[
                                { key: 'A', text: q.optionA },
                                { key: 'B', text: q.optionB },
                                { key: 'C', text: q.optionC },
                                { key: 'D', text: q.optionD },
                              ].map((opt) => (
                                <div
                                  key={opt.key}
                                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                                    q.correctAnswer === opt.key
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                      : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                      q.correctAnswer === opt.key
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <MathView content={opt.text || ''} className="text-xs" />
                                </div>
                              ))}
                            </div>
                          )}

                          {q.questionType === 'SHORT_ANSWER' && (
                            <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
                              <span className="font-bold text-amber-900">Đáp án chuẩn:</span>
                              <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-amber-900">
                                {q.correctAnswer}
                              </code>
                            </div>
                          )}

                          {q.questionType === 'ESSAY' && (
                            <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-rose-900 block">Hướng dẫn chấm:</span>
                              <MathView content={q.correctAnswer} className="text-xs text-rose-950" />
                            </div>
                          )}

                          {q.explanation && (
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                              <span className="font-bold text-slate-900 block mb-0.5">Lời giải chi tiết:</span>
                              <MathView content={q.explanation} className="text-xs" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'preview' && (
              <button
                type="button"
                disabled={isImporting || parsedQuestions.length === 0}
                onClick={handleSaveToQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isImporting
                  ? 'Đang nhập câu hỏi...'
                  : `Lưu ${parsedQuestions.length} câu hỏi vào đề thi`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
