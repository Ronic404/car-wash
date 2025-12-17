import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../utils/logger';

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
          this.setToken(null);
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

  setToken(token: string | null): void {
    if (token) {
      // Токен сохраняется через zustand persist
    }
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
  }) {
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

  async createSlot(data: {
    date: string;
    duration?: number;
    maxBookings?: number;
  }) {
    const response = await this.client.post('/slots', data);
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
  async getServices() {
    const response = await this.client.get('/services');
    return response.data;
  }

  async createService(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
  }) {
    const response = await this.client.post('/services', data);
    return response.data;
  }

  async updateService(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    isActive?: boolean;
  }) {
    const response = await this.client.patch(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string) {
    await this.client.delete(`/services/${id}`);
  }

  // Employees
  async getEmployees() {
    // TODO: реализовать когда будет endpoint
    return [];
  }
}

export default new ApiService();

