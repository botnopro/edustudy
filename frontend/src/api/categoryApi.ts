import api from './client';
import { ApiResponse, Grade, Subject } from '../types';

export const categoryApi = {
  // Public
  getActiveGrades: async (): Promise<Grade[]> => {
    const res = await api.get<any, ApiResponse<Grade[]>>('/categories/grades');
    return res.data;
  },

  getActiveSubjects: async (): Promise<Subject[]> => {
    const res = await api.get<any, ApiResponse<Subject[]>>('/categories/subjects');
    return res.data;
  },

  // Admin Grades
  getAllGrades: async (): Promise<Grade[]> => {
    const res = await api.get<any, ApiResponse<Grade[]>>('/admin/categories/grades');
    return res.data;
  },

  createGrade: async (data: Partial<Grade>): Promise<Grade> => {
    const res = await api.post<any, ApiResponse<Grade>>('/admin/categories/grades', data);
    return res.data;
  },

  updateGrade: async (id: number, data: Partial<Grade>): Promise<Grade> => {
    const res = await api.put<any, ApiResponse<Grade>>(`/admin/categories/grades/${id}`, data);
    return res.data;
  },

  deleteGrade: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/grades/${id}`);
  },

  // Admin Subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    const res = await api.get<any, ApiResponse<Subject[]>>('/admin/categories/subjects');
    return res.data;
  },

  createSubject: async (data: Partial<Subject>): Promise<Subject> => {
    const res = await api.post<any, ApiResponse<Subject>>('/admin/categories/subjects', data);
    return res.data;
  },

  updateSubject: async (id: number, data: Partial<Subject>): Promise<Subject> => {
    const res = await api.put<any, ApiResponse<Subject>>(`/admin/categories/subjects/${id}`, data);
    return res.data;
  },

  deleteSubject: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/subjects/${id}`);
  },
};
