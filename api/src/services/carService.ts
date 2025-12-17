import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы с автомобилями
 */
class CarService {
  /**
   * Создание нового автомобиля
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
      const car = await prisma.car.create({
        data: {
          userId: data.userId,
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color,
          licensePlate: data.licensePlate,
        },
      });

      logger.info('Создан новый автомобиль', { carId: car.id, userId: data.userId });
      return car;
    } catch (error) {
      logger.error('Ошибка создания автомобиля', { error, data });
      throw error;
    }
  }

  /**
   * Получение автомобилей пользователя
   */
  async getUserCars(userId: string) {
    try {
      const cars = await prisma.car.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return cars;
    } catch (error) {
      logger.error('Ошибка получения автомобилей', { error, userId });
      throw error;
    }
  }

  /**
   * Получение автомобиля по ID
   */
  async getCarById(id: string) {
    try {
      const car = await prisma.car.findUnique({
        where: { id },
        include: {
          user: true,
          bookings: true,
        },
      });

      if (!car) {
        throw new Error('Автомобиль не найден');
      }

      return car;
    } catch (error) {
      logger.error('Ошибка получения автомобиля', { error, carId: id });
      throw error;
    }
  }

  /**
   * Обновление автомобиля
   */
  async updateCar(id: string, data: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
  }) {
    try {
      const car = await prisma.car.update({
        where: { id },
        data,
      });

      logger.info('Автомобиль обновлен', { carId: id });
      return car;
    } catch (error) {
      logger.error('Ошибка обновления автомобиля', { error, carId: id });
      throw error;
    }
  }

  /**
   * Удаление автомобиля
   */
  async deleteCar(id: string) {
    try {
      await prisma.car.delete({
        where: { id },
      });

      logger.info('Автомобиль удален', { carId: id });
    } catch (error) {
      logger.error('Ошибка удаления автомобиля', { error, carId: id });
      throw error;
    }
  }
}

export default new CarService();

