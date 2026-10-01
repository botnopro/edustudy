import React, { useState, useEffect, useRef } from 'react';
import { quizApi } from '../../api/quizApi';
import { Quiz, QuizQuestion, Lesson, QuizSubmissionAdmin } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';
import { MathView } from '../quiz/MathView';
import { MathToolbar } from '../quiz/MathToolbar';
import { ChartPlotter } from '../quiz/ChartPlotter';
import { ChartEditorModal } from '../quiz/ChartEditorModal';
import { ImagePasteZone } from '../quiz/ImagePasteZone';
import { AzotaWordParserModal } from './AzotaWordParserModal';
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  LineChart,
  Eye,
  CheckCircle,
  Save,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Check,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  CheckSquare,
  MessageSquare,
  Wand2,
  UploadCloud,
  Scale,
  Copy,
  ArrowUp,
  ArrowDown,
  Users,
  Download,
  RefreshCw,
  AlertCircle,
  XCircle,
  UserCheck
} from 'lucide-react';

interface AdminQuizModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  onClose: () => void;
}

type ActiveFieldName = 'qText' | 'optionA' | 'optionB' | 'optionC' | 'optionD' | 'explanation' | 'shortAnswer';

export const AdminQuizModal: React.FC<AdminQuizModalProps> = ({
  isOpen,
  lesson,
  onClose,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);

  // Tab view: editor or submissions review
  const [quizModalTab, setQuizModalTab] = useState<'editor' | 'submissions'>('editor');
  const [submissions, setSubmissions] = useState<QuizSubmissionAdmin[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<QuizSubmissionAdmin | null>(null);
  const [gradeInputScore, setGradeInputScore] = useState<number>(0);
  const [gradeInputFeedback, setGradeInputFeedback] = useState<string>('');
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // Quiz metadata form
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [showScore, setShowScore] = useState(true);

  // Chấm điểm tự luận theo từng câu: { questionId: { score, feedback } }
  const [essayGrades, setEssayGrades] = useState<Record<number, { score: number; feedback: string }>>({});

  // Question editing form
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE_4' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'>('MULTIPLE_CHOICE');
  const [qText, setQText] = useState('');
  const [qImageUrl, setQImageUrl] = useState('');
  const [qChartConfig, setQChartConfig] = useState('');
  const [qOptionA, setQOptionA] = useState('');
  const [qOptionB, setQOptionB] = useState('');
  const [qOptionC, setQOptionC] = useState('');
  const [qOptionD, setQOptionD] = useState('');
  const [qCorrectAnswer, setQCorrectAnswer] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qPoints, setQPoints] = useState(10);
  const [tf4Keys, setTf4Keys] = useState<{ a: 'T' | 'F'; b: 'T' | 'F'; c: 'T' | 'F'; d: 'T' | 'F' }>({
    a: 'T',
    b: 'F',
    c: 'T',
    d: 'F',
  });

  // Azota Word import modal
  const [isAzotaModalOpen, setIsAzotaModalOpen] = useState(false);
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);
  const [wordRawText, setWordRawText] = useState('');

  // Track focused field for intelligent toolbar insertion
  const [activeField, setActiveField] = useState<ActiveFieldName>('qText');
  const qTextRef = useRef<HTMLTextAreaElement>(null);
  const optionARef = useRef<HTMLInputElement>(null);
  const optionBRef = useRef<HTMLInputElement>(null);
  const optionCRef = useRef<HTMLInputElement>(null);
  const optionDRef = useRef<HTMLInputElement>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);

  // Option Image modal
  const [optionImageTarget, setOptionImageTarget] = useState<'A' | 'B' | 'C' | 'D' | 'explanation' | null>(null);
  const [tempOptionImgUrl, setTempOptionImgUrl] = useState('');

  // Chart modal
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Preview tab
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    if (!lesson) return;
    setLoading(true);
    try {
      const data = await quizApi.getAdminLessonQuizzes(lesson.id);
      setQuizzes(data || []);
      if (data && data.length > 0) {
        setActiveQuiz(data[0]);
        setQuizTitle(data[0].title);
        setQuizDescription(data[0].description || '');
        setTimeLimit(data[0].timeLimitMinutes || 15);
        setPassingScore(data[0].passingScore || 70);
        setShuffleQuestions(data[0].shuffleQuestions || false);
        setShowAnswers(data[0].showAnswers !== false);
        setShowScore(data[0].showScore !== false);
        fetchSubmissions(data[0].id);
      } else {
        setActiveQuiz(null);
        setQuizTitle(`Bài tập trắc nghiệm củng cố: ${lesson.title}`);
        setQuizDescription('Luyện tập các câu hỏi trắc nghiệm, công thức và đồ thị trọng tâm bài học.');
        setTimeLimit(15);
        setPassingScore(70);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (quizId: number) => {
    setLoadingSubmissions(true);
    try {
      const data = await quizApi.getQuizSubmissions(quizId);
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Failed to fetch quiz submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Khởi tạo điểm tự luận từng câu từ dữ liệu bài nộp
  const initEssayGrades = (detail: QuizSubmissionAdmin) => {
    const grades: Record<number, { score: number; feedback: string }> = {};
    (detail.questionResults || [])
      .filter((qr) => qr.questionType === 'ESSAY')
      .forEach((qr) => {
        grades[qr.questionId] = {
          score: qr.pendingGrade ? 0 : (qr.pointsEarned || 0),
          feedback: qr.teacherComment || '',
        };
      });
    setEssayGrades(grades);
  };

  const handleOpenGradeModal = async (sub: QuizSubmissionAdmin) => {
    try {
      const detail = await quizApi.getSubmissionDetail(sub.id);
      setSelectedSubmissionForGrading(detail);
      setGradeInputScore(detail.teacherScore !== undefined && detail.teacherScore !== null ? detail.teacherScore : detail.score);
      setGradeInputFeedback(detail.teacherFeedback || '');
      initEssayGrades(detail);
    } catch (err) {
      setSelectedSubmissionForGrading(sub);
      setGradeInputScore(sub.score);
      setGradeInputFeedback(sub.teacherFeedback || '');
      initEssayGrades(sub);
    }
  };

  // Các câu tự luận của bài nộp đang chấm
  const essayQuestions = (selectedSubmissionForGrading?.questionResults || []).filter(
    (qr) => qr.questionType === 'ESSAY'
  );
  // Điểm khách quan (các câu không phải tự luận, đã tự chấm)
  const objectiveScore = (selectedSubmissionForGrading?.questionResults || [])
    .filter((qr) => qr.questionType !== 'ESSAY')
    .reduce((sum, qr) => sum + (qr.pointsEarned || 0), 0);
  const essaySum = essayQuestions.reduce(
    (sum, qr) => sum + (essayGrades[qr.questionId]?.score || 0),
    0
  );
  const computedTotalGrade = objectiveScore + essaySum;

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;
    setGradingSubmitting(true);
    try {
      if (essayQuestions.length > 0) {
        // Chấm theo từng câu tự luận
        await quizApi.gradeSubmission(selectedSubmissionForGrading.id, {
          teacherFeedback: gradeInputFeedback.trim(),
          questionGrades: essayQuestions.map((qr) => ({
            questionId: qr.questionId,
            score: Number(essayGrades[qr.questionId]?.score || 0),
            feedback: (essayGrades[qr.questionId]?.feedback || '').trim(),
          })),
        });
      } else {
        // Không có tự luận: chấm nhanh 1 điểm tổng
        await quizApi.gradeSubmission(selectedSubmissionForGrading.id, {
          teacherScore: Number(gradeInputScore),
          teacherFeedback: gradeInputFeedback.trim(),
        });
      }
      alert('Đã lưu điểm và gửi nhận xét thành công cho học sinh!');
      setSelectedSubmissionForGrading(null);
      if (activeQuiz) {
        fetchSubmissions(activeQuiz.id);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu điểm');
    } finally {
      setGradingSubmitting(false);
    }
  };

  // Trích đoạn xem trước bài làm của học sinh (ưu tiên câu tự luận) để hiện 2 dòng đầu trong danh sách
  const getSubmissionPreview = (sub: QuizSubmissionAdmin): string => {
    const results = sub.questionResults || [];
    const essays = results.filter((r) => r.questionType === 'ESSAY');
    const source = essays.length > 0 ? essays : results;
    const text = source
      .map((r) => (r.essayAnswer || r.userAnswer || '').trim())
      .filter(Boolean)
      .join(' • ');
    return text;
  };

  const handleExportSubmissionsCsv = () => {
    if (submissions.length === 0) {
      alert('Chưa có bài nộp nào để xuất bảng điểm!');
      return;
    }
    exportToCsv<QuizSubmissionAdmin>(
      submissions,
      [
        { header: 'Mã bài nộp', accessor: s => s.id },
        { header: 'Họ tên học sinh', accessor: s => s.studentName || '' },
        { header: 'Email học sinh', accessor: s => s.studentEmail || '' },
        { header: 'Điểm đạt được', accessor: s => s.score },
        { header: 'Tổng điểm', accessor: s => s.totalPoints },
        { header: 'Tỷ lệ (%)', accessor: s => s.percentage || 0 },
        { header: 'Kết quả', accessor: s => s.passed ? 'ĐẠT' : 'CHƯA ĐẠT' },
        { header: 'Trạng thái chấm', accessor: s => s.isGraded ? 'Đã chấm' : 'Chờ chấm tự luận' },
        { header: 'Thời gian làm (giây)', accessor: s => s.timeSpentSeconds || 0 },
        { header: 'Giáo viên chấm', accessor: s => s.gradedBy || '' },
        { header: 'Lời phê giáo viên', accessor: s => s.teacherFeedback || '' },
        { header: 'Ngày nộp bài', accessor: s => s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : '' },
      ],
      `Bang_diem_${activeQuiz?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Quiz'}`
    );
  };

  useEffect(() => {
    if (isOpen && lesson) {
      fetchQuizzes();
    }
  }, [isOpen, lesson]);

  const handleSaveQuizMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !quizTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (activeQuiz) {
        const updated = await quizApi.updateQuiz(activeQuiz.id, {
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          timeLimitMinutes: timeLimit,
          passingScore,
          shuffleQuestions,
          showAnswers,
          showScore,
        });
        setActiveQuiz(updated);
      } else {
        const created = await quizApi.createQuiz(lesson.id, {
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          timeLimitMinutes: timeLimit,
          passingScore,
          shuffleQuestions,
          showAnswers,
          showScore,
          isActive: true,
          sortOrder: 1,
        });
        setActiveQuiz(created);
      }
      fetchQuizzes();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin bài quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionType('MULTIPLE_CHOICE');
    setQText('');
    setQImageUrl('');
    setQChartConfig('');
    setQOptionA('');
    setQOptionB('');
    setQOptionC('');
    setQOptionD('');
    setQCorrectAnswer('A');
    setTf4Keys({ a: 'T', b: 'F', c: 'T', d: 'F' });
    setQExplanation('');
    setQPoints(10);
    setActiveField('qText');
    setPreviewTab('edit');
    setIsQuestionFormOpen(true);
  };

  const openEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    const qType = (q.questionType as any) || 'MULTIPLE_CHOICE';
    setQuestionType(qType);
    setQText(q.questionText || '');
    setQImageUrl(q.imageUrl || '');
    setQChartConfig(q.chartConfig || '');
    setQOptionA(q.optionA || '');
    setQOptionB(q.optionB || '');
    setQOptionC(q.optionC || '');
    setQOptionD(q.optionD || '');
    setQExplanation(q.explanation || '');
    setQPoints(q.points || 10);

    if (qType === 'TRUE_FALSE_4') {
      try {
        const parsed = JSON.parse(q.correctAnswer || '{}');
        setTf4Keys({
          a: parsed.a === 'T' ? 'T' : 'F',
          b: parsed.b === 'T' ? 'T' : 'F',
          c: parsed.c === 'T' ? 'T' : 'F',
          d: parsed.d === 'T' ? 'T' : 'F',
        });
      } catch {
        const isA = /a[\:\-]\s*Đ/i.test(q.correctAnswer || '');
        const isB = /b[\:\-]\s*Đ/i.test(q.correctAnswer || '');
        const isC = /c[\:\-]\s*Đ/i.test(q.correctAnswer || '');
        const isD = /d[\:\-]\s*Đ/i.test(q.correctAnswer || '');
        setTf4Keys({
          a: isA ? 'T' : 'F',
          b: isB ? 'T' : 'F',
          c: isC ? 'T' : 'F',
          d: isD ? 'T' : 'F',
        });
      }
      setQCorrectAnswer(q.correctAnswer || '');
    } else {
      setQCorrectAnswer(q.correctAnswer || (qType === 'TRUE_FALSE' ? 'TRUE' : 'A'));
    }

    setActiveField('qText');
    setPreviewTab('edit');
    setIsQuestionFormOpen(true);
  };

  const handleDuplicateQuestion = async (q: QuizQuestion) => {
    if (!activeQuiz) return;
    try {
      const payload: Partial<QuizQuestion> = {
        questionText: q.questionText,
        questionType: q.questionType,
        imageUrl: q.imageUrl,
        chartConfig: q.chartConfig,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        sortOrder: (activeQuiz.questions?.length || 0) + 1,
      };
      await quizApi.addQuestion(activeQuiz.id, payload);
      const updatedQuiz = await quizApi.getAdminQuiz(activeQuiz.id);
      setActiveQuiz(updatedQuiz);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nhân bản câu hỏi');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) {
      alert('Vui lòng tạo hoặc lưu thông tin bài Quiz trước khi thêm câu hỏi');
      return;
    }
    if (!qText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCorrectAnswer = qCorrectAnswer.trim();
      if (questionType === 'TRUE_FALSE_4') {
        finalCorrectAnswer = JSON.stringify(tf4Keys);
      }

      const payload: Partial<QuizQuestion> = {
        questionText: qText.trim(),
        questionType,
        imageUrl: qImageUrl.trim() || undefined,
        chartConfig: qChartConfig.trim() || undefined,
        optionA: (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE_4') ? qOptionA.trim() : undefined,
        optionB: (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE_4') ? qOptionB.trim() : undefined,
        optionC: (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE_4') ? qOptionC.trim() : undefined,
        optionD: (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE_4') ? qOptionD.trim() : undefined,
        correctAnswer: finalCorrectAnswer,
        explanation: qExplanation.trim(),
        points: qPoints,
        sortOrder: editingQuestion ? editingQuestion.sortOrder : (activeQuiz.questions?.length || 0) + 1,
      };

      if (editingQuestion && editingQuestion.id) {
        await quizApi.updateQuestion(editingQuestion.id, payload);
      } else {
        await quizApi.addQuestion(activeQuiz.id, payload);
      }

      setIsQuestionFormOpen(false);
      const updatedQuiz = await quizApi.getAdminQuiz(activeQuiz.id);
      setActiveQuiz(updatedQuiz);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId?: number) => {
    if (!qId) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      try {
        await quizApi.deleteQuestion(qId);
        if (activeQuiz) {
          const updatedQuiz = await quizApi.getAdminQuiz(activeQuiz.id);
          setActiveQuiz(updatedQuiz);
        }
        fetchQuizzes();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa câu hỏi');
      }
    }
  };

  // Smart insertion at cursor position in the active field
  const insertSnippet = (snippet: string) => {
    let targetEl: HTMLInputElement | HTMLTextAreaElement | null = null;
    let currentVal = '';
    let setter: (val: string) => void = () => {};

    if (activeField === 'qText') {
      targetEl = qTextRef.current;
      currentVal = qText;
      setter = setQText;
    } else if (activeField === 'optionA') {
      targetEl = optionARef.current;
      currentVal = qOptionA;
      setter = setQOptionA;
    } else if (activeField === 'optionB') {
      targetEl = optionBRef.current;
      currentVal = qOptionB;
      setter = setQOptionB;
    } else if (activeField === 'optionC') {
      targetEl = optionCRef.current;
      currentVal = qOptionC;
      setter = setQOptionC;
    } else if (activeField === 'optionD') {
      targetEl = optionDRef.current;
      currentVal = qOptionD;
      setter = setQOptionD;
    } else if (activeField === 'explanation') {
      targetEl = explanationRef.current;
      currentVal = qExplanation;
      setter = setQExplanation;
    }

    if (targetEl && targetEl.selectionStart !== null && targetEl.selectionEnd !== null) {
      const start = targetEl.selectionStart;
      const end = targetEl.selectionEnd;
      const prefix = currentVal.substring(0, start);
      const suffix = currentVal.substring(end);
      const newVal = prefix + (prefix.endsWith(' ') || prefix === '' ? '' : ' ') + snippet + (suffix.startsWith(' ') || suffix === '' ? '' : ' ') + suffix;
      setter(newVal);

      setTimeout(() => {
        if (targetEl) {
          targetEl.focus();
          const newPos = start + snippet.length + 1;
          targetEl.setSelectionRange(newPos, newPos);
        }
      }, 50);
    } else {
      setter(currentVal + ' ' + snippet);
    }
  };

  // Word-style formatting actions (wrap selection with markdown)
  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'list') => {
    let targetEl: HTMLInputElement | HTMLTextAreaElement | null = null;
    let currentVal = '';
    let setter: (val: string) => void = () => {};

    if (activeField === 'qText') {
      targetEl = qTextRef.current;
      currentVal = qText;
      setter = setQText;
    } else if (activeField === 'explanation') {
      targetEl = explanationRef.current;
      currentVal = qExplanation;
      setter = setQExplanation;
    }

    if (!targetEl || targetEl.selectionStart === null || targetEl.selectionEnd === null) return;

    const start = targetEl.selectionStart;
    const end = targetEl.selectionEnd;
    const selected = currentVal.substring(start, end);

    let formatted = selected;
    if (format === 'bold') formatted = `**${selected || 'in đậm'}**`;
    else if (format === 'italic') formatted = `*${selected || 'in nghiêng'}*`;
    else if (format === 'underline') formatted = `_${selected || 'gạch chân'}_`;
    else if (format === 'list') formatted = `\n- ${selected || 'Ý thứ nhất'}\n- Ý thứ hai`;

    const newVal = currentVal.substring(0, start) + formatted + currentVal.substring(end);
    setter(newVal);
  };

  // Auto-parse raw Word text into question fields
  const handleParseWordText = () => {
    if (!wordRawText.trim()) return;

    const text = wordRawText.trim();
    let detectedType: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' = 'MULTIPLE_CHOICE';

    // Regex matchers
    const optAMatch = text.match(/(?:^|\n)\s*[A|a][\.\)\:]\s*([^\n]+)/);
    const optBMatch = text.match(/(?:^|\n)\s*[B|b][\.\)\:]\s*([^\n]+)/);
    const optCMatch = text.match(/(?:^|\n)\s*[C|c][\.\)\:]\s*([^\n]+)/);
    const optDMatch = text.match(/(?:^|\n)\s*[D|d][\.\)\:]\s*([^\n]+)/);

    const ansMatch = text.match(/(?:Đáp án|Chọn|Key|Answer)[\s\:\-]+([A-Da-d]|ĐÚNG|SAI|TRUE|FALSE|[0-9\.\,\-]+)/i);
    const explMatch = text.match(/(?:Lời giải|Hướng dẫn giải|Giải chi tiết|Explanation)[\s\:\-]+([\s\S]+)/i);

    // Detect question body: from beginning until first option or answer
    let qBody = text;
    const firstOptIndex = Math.min(
      ...[
        text.search(/(?:^|\n)\s*[A|a][\.\)\:]/),
        text.search(/(?:Đáp án|Chọn|Key)/i),
        text.search(/(?:Lời giải|Hướng dẫn giải)/i),
      ].filter((idx) => idx > 0)
    );

    if (firstOptIndex > 0 && firstOptIndex < text.length) {
      qBody = text.substring(0, firstOptIndex).trim();
    }

    // Remove "Câu 1:", "Bài 1:" prefix if exists
    qBody = qBody.replace(/^(?:Câu|Bài|Question)\s*\d+[\s\:\.\-]+/i, '').trim();

    if (optAMatch && optBMatch) {
      detectedType = 'MULTIPLE_CHOICE';
      setQOptionA(optAMatch[1].trim());
      setQOptionB(optBMatch[1].trim());
      setQOptionC(optCMatch ? optCMatch[1].trim() : '');
      setQOptionD(optDMatch ? optDMatch[1].trim() : '');
    } else {
      detectedType = 'SHORT_ANSWER';
    }

    setQuestionType(detectedType);
    setQText(qBody || text);

    if (ansMatch) {
      const rawAns = ansMatch[1].trim().toUpperCase();
      if (detectedType === 'MULTIPLE_CHOICE' && ['A', 'B', 'C', 'D'].includes(rawAns)) {
        setQCorrectAnswer(rawAns);
      } else {
        setQCorrectAnswer(ansMatch[1].trim());
      }
    }

    if (explMatch) {
      setQExplanation(explMatch[1].trim());
    }

    setIsWordImportOpen(false);
    setWordRawText('');
  };

  // Attach image to option or explanation
  const handleApplyOptionImage = () => {
    if (!tempOptionImgUrl.trim() || !optionImageTarget) return;
    const imgSnippet = `![Hình ảnh](${tempOptionImgUrl.trim()})`;

    if (optionImageTarget === 'A') setQOptionA((prev) => (prev ? prev + ' ' : '') + imgSnippet);
    else if (optionImageTarget === 'B') setQOptionB((prev) => (prev ? prev + ' ' : '') + imgSnippet);
    else if (optionImageTarget === 'C') setQOptionC((prev) => (prev ? prev + ' ' : '') + imgSnippet);
    else if (optionImageTarget === 'D') setQOptionD((prev) => (prev ? prev + ' ' : '') + imgSnippet);
    else if (optionImageTarget === 'explanation') setQExplanation((prev) => (prev ? prev + '\n' : '') + imgSnippet);

    setOptionImageTarget(null);
    setTempOptionImgUrl('');
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Quản lý Đề thi & Bài tập: <span className="text-emerald-400">{lesson.title}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Trắc nghiệm 4 đáp án (A-D), Trả lời ngắn & Tự luận · Nhập đề từ file Word/PDF, vẽ đồ thị Oxy, dán ảnh Ctrl+V
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuizModalTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                quizModalTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Soạn Đề & Câu Hỏi ({activeQuiz?.questions?.length || 0})</span>
            </button>

            <button
              onClick={() => {
                setQuizModalTab('submissions');
                if (activeQuiz) fetchSubmissions(activeQuiz.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                quizModalTab === 'submissions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Bài Nộp & Chấm Tự Luận ({submissions.length})</span>
              {submissions.filter(s => !s.isGraded).length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                  {submissions.filter(s => !s.isGraded).length} chờ chấm
                </span>
              )}
            </button>
          </div>

          {quizModalTab === 'submissions' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSubmissionsCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                title="Xuất bảng điểm toàn bộ học sinh ra Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất bảng điểm (Excel)</span>
              </button>
              <button
                onClick={() => activeQuiz && fetchSubmissions(activeQuiz.id)}
                disabled={loadingSubmissions}
                className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition"
                title="Làm mới bài nộp"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {quizModalTab === 'editor' ? (
            <>
              {/* Section 1: Quiz Settings */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Cấu hình thông tin bài Quiz / Đề thi
              </h4>
              {activeQuiz && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Đã có {activeQuiz.questions?.length || 0} câu hỏi
                </span>
              )}
            </div>

            <form onSubmit={handleSaveQuizMeta} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tiêu đề bài kiểm tra *
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                  placeholder="ví dụ: Đề kiểm tra 15 phút: Khảo sát hàm số & Tích phân"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={1}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-500" /> Điểm qua tối thiểu (%)
                </label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="md:col-span-10 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Xáo trộn thứ tự câu hỏi mỗi lần làm
                  </span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={showScore}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setShowScore(v);
                      // Ẩn điểm thì ẩn luôn đáp án
                      if (!v) setShowAnswers(false);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Cho học sinh xem điểm sau khi nộp
                  </span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg transition ${showScore ? 'cursor-pointer hover:border-emerald-300' : 'opacity-50 cursor-not-allowed'}`}>
                  <input
                    type="checkbox"
                    checked={showAnswers}
                    disabled={!showScore}
                    onChange={(e) => setShowAnswers(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Cho xem đáp án & lời giải sau khi nộp
                  </span>
                </label>
              </div>
              <div className="md:col-span-10 -mt-2">
                <p className="text-[11px] text-slate-500">
                  Lưu ý: Khi tắt <strong>"xem điểm"</strong>, học sinh sẽ không thấy điểm, phần trăm, kết quả Đạt/Chưa đạt và cả đáp án (chỉ báo đã nộp bài thành công).
                </p>
              </div>

              <div className="md:col-span-10">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mô tả hướng dẫn làm bài
                </label>
                <input
                  type="text"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Ghi chú thêm về yêu cầu, quy chế hoặc lưu ý cho học sinh..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {activeQuiz ? 'Lưu cấu hình' : 'Tạo Đề Thi'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Questions List & Add Button */}
          {activeQuiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  Danh sách câu hỏi trong đề ({activeQuiz.questions?.length || 0})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAzotaModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                    title="Tải file Word/PDF hoặc dán nhiều câu trắc nghiệm cùng lúc, hệ thống tự bóc tách"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-200" /> Nhập đề từ Word / PDF (nhiều câu)
                  </button>
                  <button
                    onClick={() => {
                      setWordRawText('');
                      setIsWordImportOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-blue-600" /> Dán nhanh 1 câu
                  </button>
                  <button
                    onClick={openAddQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Soạn câu hỏi mới
                  </button>
                </div>
              </div>

              {activeQuiz.questions?.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">Chưa có câu hỏi nào trong đề thi này.</p>
                  <p className="text-xs mt-1">Bấm "Nhập đề từ Word / PDF" để tải/dán nhiều câu cùng lúc, hoặc "Soạn câu hỏi mới" để tạo trắc nghiệm, trả lời ngắn hoặc tự luận.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuiz.questions?.map((q, idx) => {
                    let tf4Parsed: Record<string, string> = {};
                    if (q.questionType === 'TRUE_FALSE_4') {
                      try {
                        tf4Parsed = JSON.parse(q.correctAnswer || '{}');
                      } catch {
                        tf4Parsed = { a: 'T', b: 'F', c: 'T', d: 'F' };
                      }
                    }

                    return (
                      <div
                        key={q.id || idx}
                        className="border border-slate-200 rounded-xl p-4 bg-white hover:border-emerald-200 transition shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 w-full">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  q.questionType === 'TRUE_FALSE_4'
                                    ? 'bg-purple-100 text-purple-700'
                                    : q.questionType === 'SHORT_ANSWER'
                                    ? 'bg-blue-100 text-blue-700'
                                    : q.questionType === 'ESSAY'
                                    ? 'bg-rose-100 text-rose-700'
                                    : q.questionType === 'TRUE_FALSE'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {q.questionType === 'TRUE_FALSE_4'
                                    ? 'Đúng / Sai 4 ý (Chuẩn 2025)'
                                    : q.questionType === 'SHORT_ANSWER'
                                    ? 'Trả lời ngắn'
                                    : q.questionType === 'ESSAY'
                                    ? 'Tự luận'
                                    : q.questionType === 'TRUE_FALSE'
                                    ? 'Đúng / Sai'
                                    : 'Trắc nghiệm 4 lựa chọn'}
                                </span>
                                <span className="text-xs text-slate-400">&bull; {q.points || 10} điểm</span>
                              </div>

                              <MathView content={q.questionText} className="font-medium text-slate-800 text-sm" />

                              {/* Render visual graph if attached */}
                              {q.chartConfig && (
                                <div className="my-2 inline-block">
                                  <ChartPlotter config={q.chartConfig} width={340} height={210} />
                                </div>
                              )}

                              {/* Render question image if attached */}
                              {q.imageUrl && (
                                <img
                                  src={q.imageUrl}
                                  alt="Minh họa"
                                  className="max-h-48 rounded-lg border border-slate-200 object-contain my-2"
                                />
                              )}

                              {/* Options or Answer Display */}
                              {q.questionType === 'TRUE_FALSE_4' ? (
                                <div className="space-y-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-200 text-xs">
                                  {[
                                    { key: 'a', text: q.optionA },
                                    { key: 'b', text: q.optionB },
                                    { key: 'c', text: q.optionC },
                                    { key: 'd', text: q.optionD },
                                  ].map((sub) => {
                                    const isTrue = tf4Parsed[sub.key] === 'T';
                                    return (
                                      <div key={sub.key} className="flex items-center justify-between gap-3 p-1.5 bg-white rounded-lg border border-purple-100">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-purple-900 uppercase">{sub.key})</span>
                                          <MathView content={sub.text || ''} />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          isTrue ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          {isTrue ? 'ĐÚNG' : 'SAI'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : q.questionType === 'SHORT_ANSWER' ? (
                                <div className="p-2.5 rounded-lg text-xs bg-blue-50/70 border border-blue-200 text-blue-900 font-medium">
                                  <strong>Đáp án số / chữ chính xác:</strong>{' '}
                                  <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-blue-700 border border-blue-300 ml-1">
                                    {q.correctAnswer}
                                  </code>
                                </div>
                              ) : q.questionType === 'ESSAY' ? (
                                <div className="p-2.5 rounded-lg text-xs bg-rose-50/70 border border-rose-200 text-rose-900 font-medium space-y-1">
                                  <strong>Đáp án mẫu & Bareme chấm:</strong>
                                  <MathView content={q.correctAnswer} className="text-xs text-rose-950" />
                                </div>
                              ) : q.questionType === 'TRUE_FALSE' ? (
                                <div className="p-2.5 rounded-lg text-xs bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                                  <strong>Đáp án đúng:</strong>{' '}
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white text-[11px]">
                                    {q.correctAnswer === 'TRUE' ? 'ĐÚNG' : 'SAI'}
                                  </span>
                                </div>
                              ) : (
                                /* Multiple choice A B C D */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                  {[
                                    { key: 'A', text: q.optionA },
                                    { key: 'B', text: q.optionB },
                                    { key: 'C', text: q.optionC },
                                    { key: 'D', text: q.optionD },
                                  ].map((opt) => (
                                    <div
                                      key={opt.key}
                                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                                        q.correctAnswer === opt.key
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                                          q.correctAnswer === opt.key
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : 'bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {opt.key}
                                      </span>
                                      <div className="flex-1">
                                        <MathView content={opt.text || ''} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Explanation preview */}
                              {q.explanation && (
                                <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                                  <span className="font-bold block mb-1">Lời giải chi tiết:</span>
                                  <MathView content={q.explanation} />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Nhân bản câu hỏi"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditQuestion(q)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Sửa câu hỏi"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* TAB 2: SUBMISSIONS & ESSAY GRADING */
        <div className="space-y-6">
          {/* Quick KPI stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng số bài nộp</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{submissions.length}</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Đã hoàn tất chấm</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                {submissions.filter(s => s.isGraded).length}
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Chờ chấm tự luận</div>
              <div className="text-2xl font-black text-amber-800 mt-1">
                {submissions.filter(s => !s.isGraded).length}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Điểm trung bình</div>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {submissions.length > 0
                  ? (submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length).toFixed(1) + '%'
                  : '0%'}
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs">Đang tải danh sách bài nộp của học sinh...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Chưa có bài nộp nào</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khi học sinh làm bài quiz trên hệ thống, danh sách bài làm và câu trả lời tự luận sẽ hiển thị tại đây để giáo viên chấm điểm.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase">
                  <tr>
                    <th className="py-3.5 px-4">Mã</th>
                    <th className="py-3.5 px-4">Học sinh</th>
                    <th className="py-3.5 px-4">Điểm số</th>
                    <th className="py-3.5 px-4">Kết quả</th>
                    <th className="py-3.5 px-4">Trạng thái chấm</th>
                    <th className="py-3.5 px-4">Ngày nộp</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.map((sub) => {
                    const preview = getSubmissionPreview(sub);
                    return (
                    <tr
                      key={sub.id}
                      onClick={() => handleOpenGradeModal(sub)}
                      className="hover:bg-blue-50/50 transition cursor-pointer"
                      title="Bấm vào dòng để xem chi tiết bài làm & chấm điểm"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 align-top">
                        #{sub.id}
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">{sub.studentName || 'Học sinh'}</div>
                        <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                        {preview && (
                          <div
                            className="mt-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 leading-snug overflow-hidden max-w-[260px]"
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                            title="Bấm để xem chi tiết toàn bộ bài làm"
                          >
                            <span className="font-semibold text-slate-500">Bài làm: </span>
                            {preview}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          {sub.score} / {sub.totalPoints}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({sub.percentage ? sub.percentage.toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.passed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            ĐẠT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                            CHƯA ĐẠT
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.isGraded ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Đã chấm</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Cần chấm tự luận</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleString('vi-VN') : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenGradeModal(sub); }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Xem bài & Chấm</span>
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>

        {/* Modal footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Question Form Dialog (Add/Edit Question) */}
      {isQuestionFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsWordImportOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-emerald-100 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Dán từ Word
                </button>
                <div className="flex bg-emerald-800 rounded-lg p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    className={`px-3 py-1 rounded-md transition ${previewTab === 'edit' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-100 hover:text-white'}`}
                  >
                    Soạn thảo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${previewTab === 'preview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-100 hover:text-white'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem trước
                  </button>
                </div>
                <button
                  onClick={() => setIsQuestionFormOpen(false)}
                  className="text-emerald-200 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewTab === 'edit' ? (
                <form id="questionForm" onSubmit={handleSaveQuestion} className="space-y-4">
                  {/* Select Question Type */}
                  <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Chọn dạng câu hỏi đề thi:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionType('MULTIPLE_CHOICE');
                          if (!['A', 'B', 'C', 'D'].includes(qCorrectAnswer)) setQCorrectAnswer('A');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                          questionType === 'MULTIPLE_CHOICE'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Trắc nghiệm 4 lựa chọn</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestionType('SHORT_ANSWER');
                          setQCorrectAnswer('');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                          questionType === 'SHORT_ANSWER'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Trả lời ngắn / Điền số</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestionType('ESSAY');
                          if (!qCorrectAnswer) setQCorrectAnswer('Xem hướng dẫn chấm và bareme chi tiết');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                          questionType === 'ESSAY'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Tự luận / Bareme chấm</span>
                      </button>
                    </div>
                  </div>

                  {/* Word-like Visual Formatting Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-100 p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-700">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Định dạng văn bản giống Word:
                      </span>
                      <button
                        type="button"
                        onClick={() => applyFormatting('bold')}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 font-bold"
                        title="In đậm (Bold)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('italic')}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 italic"
                        title="In nghiêng (Italic)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('underline')}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 underline"
                        title="Gạch chân (Underline)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('list')}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700"
                        title="Tạo danh sách gạch đầu dòng"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] font-semibold text-emerald-800">
                      Đang gõ vào:{' '}
                      <span className="underline font-bold">
                        {activeField === 'qText'
                          ? 'Đề bài'
                          : activeField === 'explanation'
                          ? 'Lời giải'
                          : `Đáp án ${activeField.replace('option', '')}`}
                      </span>
                    </div>
                  </div>

                  {/* Math, Table & Image Toolbar */}
                  <MathToolbar onInsert={insertSnippet} />

                  {/* Question Text */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nội dung câu hỏi (hỗ trợ công thức LaTeX: $công_thức$, Bảng biến thiên, Bảng số liệu, ảnh) *
                    </label>
                    <textarea
                      ref={qTextRef}
                      rows={4}
                      value={qText}
                      onFocus={() => setActiveField('qText')}
                      onChange={(e) => setQText(e.target.value)}
                      required
                      placeholder="ví dụ: Cho hàm số y = f(x) có bảng biến thiên dưới đây. Tìm số điểm cực trị của hàm số..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                    />
                  </div>

                  {/* Graph Plotter & Question Image Paste Zone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {/* Chart Plotter trigger */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <LineChart className="w-3.5 h-3.5 text-blue-600" />
                          Đồ thị tọa độ Oxy / Biểu đồ
                        </label>
                        {qChartConfig && (
                          <button
                            type="button"
                            onClick={() => setQChartConfig('')}
                            className="text-xs text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
                          >
                            Xóa biểu đồ
                          </button>
                        )}
                      </div>

                      {qChartConfig ? (
                        <div className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col items-center">
                          <ChartPlotter config={qChartConfig} width={280} height={180} />
                          <button
                            type="button"
                            onClick={() => setIsChartModalOpen(true)}
                            className="mt-2 text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            Chỉnh sửa tham số đồ thị
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsChartModalOpen(true)}
                          className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        >
                          <LineChart className="w-6 h-6" />
                          <span className="text-xs font-bold">Mở công cụ vẽ đồ thị Oxy / Biểu đồ</span>
                          <span className="text-[11px] text-slate-400">Hàm bậc 3, phân thức, parabol, tiệm cận...</span>
                        </button>
                      )}
                    </div>

                    {/* Image Paste Zone */}
                    <div>
                      <ImagePasteZone value={qImageUrl} onChange={setQImageUrl} />
                    </div>
                  </div>

                  {/* RENDER ANSWER INPUT ACCORDING TO QUESTION TYPE */}
                  {questionType === 'MULTIPLE_CHOICE' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 block">
                        Các phương án trả lời & Chọn đáp án đúng:
                      </label>

                      {[
                        { key: 'A', value: qOptionA, setter: setQOptionA, ref: optionARef, fieldName: 'optionA' as ActiveFieldName },
                        { key: 'B', value: qOptionB, setter: setQOptionB, ref: optionBRef, fieldName: 'optionB' as ActiveFieldName },
                        { key: 'C', value: qOptionC, setter: setQOptionC, ref: optionCRef, fieldName: 'optionC' as ActiveFieldName },
                        { key: 'D', value: qOptionD, setter: setQOptionD, ref: optionDRef, fieldName: 'optionD' as ActiveFieldName },
                      ].map((opt) => (
                        <div key={opt.key} className="flex items-center gap-2.5">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title="Chọn làm đáp án đúng">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={opt.key}
                              checked={qCorrectAnswer === opt.key}
                              onChange={(e) => setQCorrectAnswer(e.target.value)}
                              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${qCorrectAnswer === opt.key ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}>
                              {opt.key}
                            </span>
                          </label>
                          <input
                            ref={opt.ref}
                            type="text"
                            value={opt.value}
                            onFocus={() => setActiveField(opt.fieldName)}
                            onChange={(e) => opt.setter(e.target.value)}
                            placeholder={`Nội dung đáp án ${opt.key} (dùng LaTeX: $x = -1$ hoặc chèn ảnh)`}
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOptionImageTarget(opt.key as any);
                              setTempOptionImgUrl('');
                            }}
                            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-lg transition"
                            title={`Chèn ảnh vào đáp án ${opt.key}`}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {questionType === 'TRUE_FALSE_4' && (
                    <div className="space-y-3 p-4 bg-purple-50/50 border border-purple-200 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-purple-600" />
                          4 Ý mệnh đề a, b, c, d (Chuẩn định dạng đề thi THPT 2025 của Bộ GD&ĐT):
                        </label>
                        <span className="text-[11px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                          Thang điểm 2025: 1 ý = 10%, 2 ý = 25%, 3 ý = 50%, 4 ý = 100%
                        </span>
                      </div>

                      {[
                        { key: 'a' as const, label: 'a)', value: qOptionA, setter: setQOptionA, fieldName: 'optionA' as ActiveFieldName },
                        { key: 'b' as const, label: 'b)', value: qOptionB, setter: setQOptionB, fieldName: 'optionB' as ActiveFieldName },
                        { key: 'c' as const, label: 'c)', value: qOptionC, setter: setQOptionC, fieldName: 'optionC' as ActiveFieldName },
                        { key: 'd' as const, label: 'd)', value: qOptionD, setter: setQOptionD, fieldName: 'optionD' as ActiveFieldName },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs">
                          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center shrink-0">
                            {item.key}
                          </span>
                          <input
                            type="text"
                            value={item.value}
                            onFocus={() => setActiveField(item.fieldName)}
                            onChange={(e) => item.setter(e.target.value)}
                            placeholder={`Nội dung ý ${item.label} (ví dụ: Hàm số đồng biến trên khoảng (0; 2))...`}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTf4Keys((prev) => ({ ...prev, [item.key]: 'T' }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                tf4Keys[item.key] === 'T'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => setTf4Keys((prev) => ({ ...prev, [item.key]: 'F' }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                tf4Keys[item.key] === 'F'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" /> Sai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {questionType === 'TRUE_FALSE' && (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Chọn khẳng định mệnh đề của câu hỏi là Đúng hay Sai:
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 p-3 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 flex-1">
                          <input
                            type="radio"
                            name="tfAnswer"
                            value="TRUE"
                            checked={qCorrectAnswer === 'TRUE'}
                            onChange={() => setQCorrectAnswer('TRUE')}
                            className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="text-sm font-bold text-emerald-800">✅ ĐÚNG (Mệnh đề chính xác)</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-rose-500 flex-1">
                          <input
                            type="radio"
                            name="tfAnswer"
                            value="FALSE"
                            checked={qCorrectAnswer === 'FALSE'}
                            onChange={() => setQCorrectAnswer('FALSE')}
                            className="text-rose-600 focus:ring-rose-500 w-4 h-4"
                          />
                          <span className="text-sm font-bold text-rose-800">❌ SAI (Mệnh đề sai)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {questionType === 'SHORT_ANSWER' && (
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Nhập đáp án chuẩn xác để hệ thống tự động chấm điểm:
                      </label>
                      <input
                        type="text"
                        required
                        value={qCorrectAnswer}
                        onChange={(e) => setQCorrectAnswer(e.target.value)}
                        placeholder="ví dụ: 0.5|1/2|0,5 (dùng dấu | để ngăn cách các đáp án tương đương)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-blue-300 rounded-xl font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        * Gợi ý: Có thể cho phép nhiều đáp án tương đương bằng dấu gạch đứng <code className="bg-blue-100 px-1 rounded font-bold">|</code>, ví dụ: <code className="bg-blue-100 px-1 rounded font-bold">0.5|1/2|0,5</code> hoặc <code className="bg-blue-100 px-1 rounded font-bold">4|4a</code>.
                      </p>
                    </div>
                  )}

                  {questionType === 'ESSAY' && (
                    <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Đáp án mẫu & Thang điểm chấm tự luận (Bareme):
                      </label>
                      <textarea
                        rows={3}
                        value={qCorrectAnswer}
                        onChange={(e) => setQCorrectAnswer(e.target.value)}
                        placeholder="Nhập hướng dẫn chấm, các bước giải mẫu, đáp số để đối chiếu bài làm học sinh..."
                        className="w-full px-3.5 py-2 text-sm bg-white border border-rose-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Explanation & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Lời giải chi tiết (hiển thị sau khi học sinh nộp bài)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOptionImageTarget('explanation');
                            setTempOptionImgUrl('');
                          }}
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ImageIcon className="w-3 h-3" /> Chèn ảnh vào lời giải
                        </button>
                      </div>
                      <textarea
                        ref={explanationRef}
                        rows={3}
                        value={qExplanation}
                        onFocus={() => setActiveField('explanation')}
                        onChange={(e) => setQExplanation(e.target.value)}
                        placeholder="Giải thích từng bước, áp dụng công thức, chèn bảng hoặc ảnh để học sinh hiểu bản chất..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Điểm số câu
                      </label>
                      <input
                        type="number"
                        value={qPoints}
                        onChange={(e) => setQPoints(Number(e.target.value))}
                        min={1}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                /* LIVE PREVIEW OF QUESTION */
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Xem trước giao diện người học:
                  </div>

                  <MathView content={qText || 'Chưa nhập nội dung câu hỏi...'} className="text-base font-semibold text-slate-900" />

                  {qChartConfig && (
                    <div className="my-3 flex justify-center">
                      <ChartPlotter config={qChartConfig} width={420} height={260} />
                    </div>
                  )}

                  {qImageUrl && (
                    <div className="my-3 flex justify-center">
                      <img src={qImageUrl} alt="Đính kèm" className="max-h-60 rounded-lg border shadow-sm" />
                    </div>
                  )}

                  {questionType === 'TRUE_FALSE_4' ? (
                    <div className="space-y-2 p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                      <span className="text-xs font-bold text-purple-900 block mb-1">
                        Giao diện 4 ý Đúng/Sai học sinh nhìn thấy:
                      </span>
                      {[
                        { key: 'a', text: qOptionA },
                        { key: 'b', text: qOptionB },
                        { key: 'c', text: qOptionC },
                        { key: 'd', text: qOptionD },
                      ].map((sub) => {
                        const isTrue = tf4Keys[sub.key as keyof typeof tf4Keys] === 'T';
                        return (
                          <div key={sub.key} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-purple-900 uppercase text-xs">{sub.key})</span>
                              <MathView content={sub.text || `Ý ${sub.key}`} className="text-xs" />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isTrue ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                Đúng
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${!isTrue ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                Sai
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : questionType === 'SHORT_ANSWER' ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <span className="text-xs text-slate-500 block">Ô nhập câu trả lời của học sinh:</span>
                      <div className="p-2.5 border-2 border-dashed border-blue-200 rounded-lg text-slate-400 text-sm font-mono bg-blue-50/30">
                        Học sinh tự gõ câu trả lời vào đây...
                      </div>
                      <span className="text-[11px] text-blue-700 font-bold block pt-1">
                        Đáp án được chấp nhận: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">{qCorrectAnswer}</code>
                      </span>
                    </div>
                  ) : questionType === 'ESSAY' ? (
                    <div className="p-4 bg-white border border-rose-200 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-rose-900 block">Khu vực làm bài tự luận của học sinh:</span>
                      <div className="p-3 border-2 border-dashed border-rose-200 rounded-lg text-slate-400 text-xs bg-rose-50/30 h-24 flex items-center justify-center">
                        Học sinh gõ lời giải và đính kèm ảnh bài làm viết tay...
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 block mb-1">Đáp án mẫu / Bareme:</span>
                        <MathView content={qCorrectAnswer} className="text-xs text-slate-600" />
                      </div>
                    </div>
                  ) : questionType === 'TRUE_FALSE' ? (
                    <div className="flex items-center gap-3 pt-2">
                      <div className={`p-3 rounded-xl border flex-1 text-center font-bold text-sm ${qCorrectAnswer === 'TRUE' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                        Đúng {qCorrectAnswer === 'TRUE' && '(Đáp án đúng)'}
                      </div>
                      <div className={`p-3 rounded-xl border flex-1 text-center font-bold text-sm ${qCorrectAnswer === 'FALSE' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                        Sai {qCorrectAnswer === 'FALSE' && '(Đáp án đúng)'}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {[
                        { key: 'A', text: qOptionA },
                        { key: 'B', text: qOptionB },
                        { key: 'C', text: qOptionC },
                        { key: 'D', text: qOptionD },
                      ].map((opt) => (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                            qCorrectAnswer === opt.key
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${qCorrectAnswer === opt.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {opt.key}
                          </span>
                          <div className="flex-1">
                            <MathView content={opt.text || `Đáp án ${opt.key}`} />
                          </div>
                          {qCorrectAnswer === opt.key && (
                            <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {qExplanation && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-xs font-bold text-emerald-900 block mb-1">
                        Lời giải chi tiết:
                      </span>
                      <MathView content={qExplanation} className="text-xs text-emerald-800" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsQuestionFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="questionForm"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Quick Import Modal */}
      {isWordImportOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Nhập nhanh đề thi từ Word (Copy & Paste)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWordImportOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Chỉ cần sao chép câu hỏi từ file Word hoặc PDF và dán vào bên dưới. Hệ thống sẽ tự động bóc tách Đề bài, Đáp án A-D, Đáp án đúng và Lời giải!
            </p>

            <textarea
              rows={8}
              value={wordRawText}
              onChange={(e) => setWordRawText(e.target.value)}
              placeholder={`Ví dụ mẫu:\nCâu 1: Cho hàm số y = x^3 - 3x. Tìm số điểm cực trị của hàm số.\nA. 0\nB. 1\nC. 2\nD. 3\nĐáp án: C\nLời giải: Ta có y' = 3x^2 - 3 = 0 có 2 nghiệm phân biệt.`}
              className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-[11px] text-slate-400">
                Hỗ trợ cả dạng Trắc nghiệm, Đúng/Sai và Điền số
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWordImportOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!wordRawText.trim()}
                  onClick={handleParseWordText}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" /> Bóc tách & Điền vào Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Option Image Modal */}
      {optionImageTarget && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" /> Chèn ảnh vào{' '}
                {optionImageTarget === 'explanation' ? 'Lời giải chi tiết' : `Đáp án ${optionImageTarget}`}
              </h4>
              <button
                type="button"
                onClick={() => setOptionImageTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ImagePasteZone
              value={tempOptionImgUrl}
              onChange={setTempOptionImgUrl}
              label="Dán ảnh chụp màn hình Ctrl+V hoặc chọn file:"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setOptionImageTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!tempOptionImgUrl.trim()}
                onClick={handleApplyOptionImage}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50"
              >
                Xác nhận chèn ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Editor Modal */}
      <ChartEditorModal
        isOpen={isChartModalOpen}
        initialConfig={qChartConfig}
        onClose={() => setIsChartModalOpen(false)}
        onSave={(json) => setQChartConfig(json)}
      />

      {/* Azota Word Parser Modal (Chuẩn Bộ GD&ĐT 2025) */}
      {activeQuiz && (
        <AzotaWordParserModal
          isOpen={isAzotaModalOpen}
          onClose={() => setIsAzotaModalOpen(false)}
          quizId={activeQuiz.id}
          onSuccess={async () => {
            const updated = await quizApi.getAdminQuiz(activeQuiz.id);
            setActiveQuiz(updated);
            fetchQuizzes();
          }}
        />
      )}

      {/* MODAL XEM BÀI NỘP & CHẤM ĐIỂM TỰ LUẬN */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-zoomIn">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Chấm điểm & Nhận xét bài làm học sinh
                </div>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedSubmissionForGrading.studentName} ({selectedSubmissionForGrading.studentEmail})
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmissionForGrading(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content: Questions + Essay answers */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Điểm trắc nghiệm tự động:</span>{' '}
                  <strong className="text-blue-700 text-sm font-black">{selectedSubmissionForGrading.score} / {selectedSubmissionForGrading.totalPoints}</strong>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Thời gian làm:</span>{' '}
                  <span className="text-slate-800">{Math.round((selectedSubmissionForGrading.timeSpentSeconds || 0) / 60)} phút</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Trạng thái:</span>{' '}
                  <span className={selectedSubmissionForGrading.isGraded ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {selectedSubmissionForGrading.isGraded ? 'Đã chấm xong' : 'Đang chờ chấm tự luận'}
                  </span>
                </div>
              </div>

              {/* Questions Review */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chi tiết từng câu hỏi & bài làm của học sinh
                </h4>

                {selectedSubmissionForGrading.questionResults && selectedSubmissionForGrading.questionResults.length > 0 ? (
                  selectedSubmissionForGrading.questionResults.map((qr, idx) => {
                    const isEssay = qr.questionType === 'ESSAY';
                    return (
                      <div
                        key={qr.questionId || idx}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isEssay
                            ? 'bg-amber-50/40 border-amber-300'
                            : qr.isCorrect
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-rose-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {isEssay ? 'TỰ LUẬN (Cần giáo viên chấm)' : qr.questionType}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            {qr.pointsEarned !== undefined ? qr.pointsEarned : 0} / {qr.maxPoints || 10} điểm
                          </span>
                        </div>

                        {/* Question text */}
                        <MathView content={qr.questionText} className="text-sm font-bold text-slate-900" />

                        {/* Essay or other answer */}
                        {isEssay ? (
                          <div className="space-y-3 pt-2">
                            <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                                Bài làm tự luận của học sinh:
                              </span>
                              <div className="text-xs text-slate-900 whitespace-pre-wrap font-medium">
                                <MathView content={qr.userAnswer || 'Học sinh không để lại nội dung'} />
                              </div>
                            </div>

                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                                Đáp án mẫu & Thang điểm (Bareme):
                              </span>
                              <div className="text-xs text-emerald-950 font-medium">
                                <MathView content={qr.correctAnswer} />
                              </div>
                              {qr.explanation && (
                                <div className="text-xs text-slate-700 pt-1 border-t border-emerald-100">
                                  <MathView content={qr.explanation} />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                            <div>
                              <span className="text-slate-500">Học sinh chọn:</span>{' '}
                              <strong className={qr.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                {qr.userAnswer || 'Chưa trả lời'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Đáp án đúng:</span>{' '}
                              <strong className="text-emerald-700">{qr.correctAnswer}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có chi tiết câu hỏi cho bài nộp này.</p>
                )}
              </div>

              {/* Teacher Grading & Feedback Form */}
              <form id="gradeForm" onSubmit={handleSaveGrade} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Phần Chấm Điểm & Lời Phê Của Giáo Viên
                  </h4>
                </div>

                {essayQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Điểm trắc nghiệm tự chấm + tổng tạm tính */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl font-bold text-slate-700">
                        Điểm trắc nghiệm (tự chấm): <span className="text-emerald-700">{objectiveScore}</span>
                      </span>
                      <span className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl font-bold text-slate-700">
                        Điểm tự luận: <span className="text-blue-700">{essaySum}</span>
                      </span>
                      <span className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-black">
                        Tổng: {computedTotalGrade} / {selectedSubmissionForGrading.totalPoints} điểm
                      </span>
                    </div>

                    {/* Chấm từng câu tự luận */}
                    <div className="space-y-3">
                      {essayQuestions.map((qr) => {
                        const qNumber =
                          (selectedSubmissionForGrading.questionResults || []).findIndex(
                            (x) => x.questionId === qr.questionId
                          ) + 1;
                        const g = essayGrades[qr.questionId] || { score: 0, feedback: '' };
                        return (
                          <div key={qr.questionId} className="p-4 bg-white border border-blue-200 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                  Câu {qNumber} · Tự luận
                                </span>
                                <div className="mt-1.5">
                                  <MathView content={qr.questionText} className="text-xs font-bold text-slate-900" />
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-lg text-xs">
                              <span className="font-bold text-slate-600 block mb-1">Bài làm của học sinh:</span>
                              <MathView content={qr.userAnswer || qr.essayAnswer || 'Không có bài làm'} className="text-slate-800" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                  Điểm (0 - {qr.maxPoints})
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={qr.maxPoints}
                                  value={g.score}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(qr.maxPoints, Number(e.target.value)));
                                    setEssayGrades((prev) => ({
                                      ...prev,
                                      [qr.questionId]: { ...g, score: val },
                                    }));
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-sm text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                  Nhận xét câu này
                                </label>
                                <input
                                  type="text"
                                  value={g.feedback}
                                  onChange={(e) =>
                                    setEssayGrades((prev) => ({
                                      ...prev,
                                      [qr.questionId]: { ...g, feedback: e.target.value },
                                    }))
                                  }
                                  placeholder="VD: Đúng hướng nhưng thiếu bước kết luận..."
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Lời phê chung cho cả bài (tùy chọn)
                      </label>
                      <textarea
                        rows={2}
                        value={gradeInputFeedback}
                        onChange={(e) => setGradeInputFeedback(e.target.value)}
                        placeholder="Nhận xét tổng quát về bài làm của học sinh..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tổng điểm chấm (0 - {selectedSubmissionForGrading.totalPoints}) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={selectedSubmissionForGrading.totalPoints}
                        value={gradeInputScore}
                        onChange={(e) => setGradeInputScore(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-sm text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Lời phê & Nhận xét chi tiết của Giáo viên
                      </label>
                      <textarea
                        rows={3}
                        value={gradeInputFeedback}
                        onChange={(e) => setGradeInputFeedback(e.target.value)}
                        placeholder="Nhận xét bài làm của học sinh: Biểu dương ý đúng, chỉ ra các bước sai sót và hướng dẫn cách hoàn thiện..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubmissionForGrading(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                form="gradeForm"
                disabled={gradingSubmitting}
                className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{gradingSubmitting ? 'Đang lưu...' : 'Lưu điểm & Gửi nhận xét cho học sinh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
