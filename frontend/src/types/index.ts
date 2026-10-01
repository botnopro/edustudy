export type Role = 'ROLE_ADMIN' | 'ROLE_STUDENT';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  gradeLevel?: number;
  schoolName?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface Teacher {
  id: number;
  name: string;
  title: string;
  subject: string;
  avatarUrl?: string;
  bio?: string;
  experienceYears?: number;
  rating?: number;
  studentCount?: number;
  achievements?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Lesson {
  id: number;
  chapterName: string;
  title: string;
  durationMinutes?: number;
  videoUrl?: string;
  materialUrl?: string;
  materialName?: string;
  isFreePreview?: boolean;
  sortOrder?: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  grade: '10' | '11' | '12' | 'DGNL';
  subject: 'TOAN' | 'VAT_LY' | 'HOA_HOC' | 'SINH_HOC' | 'TIENG_ANH' | 'NGU_VAN' | 'TONG_HOP';
  teacherId?: number;
  teacherName?: string;
  teacher?: Teacher;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  thumbnailUrl?: string;
  badge?: string;
  description?: string;
  targetAudience?: string;
  totalLessons?: number;
  totalHours?: number;
  rating?: number;
  studentCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  featuresList?: string;
  lessons?: Lesson[];
}

export interface ActivationCode {
  id: number;
  code: string;
  courseId: number;
  courseTitle: string;
  maxUses: number;
  usedCount: number;
  usedByUserId?: number;
  usedByEmail?: string;
  usedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  batchId?: string;
  notes?: string;
  createdAt?: string;
}

export interface CodeCheckResponse {
  valid: boolean;
  code?: string;
  courseId?: number;
  courseTitle?: string;
  teacherName?: string;
  grade?: string;
  subject?: string;
  thumbnailUrl?: string;
  expiresAt?: string;
  statusMessage?: string;
}

export interface ActivationResponse {
  success: boolean;
  message: string;
  activationCode: string;
  course: Course;
  activatedAt: string;
  expiresAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  actionText?: string;
  actionLink?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Testimonial {
  id: number;
  studentName: string;
  school?: string;
  score?: string;
  content: string;
  avatarUrl?: string;
  targetExam?: string;
  courseName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AdminStats {
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  totalActivationCodes: number;
  totalActivations: number;
  recentActivations: Array<{
    id: number;
    userId: number;
    userEmail: string;
    courseId: number;
    courseTitle: string;
    activationCode: string;
    activatedAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  path?: string;
}

export interface Grade {
  id: number;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ChartConfig {
  type: 'function' | 'bar' | 'line' | 'pie';
  title?: string;
  expression?: string; // e.g. "x^3 - 3*x"
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  points?: Array<{ x: number; y: number; label?: string }>;
  asymptotes?: {
    vertical?: number[];
    horizontal?: number[];
  };
  labels?: string[];
  datasets?: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_4' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  imageUrl?: string;
  chartConfig?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
  sortOrder: number;
}

export interface CourseStudentLeaderboard {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  activatedAt: string;
  quizzesCompleted: number;
  totalScore: number;
  averagePercentage: number;
  rank: number;
}

export interface Quiz {
  id: number;
  lessonId: number;
  lessonTitle?: string;
  courseTitle?: string;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScore: number;
  isActive: boolean;
  shuffleQuestions?: boolean;
  showAnswers?: boolean;
  showScore?: boolean;
  sortOrder: number;
  questions: QuizQuestion[];
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface QuizSubmitAnswer {
  questionId: number;
  selectedAnswer: string;
}

export interface QuizSubmitRequest {
  quizId?: number;
  timeSpentSeconds: number;
  answers: Record<number, string> | QuizSubmitAnswer[];
}

export interface QuizQuestionResult {
  questionId: number;
  questionText: string;
  questionType?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_4' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  imageUrl?: string;
  chartConfig?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean | null;
  explanation?: string;
  pointsEarned: number;
  maxPoints: number;
  subResults?: Record<string, boolean>;
  subCorrectCount?: number;
  essayAnswer?: string;
  teacherComment?: string;
  pendingGrade?: boolean;
}

export interface QuizResult {
  submissionId?: number;
  quizId: number;
  quizTitle?: string;
  score: number;
  maxScore?: number;
  totalPoints?: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds?: number;
  userAnswers?: Record<number, string>;
  questionsWithExplanations?: QuizQuestion[];
  questionResults?: QuizQuestionResult[];
  isGraded?: boolean;
  teacherFeedback?: string;
  teacherScore?: number;
  gradedBy?: string;
  gradedAt?: string;
  showAnswers?: boolean;
  showScore?: boolean;
}

export interface QuizSubmissionAdmin {
  id: number;
  quizId: number;
  quizTitle?: string;
  lessonId?: number;
  userId: number;
  studentName?: string;
  studentEmail?: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  percentage?: number;
  timeSpentSeconds?: number;
  answersJson?: string;
  isGraded: boolean;
  teacherFeedback?: string;
  teacherScore?: number;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  questionGradesJson?: string;
  questionResults?: QuizQuestionResult[];
}

export interface StudentEnrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  activationCode: string;
  activatedAt: string;
  expiresAt?: string;
  progressPercent: number;
}

export interface Student {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  gradeLevel?: number;
  schoolName?: string;
  active: boolean;
  createdAt: string;
  enrolledCoursesCount: number;
  quizSubmissionsCount: number;
  enrolledCourses?: StudentEnrollment[];
}

export interface StudentRequest {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  gradeLevel?: number;
  schoolName?: string;
  active?: boolean;
}

export interface CourseStudent {
  enrollmentId: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  gradeLevel?: number;
  schoolName?: string;
  activationCode?: string;
  activatedAt: string;
  expiresAt?: string;
  progressPercent?: number;
  active?: boolean;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  courseId: number;
  courseTitle: string;
  courseThumbnail?: string;
  amount: number;
  status: OrderStatus;
  transferContent: string;
  notes?: string;
  createdAt?: string;
  paidAt?: string;
  expiresAt?: string;
  approvedBy?: string;
  qrUrl?: string;
}

export interface OrderStatusResponse {
  orderCode: string;
  status: OrderStatus;
}

export interface CreateOrderRequest {
  courseId: number;
  phone?: string;
  notes?: string;
}




