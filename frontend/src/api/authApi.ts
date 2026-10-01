import api from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any): Promise<AuthResponse> => {
    const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<any, ApiResponse<User>>('/auth/me');
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
  updateProfile: async (data: {
    fullName: string;
    phone?: string;
    gradeLevel?: number;
    schoolName?: string;
    avatarUrl?: string;
  }): Promise<User> => {
    const res = await api.put<any, ApiResponse<User>>('/auth/profile', data);
    return res.data;
  },
};
