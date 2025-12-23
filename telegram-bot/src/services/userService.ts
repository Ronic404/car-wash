import apiService from './apiService';
import logger from '../config/logger';
import type { IUser } from '../types/user';

/**
 * Сервис для работы с пользователями в боте
 */
class UserService {
  private userCache: Map<string, IUser> = new Map();

  /**
   * Получение или создание пользователя
   */
  async getOrCreateUser(telegramData: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }) {
    try {
      // Проверяем кеш
      if (this.userCache.has(telegramData.id)) {
        return this.userCache.get(telegramData.id);
      }

      // Вызываем API для получения/создания пользователя
      const user = await apiService.getOrCreateUser(telegramData);
      this.userCache.set(telegramData.id, user);
      return user;
    } catch (error) {
      logger.error('Ошибка работы с пользователем', { error, telegramData });
      throw error;
    }
  }

  /**
   * Получение пользователя по Telegram ID
   */
  getUserByTelegramId(telegramId: string) {
    return this.userCache.get(telegramId);
  }
}

export default new UserService();

