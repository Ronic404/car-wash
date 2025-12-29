import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../utils/logger';
import type { IBooking } from '../types/booking';
import type { IService } from '../types/service';
import type { IWashingPost } from '../types/washingPost';
import type { IWashingPostSchedule } from '../types/washingPostSchedule';
import type { ITimeBlock, TimeBlockKind } from '../types/timeBlock';

/**
 * Сервис для взаимодействия с API
 */
class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Токен истек или недействителен
          // Сохраняем текущий путь для возврата после авторизации
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          window.location.href = '/login';
        }
        logger.error('API ошибка', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
      : null;
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/admin/login', { email, password });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/admin/me');
    return response.data;
  }

  // Bookings
  async getBookings(filters?: {
    status?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<IBooking[]> {
    const response = await this.client.get('/bookings', { params: filters });
    return response.data;
  }

  async getBookingById(id: string) {
    const response = await this.client.get(`/bookings/${id}`);
    return response.data;
  }

  async confirmBooking(id: string) {
    const response = await this.client.patch(`/bookings/${id}/confirm`);
    return response.data;
  }

  async cancelBooking(id: string) {
    const response = await this.client.patch(`/bookings/${id}/cancel`);
    return response.data;
  }

  async completeBooking(id: string) {
    const response = await this.client.patch(`/bookings/${id}/complete`);
    return response.data;
  }

  // Slots
  async getSlots(filters?: {
    dateFrom?: string;
    dateTo?: string;
    isAvailable?: boolean;
  }) {
    const response = await this.client.get('/slots', { params: filters });
    return response.data;
  }

  async updateSlot(id: string, data: {
    date?: string;
    duration?: number;
    maxBookings?: number;
    isAvailable?: boolean;
  }) {
    const response = await this.client.patch(`/slots/${id}`, data);
    return response.data;
  }

  async deleteSlot(id: string) {
    await this.client.delete(`/slots/${id}`);
  }

  // Services
  async getServices(): Promise<IService[]> {
    const response = await this.client.get('/services');
    return response.data;
  }

  async getServicesTable() {
    const response = await this.client.get('/services/table');
    return response.data;
  }

  async createService(data: {
    name: string;
    duration: number;
    description?: string;
    order?: number;
  }) {
    const response = await this.client.post('/services', data);
    return response.data;
  }

  async updateService(id: string, data: {
    name?: string;
    duration?: number;
    description?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const response = await this.client.patch(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string) {
    await this.client.delete(`/services/${id}`);
  }

  async upsertServicePrice(data: {
    serviceId: string;
    categoryId: string;
    price: number;
  }) {
    const response = await this.client.post('/services/prices', data);
    return response.data;
  }

  async bulkUpdateServicePrices(prices: {
    serviceId: string;
    categoryId: string;
    price: number;
  }[]) {
    const response = await this.client.patch('/services/prices/bulk', { prices });
    return response.data;
  }

  async deleteServicePrice(serviceId: string, categoryId: string) {
    await this.client.delete(`/services/${serviceId}/prices/${categoryId}`);
  }

  async updateServicesOrder(services: { id: string; order: number }[]) {
    const response = await this.client.patch('/services/order', { services });
    return response.data;
  }

  // Car Categories
  async getCarCategories() {
    const response = await this.client.get('/car-categories');
    return response.data;
  }

  async getActiveCarCategories() {
    const response = await this.client.get('/car-categories/active');
    return response.data;
  }

  async getCarCategoryById(id: string) {
    const response = await this.client.get(`/car-categories/${id}`);
    return response.data;
  }

  async createCarCategory(data: {
    name: string;
    order?: number;
    isActive?: boolean;
  }) {
    const response = await this.client.post('/car-categories', data);
    return response.data;
  }

  async updateCarCategory(id: string, data: {
    name?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const response = await this.client.patch(`/car-categories/${id}`, data);
    return response.data;
  }

  async deleteCarCategory(id: string) {
    await this.client.delete(`/car-categories/${id}`);
  }

  async updateCarCategoriesOrder(categories: { id: string; order: number }[]) {
    const response = await this.client.patch('/car-categories/order', { categories });
    return response.data;
  }

  // Washing Posts
  async getWashingPosts(): Promise<IWashingPost[]> {
    const response = await this.client.get('/washing-posts');
    return response.data;
  }

  async getActiveWashingPosts(): Promise<IWashingPost[]> {
    const response = await this.client.get('/washing-posts/active');
    return response.data;
  }

  async createWashingPost(data: { name: string; order?: number; isActive?: boolean; serviceIds?: string[] }): Promise<IWashingPost> {
    const response = await this.client.post('/washing-posts', data);
    return response.data;
  }

  async updateWashingPost(id: string, data: { name?: string; order?: number; isActive?: boolean; serviceIds?: string[] }): Promise<IWashingPost> {
    const response = await this.client.patch(`/washing-posts/${id}`, data);
    return response.data;
  }

  async deleteWashingPost(id: string): Promise<void> {
    await this.client.delete(`/washing-posts/${id}`);
  }

  // Washing Post Schedules (по дням)
  async getWashingPostSchedules(date: string): Promise<IWashingPostSchedule[]> {
    const response = await this.client.get('/washing-post-schedules', { params: { date } });
    return response.data;
  }

  async upsertWashingPostSchedule(data: {
    postId: string;
    date: string; // YYYY-MM-DD
    isActive: boolean;
    workFromMinutes: number;
    workToMinutes: number;
  }): Promise<IWashingPostSchedule> {
    const response = await this.client.post('/washing-post-schedules/upsert', data);
    return response.data;
  }

  // Time blocks (admin)
  async getTimeBlocks(filters: { dateFrom: string; dateTo: string; postId?: string }): Promise<ITimeBlock[]> {
    const response = await this.client.get('/time-blocks', { params: filters });
    return response.data;
  }

  async createTimeBlock(data: {
    postId: string;
    startAt: string;
    endAt: string;
    kind?: TimeBlockKind;
    serviceId?: string | null;
    carBrand?: string | null;
    carModel?: string | null;
    note?: string | null;
  }): Promise<ITimeBlock> {
    const response = await this.client.post('/time-blocks', data);
    return response.data;
  }

  async deleteTimeBlock(id: string): Promise<void> {
    await this.client.delete(`/time-blocks/${id}`);
  }

  // Employees
  async getEmployees() {
    // TODO: реализовать когда будет endpoint
    return [];
  }
}

export default new ApiService();

