import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';

/**
 * Сервис для взаимодействия с API
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: `${apiUrl}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для логирования ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
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

  /**
   * Получение или создание пользователя по Telegram ID
   */
  async getOrCreateUser(telegramData: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }) {
    try {
      const response = await this.client.post('/users/telegram', {
        telegramId: telegramData.id,
        firstName: telegramData.firstName,
        lastName: telegramData.lastName,
        username: telegramData.username,
      });
      return response.data;
    } catch (error: any) {
      logger.error('Ошибка получения/создания пользователя', { error, telegramData });
      throw new Error(error.response?.data?.error || 'Ошибка работы с пользователем');
    }
  }

  /**
   * Получение доступных слотов
   */
  async getAvailableSlots(dateFrom: Date, dateTo: Date) {
    try {
      const response = await this.client.get('/slots/available', {
        params: {
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Ошибка получения слотов', { error, dateFrom, dateTo });
      throw error;
    }
  }

  /**
   * Получение активных услуг
   */
  async getActiveServices() {
    try {
      const response = await this.client.get('/services/active');
      return response.data;
    } catch (error) {
      logger.error('Ошибка получения услуг', { error });
      throw error;
    }
  }

  /**
   * Создание записи
   */
  async createBooking(data: {
    userId: string;
    carId: string;
    serviceId: string;
    slotId: string;
    notes?: string;
  }) {
    try {
      const response = await this.client.post('/bookings', data);
      return response.data;
    } catch (error: any) {
      logger.error('Ошибка создания записи', { error, data });
      throw new Error(error.response?.data?.error || 'Ошибка создания записи');
    }
  }

  /**
   * Получение автомобилей пользователя
   */
  async getUserCars(userId: string) {
    try {
      const response = await this.client.get(`/cars/user/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Ошибка получения автомобилей', { error, userId });
      throw error;
    }
  }

  /**
   * Создание автомобиля
   */
  async createCar(data: {
    userId: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
    licensePlate?: string;
  }) {
    try {
      const response = await this.client.post('/cars', data);
      return response.data;
    } catch (error: any) {
      logger.error('Ошибка создания автомобиля', { error, data });
      throw new Error(error.response?.data?.error || 'Ошибка создания автомобиля');
    }
  }

  /**
   * Получение записей пользователя
   */
  async getUserBookings(userId: string) {
    try {
      const response = await this.client.get('/bookings', {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      logger.error('Ошибка получения записей', { error, userId });
      throw error;
    }
  }
}

export default new ApiService();

