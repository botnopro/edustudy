import api from './client';
import {
  AdminStats,
  ApiResponse,
  ActivationCode,
  Banner,
  Course,
  Lesson,
  CourseStudentLeaderboard,
  CourseStudent,
  FaqItem,
  Teacher,
  Testimonial,
  PageResult,
} from '../types';

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<any, ApiResponse<AdminStats>>('/admin/stats');
    return res.data;
  },

  // Courses
  getAllCourses: async (): Promise<Course[]> => {
    const res = await api.get<any, ApiResponse<Course[]>>('/admin/courses');
    return res.data;
  },
  createCourse: async (data: any): Promise<Course> => {
    const res = await api.post<any, ApiResponse<Course>>('/admin/courses', data);
    return res.data;
  },
  updateCourse: async (id: number, data: any): Promise<Course> => {
    const res = await api.put<any, ApiResponse<Course>>(`/admin/courses/${id}`, data);
    return res.data;
  },
  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/admin/courses/${id}`);
  },

  // Course Lessons & Studio
  addLesson: async (courseId: number, data: Partial<Lesson>): Promise<Lesson> => {
    const res = await api.post<any, ApiResponse<Lesson>>(`/admin/courses/${courseId}/lessons`, data);
    return res.data;
  },
  updateLesson: async (lessonId: number, data: Partial<Lesson>): Promise<Lesson> => {
    const res = await api.put<any, ApiResponse<Lesson>>(`/admin/courses/lessons/${lessonId}`, data);
    return res.data;
  },
  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete(`/admin/courses/lessons/${lessonId}`);
  },

  // Course Leaderboard
  getCourseLeaderboard: async (courseId: number): Promise<CourseStudentLeaderboard[]> => {
    const res = await api.get<any, ApiResponse<CourseStudentLeaderboard[]>>(`/admin/courses/${courseId}/leaderboard`);
    return res.data;
  },

  // Course Students Roster
  getCourseStudents: async (courseId: number): Promise<CourseStudent[]> => {
    const res = await api.get<any, ApiResponse<CourseStudent[]>>(`/admin/courses/${courseId}/students`);
    return res.data;
  },
  addStudentToCourse: async (courseId: number, studentId: number): Promise<CourseStudent> => {
    const res = await api.post<any, ApiResponse<CourseStudent>>(`/admin/courses/${courseId}/students/${studentId}`);
    return res.data;
  },
  removeStudentFromCourse: async (courseId: number, studentId: number): Promise<void> => {
    await api.delete(`/admin/courses/${courseId}/students/${studentId}`);
  },

  // Teachers
  getAllTeachers: async (): Promise<Teacher[]> => {
    const res = await api.get<any, ApiResponse<Teacher[]>>('/admin/teachers');
    return res.data;
  },
  createTeacher: async (data: any): Promise<Teacher> => {
    const res = await api.post<any, ApiResponse<Teacher>>('/admin/teachers', data);
    return res.data;
  },
  updateTeacher: async (id: number, data: any): Promise<Teacher> => {
    const res = await api.put<any, ApiResponse<Teacher>>(`/admin/teachers/${id}`, data);
    return res.data;
  },
  toggleTeacherStatus: async (id: number): Promise<Teacher> => {
    const res = await api.put<any, ApiResponse<Teacher>>(`/admin/teachers/${id}/toggle-status`);
    return res.data;
  },
  deleteTeacher: async (id: number): Promise<void> => {
    await api.delete(`/admin/teachers/${id}`);
  },

  // Activation Codes
  getAllCodes: async (): Promise<ActivationCode[]> => {
    const res = await api.get<any, ApiResponse<ActivationCode[]>>('/admin/activation-codes');
    return res.data;
  },
  getCodesPaged: async (params: {
    search?: string;
    courseId?: number;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResult<ActivationCode>> => {
    const res = await api.get<any, ApiResponse<PageResult<ActivationCode>>>('/admin/activation-codes/paged', { params });
    return res.data;
  },
  getCodesStats: async (): Promise<Record<string, number>> => {
    const res = await api.get<any, ApiResponse<Record<string, number>>>('/admin/activation-codes/stats');
    return res.data;
  },
  createCode: async (data: any): Promise<ActivationCode> => {
    const res = await api.post<any, ApiResponse<ActivationCode>>('/admin/activation-codes', data);
    return res.data;
  },
  batchGenerateCodes: async (data: any): Promise<ActivationCode[]> => {
    const res = await api.post<any, ApiResponse<ActivationCode[]>>('/admin/activation-codes/batch', data);
    return res.data;
  },
  updateCode: async (id: number, data: Partial<ActivationCode>): Promise<ActivationCode> => {
    const res = await api.put<any, ApiResponse<ActivationCode>>(`/admin/activation-codes/${id}`, data);
    return res.data;
  },
  toggleCodeStatus: async (id: number): Promise<ActivationCode> => {
    const res = await api.put<any, ApiResponse<ActivationCode>>(`/admin/activation-codes/${id}/toggle-status`);
    return res.data;
  },
  deleteCode: async (id: number): Promise<void> => {
    await api.delete(`/admin/activation-codes/${id}`);
  },

  // Banners
  getAllBanners: async (): Promise<Banner[]> => {
    const res = await api.get<any, ApiResponse<Banner[]>>('/admin/content/banners');
    return res.data;
  },
  createBanner: async (data: any): Promise<Banner> => {
    const res = await api.post<any, ApiResponse<Banner>>('/admin/content/banners', data);
    return res.data;
  },
  updateBanner: async (id: number, data: any): Promise<Banner> => {
    const res = await api.put<any, ApiResponse<Banner>>(`/admin/content/banners/${id}`, data);
    return res.data;
  },
  deleteBanner: async (id: number): Promise<void> => {
    await api.delete(`/admin/content/banners/${id}`);
  },

  // FAQs
  getAllFaqs: async (): Promise<FaqItem[]> => {
    const res = await api.get<any, ApiResponse<FaqItem[]>>('/admin/content/faqs');
    return res.data;
  },
  createFaq: async (data: any): Promise<FaqItem> => {
    const res = await api.post<any, ApiResponse<FaqItem>>('/admin/content/faqs', data);
    return res.data;
  },
  updateFaq: async (id: number, data: any): Promise<FaqItem> => {
    const res = await api.put<any, ApiResponse<FaqItem>>(`/admin/content/faqs/${id}`, data);
    return res.data;
  },
  toggleFaqStatus: async (id: number): Promise<FaqItem> => {
    const res = await api.put<any, ApiResponse<FaqItem>>(`/admin/content/faqs/${id}/toggle-status`);
    return res.data;
  },
  deleteFaq: async (id: number): Promise<void> => {
    await api.delete(`/admin/content/faqs/${id}`);
  },

  // Testimonials
  getAllTestimonials: async (): Promise<Testimonial[]> => {
    const res = await api.get<any, ApiResponse<Testimonial[]>>('/admin/content/testimonials');
    return res.data;
  },
  createTestimonial: async (data: any): Promise<Testimonial> => {
    const res = await api.post<any, ApiResponse<Testimonial>>('/admin/content/testimonials', data);
    return res.data;
  },
  updateTestimonial: async (id: number, data: any): Promise<Testimonial> => {
    const res = await api.put<any, ApiResponse<Testimonial>>(`/admin/content/testimonials/${id}`, data);
    return res.data;
  },
  deleteTestimonial: async (id: number): Promise<void> => {
    await api.delete(`/admin/content/testimonials/${id}`);
  },
};
