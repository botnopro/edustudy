import api from './client';
import { ApiResponse, ActivationResponse, CodeCheckResponse, Course } from '../types';

export const activationApi = {
  checkCode: async (code: string): Promise<CodeCheckResponse> => {
    const res = await api.get<any, ApiResponse<CodeCheckResponse>>(`/activation/check/${code.trim()}`);
    return res.data;
  },
  activateCourse: async (code: string): Promise<ActivationResponse> => {
    const res = await api.post<any, ApiResponse<ActivationResponse>>('/activation/activate', { code: code.trim() });
    return res.data;
  },
  getMyCourses: async (): Promise<Course[]> => {
    const res = await api.get<any, ApiResponse<Course[]>>('/activation/my-courses');
    return res.data;
  },
};
