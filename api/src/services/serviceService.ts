import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы с услугами
 */
class ServiceService {
  /**
   * Получение всех активных услуг
   */
  async getActiveServices() {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: {
          name: 'asc',
        },
      });

      return services;
    } catch (error) {
      logger.error('Ошибка получения услуг', { error });
      throw error;
    }
  }

  /**
   * Получение всех услуг (включая неактивные)
   */
  async getAllServices() {
    try {
      const services = await prisma.service.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return services;
    } catch (error) {
      logger.error('Ошибка получения всех услуг', { error });
      throw error;
    }
  }

  /**
   * Создание новой услуги
   */
  async createService(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
  }) {
    try {
      const service = await prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          isActive: true,
        },
      });

      logger.info('Создана новая услуга', { serviceId: service.id });
      return service;
    } catch (error) {
      logger.error('Ошибка создания услуги', { error, data });
      throw error;
    }
  }

  /**
   * Обновление услуги
   */
  async updateService(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    isActive?: boolean;
  }) {
    try {
      const service = await prisma.service.update({
        where: { id },
        data,
      });

      logger.info('Услуга обновлена', { serviceId: id });
      return service;
    } catch (error) {
      logger.error('Ошибка обновления услуги', { error, serviceId: id });
      throw error;
    }
  }

  /**
   * Удаление услуги
   */
  async deleteService(id: string) {
    try {
      await prisma.service.delete({
        where: { id },
      });

      logger.info('Услуга удалена', { serviceId: id });
    } catch (error) {
      logger.error('Ошибка удаления услуги', { error, serviceId: id });
      throw error;
    }
  }

  /**
   * Получение услуги по ID
   */
  async getServiceById(id: string) {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          bookings: true,
        },
      });

      if (!service) {
        throw new Error('Услуга не найдена');
      }

      return service;
    } catch (error) {
      logger.error('Ошибка получения услуги', { error, serviceId: id });
      throw error;
    }
  }
}

export default new ServiceService();

