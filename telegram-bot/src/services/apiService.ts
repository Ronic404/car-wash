import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';
import { ICar } from '../types/car';
import { IUser } from '../types/user';
import { IService } from '../types/service';
import { ISlot } from '../types/slot';
import { IBooking } from '../types/booking';

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
  }): Promise<IUser> {
    try {
      const response = await this.client.post<IUser>('/users/telegram', {
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
  async getAvailableSlots(dateFrom: Date, dateTo: Date): Promise<ISlot[]> {
    try {
      const response = await this.client.get<ISlot[]>('/slots/available', {
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
  async getActiveServices(): Promise<IService[]> {
    try {
      const response = await this.client.get<IService[]>('/services/active');
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
  }): Promise<IBooking> {
    try {
      const response = await this.client.post<IBooking>('/bookings', data);
      return response.data;
    } catch (error: any) {
      logger.error('Ошибка создания записи', { error, data });
      throw new Error(error.response?.data?.error || 'Ошибка создания записи');
    }
  }

  /**
   * Получение автомобилей пользователя
   */
  async getUserCars(userId: string): Promise<ICar[]> {
    try {
      const response = await this.client.get<ICar[]>(`/cars/user/${userId}`);
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
  }): Promise<ICar> {
    try {
      const response = await this.client.post<ICar>('/cars', data);
      return response.data;
    } catch (error: any) {
      logger.error('Ошибка создания автомобиля', { error, data });
      throw new Error(error.response?.data?.error || 'Ошибка создания автомобиля');
    }
  }

  /**
   * Удаление автомобиля
   */
  async deleteCar(carId: string): Promise<void> {
    try {
      await this.client.delete(`/cars/${carId}`);
    } catch (error: any) {
      logger.error('Ошибка удаления автомобиля', { error, carId });
      throw new Error(error.response?.data?.error || 'Ошибка удаления автомобиля');
    }
  }

  /**
   * Получение записей пользователя
   */
  async getUserBookings(userId: string): Promise<IBooking[]> {
    try {
      const response = await this.client.get<IBooking[]>('/bookings', {
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

