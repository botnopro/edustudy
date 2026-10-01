import api from './client';
import { ApiResponse, Banner, FaqItem, Testimonial } from '../types';

export const contentApi = {
  getBanners: async (): Promise<Banner[]> => {
    const res = await api.get<any, ApiResponse<Banner[]>>('/content/banners');
    return res.data;
  },
  getFaqs: async (): Promise<FaqItem[]> => {
    const res = await api.get<any, ApiResponse<FaqItem[]>>('/content/faqs');
    return res.data;
  },
  getTestimonials: async (): Promise<Testimonial[]> => {
    const res = await api.get<any, ApiResponse<Testimonial[]>>('/content/testimonials');
    return res.data;
  },
};
