import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { activationApi } from '../api/activationApi';
import { Course, Lesson } from '../types';
import { StudentQuizRunner } from '../components/quiz/StudentQuizRunner';
import {
  GraduationCap,
  PlayCircle,
  Clock,
  BookOpen,
  KeyRound,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
  Download,
  StickyNote
} from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [contentTab, setContentTab] = useState<'video' | 'quiz'>('video');
  const [lessonNote, setLessonNote] = useState('');

  // Tải ghi chú đã lưu cho bài học đang xem
  useEffect(() => {
    if (!activeLesson) {
      setLessonNote('');
      return;
    }
    try {
      setLessonNote(localStorage.getItem(`lesson_note_${activeLesson.id}`) || '');
    } catch {
      setLessonNote('');
    }
  }, [activeLesson?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const data = await activationApi.getMyCourses();
        setCourses(data);
        if (data.length > 0) {
          setActiveCourse(data[0]);
          if (data[0].lessons && data[0].lessons.length > 0) {
            setActiveLesson(data[0].lessons[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center px-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl mx-auto flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-xs text-slate-500 mb-6">
            Bạn cần đăng nhập tài khoản học viên để truy cập các khóa học đã được kích hoạt.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 bg-primary hover:bg-primary-600 text-white font-extrabold rounded-xl shadow-md shadow-primary/20 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Góc học tập cá nhân</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Khóa Học Của Tôi ({courses.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Học sinh: <strong className="text-slate-800">{user?.fullName}</strong> ({user?.email})
            </p>
          </div>

          <Link
            to="/active-course"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl shadow-md shadow-primary/20 hover:bg-primary-600 transition-all self-start sm:self-auto"
          >
            <KeyRound className="w-4 h-4" />
            <span>Kích hoạt thêm khóa học</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Đang tải các khóa học của bạn...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-primary rounded-2xl mx-auto flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Bạn chưa kích hoạt khóa học nào</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Hãy nhập mã kích hoạt để bắt đầu ôn luyện kiến thức và luyện đề cùng các thầy cô.
            </p>
            <Link
              to="/active-course"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              <span>Đi đến trang kích hoạt</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Active Course Player & Lessons */}
            <div className="lg:col-span-2 space-y-6">
              {activeCourse && (
                <div className="space-y-4">
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                    <button
                      onClick={() => setContentTab('video')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        contentTab === 'video'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <PlayCircle className="w-4 h-4 text-primary" /> Video Bài Giảng
                    </button>
                    <button
                      onClick={() => setContentTab('quiz')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        contentTab === 'quiz'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" /> Làm Bài Tập & Quiz Củng Cố
                    </button>
                  </div>

                  {contentTab === 'video' ? (
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      {/* Real Video Player with Multi-Source Support */}
                      <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                        {(() => {
                          const url = (activeLesson?.videoUrl || '').trim();
                          if (!url) {
                            return (
                              <iframe
                                src="https://www.youtube.com/embed/k5q6G6dG-dE?rel=0&modestbranding=1"
                                title="Bài giảng trực tuyến"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            );
                          }

                          // 1. YouTube (Standard, Shortened youtu.be, Embed, Shorts)
                          if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                            const id = match && match[1] && match[1] !== 'dQw4w9WgXcQ' ? match[1] : 'k5q6G6dG-dE';
                            return (
                              <iframe
                                src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
                                title={activeLesson ? activeLesson.title : activeCourse.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            );
                          }

                          // 2. Vimeo Player
                          if (url.includes('vimeo.com')) {
                            const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
                            const vimeoId = vimeoMatch ? vimeoMatch[1] : '';
                            if (vimeoId) {
                              return (
                                <iframe
                                  src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
                                  title={activeLesson ? activeLesson.title : activeCourse.title}
                                  className="w-full h-full border-0"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                />
                              );
                            }
                          }

                          // 3. Google Drive Embedded Video
                          if (url.includes('drive.google.com')) {
                            const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                            const driveId = driveMatch ? driveMatch[1] : '';
                            const embedUrl = driveId
                              ? `https://drive.google.com/file/d/${driveId}/preview`
                              : url.replace('/view', '/preview');
                            return (
                              <iframe
                                src={embedUrl}
                                title={activeLesson ? activeLesson.title : activeCourse.title}
                                className="w-full h-full border-0"
                                allow="autoplay"
                                allowFullScreen
                              />
                            );
                          }

                          // 4. Direct HTML5 Video (.mp4, .webm, .mov, etc.)
                          const isDirectVideo =
                            url.endsWith('.mp4') ||
                            url.includes('.mp4?') ||
                            url.includes('.webm') ||
                            url.includes('.mov') ||
                            url.includes('.m4v') ||
                            url.startsWith('blob:') ||
                            url.startsWith('data:video');

                          if (isDirectVideo) {
                            return (
                              <video
                                controls
                                controlsList="nodownload"
                                src={url}
                                poster={activeCourse.thumbnailUrl}
                                className="w-full h-full object-contain"
                              >
                                Trình duyệt không hỗ trợ phát video HTML5.
                              </video>
                            );
                          }

                          // 5. Fallback Generic Iframe Embed
                          return (
                            <iframe
                              src={url}
                              title={activeLesson ? activeLesson.title : activeCourse.title}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          );
                        })()}
                      </div>

                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                            {activeLesson ? activeLesson.chapterName : 'Chương trình học'}
                          </span>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {activeLesson ? activeLesson.title : activeCourse.title}
                          </h3>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{activeLesson?.durationMinutes || 45} phút</span>
                        </div>
                      </div>

                      {/* Course Details Tab */}
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-primary">
                              Lớp {activeCourse.grade} &bull; {activeCourse.subject}
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mt-0.5">
                              {activeCourse.title}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Đã kích hoạt bản quyền</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                          {activeCourse.description}
                        </p>

                        {/* Lesson PDF Materials / Attachments Download Card */}
                        {activeLesson?.materialUrl && (
                          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-start sm:items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-600 shadow-xs flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Tài liệu học tập
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-bold">File PDF đính kèm</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 mt-1">
                                  {activeLesson.materialName || 'Tài liệu bài giảng & Phiếu bài tập tự luyện'}
                                </h4>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  Tải về để in phiếu bài tập, tóm tắt công thức và luyện giải song song bài giảng.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <a
                                href={activeLesson.materialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer hover:scale-102"
                              >
                                <Download className="w-4 h-4" />
                                <span>Tải về máy (PDF)</span>
                              </a>
                              <a
                                href={activeLesson.materialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition"
                                title="Mở xem trực tiếp trong tab mới"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Ghi chú học tập của học sinh */}
                        {activeLesson && (
                          <div className="mt-5 bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider">
                                <StickyNote className="w-4 h-4" /> Ghi chú của bạn
                              </label>
                              <span className="text-[10px] text-slate-400">Tự lưu trên trình duyệt của bạn</span>
                            </div>
                            <textarea
                              value={lessonNote}
                              onChange={(e) => {
                                setLessonNote(e.target.value);
                                try {
                                  localStorage.setItem(`lesson_note_${activeLesson.id}`, e.target.value);
                                } catch {}
                              }}
                              rows={5}
                              placeholder="Ghi lại kiến thức trọng tâm, công thức, hoặc câu hỏi muốn hỏi lại thầy cô khi xem bài giảng..."
                              className="w-full px-3 py-2.5 bg-white border border-amber-200 focus:border-amber-400 rounded-xl text-sm text-slate-800 outline-hidden resize-none leading-relaxed"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    activeLesson ? (
                      <StudentQuizRunner lesson={activeLesson} />
                    ) : (
                      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                        Vui lòng chọn bài học ở danh sách bên phải để làm quiz củng cố.
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Right: Course Selection & Lesson List */}
            <div className="space-y-6">
              
              {/* Courses Switcher */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Khóa học của bạn
                </h3>
                <div className="space-y-2">
                  {courses.map((c) => {
                    const isSelected = activeCourse?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCourse(c);
                          if (c.lessons && c.lessons.length > 0) setActiveLesson(c.lessons[0]);
                        }}
                        className={`w-full p-3 text-left rounded-2xl flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-primary-50 border-2 border-primary text-slate-900 shadow-xs'
                            : 'hover:bg-slate-50 border border-slate-100 text-slate-700'
                        }`}
                      >
                        <img
                          src={c.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'}
                          alt={c.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-primary">Lớp {c.grade}</div>
                          <div className="text-xs font-bold truncate">{c.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lesson Playlist */}
              {activeCourse && activeCourse.lessons && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Danh sách bài giảng</span>
                    <span className="text-primary font-bold">{activeCourse.lessons.length} bài</span>
                  </h3>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {activeCourse.lessons.map((lesson, idx) => {
                      const isPlaying = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id || idx}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-all ${
                            isPlaying
                              ? 'bg-primary text-white font-bold'
                              : 'hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PlayCircle className={`w-4 h-4 shrink-0 ${isPlaying ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{lesson.title}</span>
                            {lesson.materialUrl && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-black shrink-0 ${
                                  isPlaying ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700'
                                }`}
                                title="Có tài liệu PDF đính kèm"
                              >
                                PDF
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] shrink-0 ${isPlaying ? 'text-orange-200' : 'text-slate-400'}`}>
                            {lesson.durationMinutes || 45}p
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
