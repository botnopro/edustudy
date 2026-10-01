import api from './client';
import { ApiResponse, Course, Teacher } from '../types';

export const courseApi = {
  getCourses: async (params?: { grade?: string; subject?: string; keyword?: string }): Promise<Course[]> => {
    const res = await api.get<any, ApiResponse<Course[]>>('/courses', { params });
    return res.data;
  },
  getCourseById: async (id: number): Promise<Course> => {
    const res = await api.get<any, ApiResponse<Course>>(`/courses/${id}`);
    return res.data;
  },
  getCourseBySlug: async (slug: string): Promise<Course> => {
    const res = await api.get<any, ApiResponse<Course>>(`/courses/slug/${slug}`);
    return res.data;
  },
  getTeachers: async (): Promise<Teacher[]> => {
    const res = await api.get<any, ApiResponse<Teacher[]>>('/teachers');
    return res.data;
  },
  getTeacherById: async (id: number): Promise<Teacher> => {
    const res = await api.get<any, ApiResponse<Teacher>>(`/teachers/${id}`);
    return res.data;
  },
};
