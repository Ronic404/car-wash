import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы с пользователями
 */
class UserService {
  /**
   * Создание или получение пользователя по Telegram ID
   */
  async getOrCreateUser(telegramData: {
    telegramId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }) {
    try {
      let user = await prisma.user.findUnique({
        where: { telegramId: telegramData.telegramId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: telegramData.telegramId,
            firstName: telegramData.firstName,
            lastName: telegramData.lastName,
            username: telegramData.username,
          },
        });
        logger.info('Создан новый пользователь', { userId: user.id });
      } else {
        // Обновляем данные пользователя, если они изменились
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: telegramData.firstName || user.firstName,
            lastName: telegramData.lastName || user.lastName,
            username: telegramData.username || user.username,
          },
        });
      }

      return user;
    } catch (error) {
      logger.error('Ошибка работы с пользователем', { error, telegramData });
      throw error;
    }
  }

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          cars: true,
          bookings: {
            include: {
              car: true,
              service: { include: { servicePrices: true } },
              post: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return user;
    } catch (error) {
      logger.error('Ошибка получения пользователя', { error, userId: id });
      throw error;
    }
  }

  /**
   * Получение всех пользователей с их машинами (для администратора)
   */
  async getUsersWithCars() {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          cars: true,
        },
      });

      return users;
    } catch (error) {
      logger.error('Ошибка получения списка пользователей', { error });
      throw error;
    }
  }
}

export default new UserService();

