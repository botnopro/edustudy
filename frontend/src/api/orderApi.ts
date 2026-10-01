import api from './client';
import { ApiResponse, Order, CreateOrderRequest, OrderStatus, OrderStatusResponse, PageResult } from '../types';

export const orderApi = {
  // Student APIs
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const res: any = await api.post('/orders/checkout', data);
    return res.data || res;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<any, ApiResponse<Order[]>>('/orders/my-orders');
    return res.data;
  },

  getOrderStatus: async (orderCode: string): Promise<OrderStatusResponse> => {
    const res: any = await api.get(`/orders/${orderCode}/status`);
    return res.data || res;
  },

  checkOrderStatus: async (orderCode: string): Promise<Order> => {
    const res: any = await api.get(`/orders/check/${orderCode}`);
    return res.data || res;
  },

  // Admin APIs
  getAllOrders: async (params?: { status?: OrderStatus; keyword?: string }): Promise<Order[]> => {
    const res = await api.get<any, ApiResponse<Order[]>>('/admin/orders', { params });
    return res.data;
  },

  getOrdersPaged: async (params: {
    status?: OrderStatus;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<PageResult<Order>> => {
    const res = await api.get<any, ApiResponse<PageResult<Order>>>('/admin/orders/paged', { params });
    return res.data;
  },

  getOrdersStats: async (): Promise<Record<string, number>> => {
    const res = await api.get<any, ApiResponse<Record<string, number>>>('/admin/orders/stats');
    return res.data;
  },

  approveOrder: async (orderId: number): Promise<Order> => {
    const res = await api.post<any, ApiResponse<Order>>(`/admin/orders/${orderId}/approve`);
    return res.data;
  },

  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    const res = await api.post<any, ApiResponse<Order>>(`/admin/orders/${orderId}/cancel`, { reason });
    return res.data;
  },

  getPendingCount: async (): Promise<number> => {
    const res = await api.get<any, ApiResponse<number>>('/admin/orders/pending-count');
    return res.data;
  },
};
