import React, { useState, useEffect } from 'react';
import { quizApi } from '../../api/quizApi';
import { Quiz, QuizResult, Lesson, QuizQuestionResult, QuizQuestion } from '../../types';
import { MathView } from './MathView';
import { ChartPlotter } from './ChartPlotter';
import { ImagePasteZone } from './ImagePasteZone';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  Send,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Flag,
  Check,
  X,
  Scale,
  MessageSquare,
  FileText,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StudentQuizRunnerProps {
  lesson: Lesson;
}

export const StudentQuizRunner: React.FC<StudentQuizRunnerProps> = ({ lesson }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  // Runner state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setQuizResult(null);
    setUserAnswers({});
    setFlaggedQuestions({});
    try {
      const data = await quizApi.getLessonQuizzes(lesson.id);
      setQuizzes(data || []);
      if (data && data.length > 0) {
        setActiveQuiz(data[0]);
        if (data[0].timeLimitMinutes) {
          setTimeLeft(data[0].timeLimitMinutes * 60);
        }
        // Check if student has previous result
        try {
          const prev = await quizApi.getMyLatestResult(data[0].id);
          if (prev) {
            setQuizResult(prev);
          }
        } catch {}
      } else {
        setActiveQuiz(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [lesson.id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizResult]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    if (quizResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSelectTrueFalse4 = (questionId: number, subKey: string, val: 'T' | 'F') => {
    if (quizResult) return;
    setUserAnswers((prev) => {
      let currentMap: Record<string, string> = {};
      try {
        currentMap = JSON.parse(prev[questionId] || '{}');
      } catch {
        currentMap = {};
      }
      currentMap[subKey] = val;
      return {
        ...prev,
        [questionId]: JSON.stringify(currentMap),
      };
    });
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const isQuestionAnswered = (q: QuizQuestion): boolean => {
    if (!q.id) return false;
    const ans = userAnswers[q.id];
    if (!ans) return false;
    if (q.questionType === 'TRUE_FALSE_4') {
      try {
        const obj = JSON.parse(ans);
        return Object.keys(obj).length === 4;
      } catch {
        return false;
      }
    }
    return ans.trim().length > 0;
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const res = await quizApi.submitQuiz(activeQuiz.id, {
        quizId: activeQuiz.id,
        timeSpentSeconds: activeQuiz.timeLimitMinutes
          ? activeQuiz.timeLimitMinutes * 60 - (timeLeft || 0)
          : 60,
        answers: userAnswers,
      });

      setQuizResult(res);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    if (activeQuiz?.timeLimitMinutes) {
      setTimeLeft(activeQuiz.timeLimitMinutes * 60);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Đang tải bài tập...</p>
      </div>
    );
  }

  if (!activeQuiz || !activeQuiz.questions || activeQuiz.questions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <h4 className="font-bold text-slate-700 text-sm">Chưa có bài kiểm tra cho bài học này</h4>
        <p className="text-xs text-slate-400 mt-1">
          Giáo viên chưa cập nhật câu hỏi hoặc bài kiểm tra đang được biên soạn.
        </p>
      </div>
    );
  }

  const currentQ = activeQuiz.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz.questions.length;
  const answeredCount = activeQuiz.questions.filter(isQuestionAnswered).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Safe question results computation
  const resolvedQuestionResults: QuizQuestionResult[] = quizResult
    ? quizResult.questionResults && quizResult.questionResults.length > 0
      ? quizResult.questionResults
      : (quizResult.questionsWithExplanations || []).map((q) => {
          const userAns = (quizResult.userAnswers && quizResult.userAnswers[q.id!]) || '';
          const isCorrect = userAns.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase();
          return {
            questionId: q.id!,
            questionText: q.questionText,
            questionType: q.questionType,
            imageUrl: q.imageUrl,
            chartConfig: q.chartConfig,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            userAnswer: userAns,
            correctAnswer: q.correctAnswer || '',
            isCorrect,
            explanation: q.explanation,
            pointsEarned: isCorrect ? (q.points || 10) : 0,
            maxPoints: q.points || 10,
          };
        })
    : [];

  const maxScore = quizResult?.maxScore ?? quizResult?.totalPoints ?? 100;

  return (
    <div className="space-y-6">
      {/* Quiz Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" /> Bài kiểm tra củng cố
          </div>
          <h3 className="text-lg font-black">{activeQuiz.title}</h3>
          <p className="text-xs text-emerald-100 mt-0.5">{activeQuiz.description}</p>
        </div>

        {/* Time Left & Progress Indicators */}
        <div className="flex items-center gap-3 shrink-0">
          {timeLeft !== null && !quizResult && (
            <div className="flex items-center gap-1.5 bg-black/25 px-3.5 py-2 rounded-2xl text-xs font-mono font-black border border-white/10 shadow-inner">
              <Clock className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}
          <div className="bg-white/15 px-3.5 py-2 rounded-2xl text-xs font-bold border border-white/10">
            {answeredCount}/{totalQuestions} câu đã làm
          </div>
        </div>
      </div>

      {/* QUIZ RESULT REPORT (If submitted) */}
      {quizResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          {/* THÔNG BÁO ĐÃ NỘP KHI GIÁO VIÊN ẨN ĐIỂM */}
          {quizResult.showScore === false && (
            <div className="pb-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-lg font-black text-slate-900">Đã nộp bài thành công!</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Giáo viên đang ẩn điểm cho bài kiểm tra này. Điểm số, kết quả và đáp án sẽ được công bố sau. Vui lòng quay lại xem kết quả khi giáo viên mở hiển thị.
                  </p>
                </div>
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" /> Làm lại bài
                </button>
              </div>
            </div>
          )}

          {/* BẢNG TỔNG KẾT ĐIỂM NỔI BẬT (giống trang kết quả Google Form) */}
          {quizResult.showScore !== false && (() => {
            const pct = Math.max(0, Math.min(100, quizResult.percentage || 0));
            const pendingCount = resolvedQuestionResults.filter((r) => r.pendingGrade).length;
            const wrongCount = Math.max(
              0,
              quizResult.totalQuestions - quizResult.correctCount - pendingCount
            );
            const ringColor = quizResult.passed ? '#10b981' : '#f43f5e';
            const R = 52;
            const C = 2 * Math.PI * R;
            return (
              <div className="pb-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Vòng tròn phần trăm */}
                  <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                      <circle cx="60" cy="60" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
                      <circle
                        cx="60"
                        cy="60"
                        r={R}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        strokeDashoffset={C - (C * pct) / 100}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">{pct.toFixed(0)}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm số</span>
                    </div>
                  </div>

                  {/* Thông tin & tiles */}
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      {quizResult.passed ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500" />
                      )}
                      <h4 className="text-xl font-black text-slate-900">
                        {quizResult.passed ? 'Chúc mừng! Bạn đã đạt yêu cầu' : 'Cần ôn tập thêm kiến thức'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-lg font-black text-slate-900">{quizResult.score}<span className="text-xs text-slate-400 font-bold">/{maxScore}</span></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Điểm</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-lg font-black text-emerald-700">{quizResult.correctCount}</div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">Câu đúng</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                        <div className="text-lg font-black text-rose-700">{wrongCount}</div>
                        <div className="text-[10px] font-bold text-rose-600 uppercase">Câu sai</div>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`text-lg font-black ${pendingCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{pendingCount}</div>
                        <div className={`text-[10px] font-bold uppercase ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Chờ chấm</div>
                      </div>
                    </div>

                    <button
                      onClick={handleRetake}
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md transition cursor-pointer mx-auto sm:mx-0"
                    >
                      <RotateCcw className="w-4 h-4" /> Làm lại bài kiểm tra
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ESSAY PENDING GRADING NOTICE */}
          {quizResult.isGraded === false && quizResult.showScore !== false && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs animate-fadeIn">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                  <span>Bài làm tự luận đang chờ Giáo viên chấm điểm</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                    Chờ duyệt
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  Bài kiểm tra này có câu hỏi dạng Tự luận. Điểm số trắc nghiệm đã được ghi nhận trước ({quizResult.score}/{maxScore} điểm). Thầy/Cô sẽ xem bài làm, chấm điểm chi tiết và gửi nhận xét sớm nhất cho bạn.
                </p>
              </div>
            </div>
          )}

          {/* TEACHER FEEDBACK CARD (If teacher has graded and left feedback) */}
          {quizResult.teacherFeedback && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-blue-200/90 text-slate-800 space-y-2.5 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                    👨‍🏫
                  </span>
                  <span>Lời phê & Nhận xét của Giáo viên ({quizResult.gradedBy || 'Giáo viên bộ môn'})</span>
                </div>
                {quizResult.gradedAt && (
                  <span className="text-[10px] text-slate-500 font-bold bg-white/70 px-2 py-0.5 rounded-md">
                    {new Date(quizResult.gradedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs italic text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-2xs">
                "{quizResult.teacherFeedback}"
              </div>
            </div>
          )}

          {/* Detailed Question Review with step-by-step LaTeX formulas, tables, and graphs */}
          {quizResult.showScore !== false && (
          <div className="space-y-4">
            <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Chi tiết bài làm & Lời giải từng câu:
            </h5>
            {resolvedQuestionResults.map((qr, idx) => {
              const qType = qr.questionType || 'MULTIPLE_CHOICE';

              let tfUserMap: Record<string, string> = {};
              let tfCorrectMap: Record<string, string> = {};

              if (qType === 'TRUE_FALSE_4') {
                try {
                  tfUserMap = JSON.parse(qr.userAnswer || '{}');
                } catch {
                  tfUserMap = {};
                }
                try {
                  tfCorrectMap = JSON.parse(qr.correctAnswer || '{}');
                } catch {
                  tfCorrectMap = { a: 'T', b: 'F', c: 'T', d: 'F' };
                }
              }

              return (
                <div
                  key={qr.questionId || idx}
                  className={`p-5 rounded-2xl border space-y-3.5 transition ${
                    qr.pendingGrade
                      ? 'bg-amber-50/40 border-amber-200'
                      : qr.isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 shadow-xs ${
                          qr.pendingGrade
                            ? 'bg-amber-500 text-white'
                            : qr.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {qType === 'TRUE_FALSE_4'
                              ? 'Đúng / Sai 4 ý (Chuẩn 2025)'
                              : qType === 'SHORT_ANSWER'
                              ? 'Trả lời ngắn'
                              : qType === 'ESSAY'
                              ? 'Tự luận'
                              : 'Trắc nghiệm 4 lựa chọn'}
                          </span>
                        </div>

                        <MathView content={qr.questionText} className="text-sm font-bold text-slate-900" />

                        {qr.chartConfig && (
                          <div className="my-2 inline-block">
                            <ChartPlotter config={qr.chartConfig} width={340} height={200} />
                          </div>
                        )}

                        {qr.imageUrl && (
                          <div className="my-2">
                            <img
                              src={qr.imageUrl}
                              alt="Minh họa câu hỏi"
                              className="max-h-48 rounded-xl border border-slate-200 object-contain shadow-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {qr.pendingGrade ? (
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl inline-block bg-amber-100 text-amber-800">
                          Chờ chấm / {qr.maxPoints} điểm
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl inline-block ${
                            qr.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          +{qr.pointsEarned} / {qr.maxPoints} điểm
                        </span>
                      )}
                      {qType === 'TRUE_FALSE_4' && qr.subCorrectCount !== undefined && (
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">
                          Đúng {qr.subCorrectCount}/4 ý
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Review Content by Type */}
                  <div className="pl-10 space-y-2">
                    {qType === 'TRUE_FALSE_4' ? (
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                          <span>Ý mệnh đề</span>
                          <span>Bạn chọn / Đáp án đúng</span>
                        </div>
                        {[
                          { key: 'a', text: qr.optionA },
                          { key: 'b', text: qr.optionB },
                          { key: 'c', text: qr.optionC },
                          { key: 'd', text: qr.optionD },
                        ].map((sub) => {
                          const userVal = tfUserMap[sub.key];
                          const correctVal = tfCorrectMap[sub.key];
                          const subCorrect = userVal && userVal === correctVal;

                          return (
                            <div key={sub.key} className="flex items-center justify-between gap-3 py-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-purple-900 uppercase">{sub.key})</span>
                                <MathView content={sub.text || ''} />
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  userVal === 'T' ? 'bg-emerald-100 text-emerald-800' : userVal === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  Bạn: {userVal === 'T' ? 'ĐÚNG' : userVal === 'F' ? 'SAI' : 'Chưa chọn'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  correctVal === 'T' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                  ĐA: {correctVal === 'T' ? 'ĐÚNG' : 'SAI'}
                                </span>
                                {subCorrect ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <X className="w-4 h-4 text-rose-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[10px] text-purple-700 italic pt-1 border-t border-slate-100">
                          * Thang điểm Bộ GD&ĐT 2025: Đúng 1 ý = 10% điểm; Đúng 2 ý = 25% điểm; Đúng 3 ý = 50% điểm; Đúng cả 4 ý = 100% điểm.
                        </p>
                      </div>
                    ) : qType === 'SHORT_ANSWER' ? (
                      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
                        <span>
                          Đáp án của bạn: <strong className={qr.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {qr.userAnswer || 'Chưa trả lời'}
                          </strong>
                        </span>
                        <span>
                          Đáp án đúng / chấp nhận: <strong className="text-emerald-700 font-mono font-bold">
                            {qr.correctAnswer}
                          </strong>
                        </span>
                      </div>
                    ) : qType === 'ESSAY' ? (
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Bài làm đã nộp:</span>
                          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800">
                            <MathView content={qr.userAnswer || 'Không có bài làm'} />
                          </div>
                        </div>

                        {/* Điểm & nhận xét của giáo viên cho câu tự luận này */}
                        {qr.pendingGrade ? (
                          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-800 font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Câu này đang chờ giáo viên chấm điểm.
                          </div>
                        ) : (
                          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>👨‍🏫 Giáo viên chấm: {qr.pointsEarned}/{qr.maxPoints} điểm</span>
                            </div>
                            {qr.teacherComment && (
                              <div className="italic text-blue-800 whitespace-pre-wrap">"{qr.teacherComment}"</div>
                            )}
                          </div>
                        )}

                        {qr.correctAnswer && (
                          <div>
                            <span className="font-bold text-emerald-700 block mb-1">Hướng dẫn chấm & Đáp án mẫu:</span>
                            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-900">
                              <MathView content={qr.correctAnswer} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : qType === 'TRUE_FALSE' ? (
                      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
                        <span className="flex items-center gap-1.5">
                          Đáp án của bạn:
                          <strong className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            qr.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {qr.userAnswer === 'TRUE' ? 'ĐÚNG (True)' : qr.userAnswer === 'FALSE' ? 'SAI (False)' : (qr.userAnswer || 'Chưa trả lời')}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          Đáp án đúng:
                          <strong className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                            {qr.correctAnswer === 'TRUE' ? 'ĐÚNG (True)' : qr.correctAnswer === 'FALSE' ? 'SAI (False)' : qr.correctAnswer}
                          </strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
                        <span>
                          Đáp án của bạn:{' '}
                          <strong className={qr.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {qr.userAnswer ? `Phương án ${qr.userAnswer}` : 'Chưa chọn'}
                          </strong>
                        </span>
                        <span>
                          Đáp án đúng:{' '}
                          <strong className="text-emerald-700 font-bold">
                            Phương án {qr.correctAnswer}
                          </strong>
                        </span>
                      </div>
                    )}

                    {qr.explanation && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-xs">
                        <span className="font-bold text-slate-900 block mb-1">Lời giải chi tiết:</span>
                        <MathView content={qr.explanation} />
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

      {/* QUESTION RUNNER (When not submitted yet) */}
      {!quizResult && currentQ && (
        <div className="space-y-4">
          {/* Question Palette / Navigation Grid (Azota Style) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Bản đồ câu hỏi đề thi:
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đã làm ({answeredCount})
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Chưa làm ({unansweredCount})
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Đánh dấu xem lại
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeQuiz.questions.map((q, idx) => {
                const isAnswered = isQuestionAnswered(q);
                const isCurrent = currentQuestionIndex === idx;
                const isFlagged = !!flaggedQuestions[q.id!];

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`relative w-9 h-9 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-900/20 scale-105 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Workspace */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                    {currentQ.questionType === 'TRUE_FALSE_4'
                      ? 'Đúng / Sai 4 ý (2025)'
                      : currentQ.questionType === 'SHORT_ANSWER'
                      ? 'Trả lời ngắn'
                      : currentQ.questionType === 'ESSAY'
                      ? 'Tự luận'
                      : 'Trắc nghiệm 4 lựa chọn'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    &bull; {currentQ.points || 10} điểm
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlagQuestion(currentQ.id!)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    flaggedQuestions[currentQ.id!]
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flaggedQuestions[currentQ.id!] ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}
                </button>
              </div>

              <MathView
                content={currentQ.questionText}
                className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed pt-1"
              />

              {/* Function Curve / Coordinate Graph */}
              {currentQ.chartConfig && (
                <div className="my-4 flex justify-center">
                  <ChartPlotter config={currentQ.chartConfig} width={420} height={260} />
                </div>
              )}

              {/* Attached / Pasted Image */}
              {currentQ.imageUrl && (
                <div className="my-4 flex justify-center">
                  <img
                    src={currentQ.imageUrl}
                    alt="Minh họa câu hỏi"
                    className="max-h-64 rounded-2xl border border-slate-200 shadow-sm object-contain"
                  />
                </div>
              )}
            </div>

            {/* DYNAMIC QUESTION TYPE INPUTS */}
            {currentQ.questionType === 'TRUE_FALSE_4' ? (
              /* TRUE / FALSE 4 SUB-ITEMS (Standard 2025 format) */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-purple-600" />
                    Mỗi khẳng định dưới đây, hãy bấm chọn Đúng hoặc Sai:
                  </span>
                  <span className="text-[11px] font-semibold text-purple-700">
                    Chuẩn đề Bộ GD&ĐT 2025
                  </span>
                </div>

                {(() => {
                  let userTfMap: Record<string, string> = {};
                  try {
                    userTfMap = JSON.parse(userAnswers[currentQ.id!] || '{}');
                  } catch {
                    userTfMap = {};
                  }

                  return (
                    <div className="space-y-2.5">
                      {[
                        { key: 'a', text: currentQ.optionA },
                        { key: 'b', text: currentQ.optionB },
                        { key: 'c', text: currentQ.optionC },
                        { key: 'd', text: currentQ.optionD },
                      ].map((sub) => {
                        if (!sub.text) return null;
                        const selectedVal = userTfMap[sub.key];
                        return (
                          <div
                            key={sub.key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center shrink-0 uppercase mt-0.5">
                                {sub.key}
                              </span>
                              <div className="flex-1">
                                <MathView content={sub.text} className="text-sm font-medium text-slate-800" />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse4(currentQ.id!, sub.key, 'T')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  selectedVal === 'T'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                                    : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" /> Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse4(currentQ.id!, sub.key, 'F')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  selectedVal === 'F'
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                                    : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-300'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" /> Sai
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : currentQ.questionType === 'SHORT_ANSWER' ? (
              /* SHORT ANSWER / FILL IN NUMBER */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập câu trả lời của bạn (số, phân số hoặc chữ ngắn):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswers[currentQ.id!] || ''}
                    onChange={(e) => handleSelectOption(currentQ.id!, e.target.value)}
                    placeholder="Ví dụ: 12, 0.5, hoặc 1/2..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-base font-semibold text-slate-900 outline-hidden transition shadow-inner"
                  />
                  {userAnswers[currentQ.id!] && (
                    <button
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id!, '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  * Hệ thống chấp nhận cả số thập phân dấu chấm (.), phẩy (,) hoặc phân số (a/b).
                </p>
              </div>
            ) : currentQ.questionType === 'ESSAY' ? (
              /* ESSAY / HANDWRITTEN PHOTO */
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập bài giải chi tiết hoặc tải ảnh chụp bài làm trên giấy:
                </label>
                <textarea
                  rows={5}
                  value={userAnswers[currentQ.id!] || ''}
                  onChange={(e) => handleSelectOption(currentQ.id!, e.target.value)}
                  placeholder="Gõ các bước giải, kết luận của bài toán... (Bạn cũng có thể chụp ảnh vở bài làm và dán vào bên dưới)"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-hidden transition shadow-inner resize-none"
                />
                <ImagePasteZone
                  value=""
                  onChange={(url) => {
                    const current = userAnswers[currentQ.id!] || '';
                    const appended = current + (current ? '\n\n' : '') + `![Ảnh bài làm](${url})`;
                    handleSelectOption(currentQ.id!, appended);
                  }}
                  label="Đính kèm ảnh bài làm viết tay (Chụp từ điện thoại / Dán ảnh Ctrl+V / Chọn file):"
                />
              </div>
            ) : currentQ.questionType === 'TRUE_FALSE' ? (
              /* SINGLE TRUE / FALSE SELECTION */
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id!, 'TRUE')}
                  className={`py-5 px-6 rounded-2xl border-2 text-center transition-all cursor-pointer font-black text-base flex flex-col items-center gap-2 ${
                    userAnswers[currentQ.id!] === 'TRUE'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <CheckCircle className="w-8 h-8" />
                  <span>ĐÚNG (True)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id!, 'FALSE')}
                  className={`py-5 px-6 rounded-2xl border-2 text-center transition-all cursor-pointer font-black text-base flex flex-col items-center gap-2 ${
                    userAnswers[currentQ.id!] === 'FALSE'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25 scale-[1.02]'
                      : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <XCircle className="w-8 h-8" />
                  <span>SAI (False)</span>
                </button>
              </div>
            ) : (
              /* MULTIPLE CHOICE 4 OPTIONS (A, B, C, D) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'A', text: currentQ.optionA },
                  { key: 'B', text: currentQ.optionB },
                  { key: 'C', text: currentQ.optionC },
                  { key: 'D', text: currentQ.optionD },
                ].map((opt) => {
                  if (!opt.text) return null;
                  const isSelected = userAnswers[currentQ.id!] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id!, opt.key)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <div className="flex-1">
                        <MathView content={opt.text} className="text-sm font-medium" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bottom Controls: Previous, Next, Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Câu trước
              </button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    Câu tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Nộp bài thi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Send className="w-7 h-7" />
            </div>

            <h4 className="text-lg font-black text-slate-900">Xác nhận nộp bài thi?</h4>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs text-slate-600">
              <p>
                Bạn đã hoàn thành: <strong className="text-emerald-600 font-bold">{answeredCount} / {totalQuestions}</strong> câu hỏi.
              </p>
              {unansweredCount > 0 ? (
                <p className="text-rose-600 font-semibold">
                  ⚠️ Còn <strong>{unansweredCount}</strong> câu chưa có câu trả lời. Bạn có muốn kiểm tra lại trước khi nộp không?
                </p>
              ) : (
                <p className="text-emerald-700 font-semibold">
                  🎉 Tuyệt vời! Bạn đã hoàn thành tất cả các câu hỏi trong đề.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'Đồng ý nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
