import api from './client';
import { ApiResponse, Student, StudentRequest, PageResult } from '../types';

export const studentApi = {
  getAllStudents: async (params?: { keyword?: string; gradeLevel?: number }): Promise<Student[]> => {
    const res = await api.get<any, ApiResponse<Student[]>>('/admin/students', { params });
    return res.data;
  },

  getStudentsPaged: async (params: {
    keyword?: string;
    gradeLevel?: number;
    page?: number;
    size?: number;
  }): Promise<PageResult<Student>> => {
    const res = await api.get<any, ApiResponse<PageResult<Student>>>('/admin/students/paged', { params });
    return res.data;
  },

  getStudentsStats: async (): Promise<Record<string, number>> => {
    const res = await api.get<any, ApiResponse<Record<string, number>>>('/admin/students/stats');
    return res.data;
  },

  getStudentById: async (id: number): Promise<Student> => {
    const res = await api.get<any, ApiResponse<Student>>(`/admin/students/${id}`);
    return res.data;
  },

  createStudent: async (data: StudentRequest): Promise<Student> => {
    const res = await api.post<any, ApiResponse<Student>>('/admin/students', data);
    return res.data;
  },

  updateStudent: async (id: number, data: StudentRequest): Promise<Student> => {
    const res = await api.put<any, ApiResponse<Student>>(`/admin/students/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await api.delete(`/admin/students/${id}`);
  },

  assignCourse: async (studentId: number, courseId: number): Promise<void> => {
    await api.post(`/admin/students/${studentId}/assign-course/${courseId}`);
  },

  revokeCourse: async (studentId: number, courseId: number): Promise<void> => {
    await api.delete(`/admin/students/${studentId}/revoke-course/${courseId}`);
  },

  toggleStudentStatus: async (studentId: number): Promise<Student> => {
    const res = await api.put<any, ApiResponse<Student>>(`/admin/students/${studentId}/toggle-status`);
    return res.data;
  },

  resetStudentPassword: async (studentId: number, newPassword?: string): Promise<void> => {
    await api.post(`/admin/students/${studentId}/reset-password`, { newPassword });
  },
};
