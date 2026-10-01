import api from './client';
import { ApiResponse, Quiz, QuizQuestion, QuizResult, QuizSubmitRequest, QuizSubmissionAdmin } from '../types';

export const quizApi = {
  // Student / Learning
  getLessonQuizzes: async (lessonId: number): Promise<Quiz[]> => {
    const res = await api.get<any, ApiResponse<Quiz[]>>(`/lessons/${lessonId}/quizzes`);
    return res.data;
  },

  getQuizDetails: async (quizId: number): Promise<Quiz> => {
    const res = await api.get<any, ApiResponse<Quiz>>(`/quizzes/${quizId}`);
    return res.data;
  },

  submitQuiz: async (quizId: number, data: QuizSubmitRequest): Promise<QuizResult> => {
    const res = await api.post<any, ApiResponse<QuizResult>>(`/quizzes/${quizId}/submit`, data);
    return res.data;
  },

  getMyLatestResult: async (quizId: number): Promise<QuizResult | null> => {
    const res = await api.get<any, ApiResponse<QuizResult | null>>(`/quizzes/${quizId}/my-result`);
    return res.data;
  },

  // Admin
  getAdminLessonQuizzes: async (lessonId: number): Promise<Quiz[]> => {
    const res = await api.get<any, ApiResponse<Quiz[]>>(`/admin/lessons/${lessonId}/quizzes`);
    return res.data;
  },

  getAdminQuiz: async (quizId: number): Promise<Quiz> => {
    const res = await api.get<any, ApiResponse<Quiz>>(`/admin/quizzes/${quizId}`);
    return res.data;
  },

  createQuiz: async (lessonId: number, data: Partial<Quiz>): Promise<Quiz> => {
    const res = await api.post<any, ApiResponse<Quiz>>(`/admin/lessons/${lessonId}/quizzes`, data);
    return res.data;
  },

  updateQuiz: async (quizId: number, data: Partial<Quiz>): Promise<Quiz> => {
    const res = await api.put<any, ApiResponse<Quiz>>(`/admin/quizzes/${quizId}`, data);
    return res.data;
  },

  deleteQuiz: async (quizId: number): Promise<void> => {
    await api.delete(`/admin/quizzes/${quizId}`);
  },

  // Admin Questions
  addQuestion: async (quizId: number, data: Partial<QuizQuestion>): Promise<QuizQuestion> => {
    const res = await api.post<any, ApiResponse<QuizQuestion>>(`/admin/quizzes/${quizId}/questions`, data);
    return res.data;
  },

  addQuestionsBatch: async (quizId: number, questions: Partial<QuizQuestion>[]): Promise<QuizQuestion[]> => {
    const res = await api.post<any, ApiResponse<QuizQuestion[]>>(`/admin/quizzes/${quizId}/questions/batch`, questions);
    return res.data;
  },

  updateQuestion: async (questionId: number, data: Partial<QuizQuestion>): Promise<QuizQuestion> => {
    const res = await api.put<any, ApiResponse<QuizQuestion>>(`/admin/questions/${questionId}`, data);
    return res.data;
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    await api.delete(`/admin/questions/${questionId}`);
  },

  // Admin Submissions & Essay Grading
  getQuizSubmissions: async (quizId: number): Promise<QuizSubmissionAdmin[]> => {
    const res = await api.get<any, ApiResponse<QuizSubmissionAdmin[]>>(`/admin/quizzes/${quizId}/submissions`);
    return res.data;
  },

  getSubmissionDetail: async (submissionId: number): Promise<QuizSubmissionAdmin> => {
    const res = await api.get<any, ApiResponse<QuizSubmissionAdmin>>(`/admin/quizzes/submissions/${submissionId}`);
    return res.data;
  },

  gradeSubmission: async (
    submissionId: number,
    data: {
      teacherScore?: number;
      teacherFeedback?: string;
      questionGrades?: { questionId: number; score: number; feedback?: string }[];
    }
  ): Promise<QuizSubmissionAdmin> => {
    const res = await api.put<any, ApiResponse<QuizSubmissionAdmin>>(`/admin/quizzes/submissions/${submissionId}/grade`, data);
    return res.data;
  },
};
