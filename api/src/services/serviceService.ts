import prisma from '../config/database';
import logger from '../config/logger';
import type { IServiceTablePriceCell, ServicesTablePricesMatrix } from '../types/servicesTable';

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
          order: 'asc',
        },
        include: {
          servicePrices: {
            include: {
              category: true,
            },
          },
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
          order: 'asc',
        },
        include: {
          servicePrices: {
            include: {
              category: true,
            },
          },
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
    duration: number;
    order?: number;
  }) {
    try {
      // Если order не указан, ставим максимальный + 1
      if (data.order === undefined) {
        const maxOrder = await prisma.service.aggregate({
          _max: { order: true },
        });
        data.order = (maxOrder._max.order ?? -1) + 1;
      }

      const service = await prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          duration: data.duration,
          order: data.order,
          isActive: true,
        },
        include: {
          servicePrices: {
            include: {
              category: true,
            },
          },
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
    duration?: number;
    order?: number;
    isActive?: boolean;
  }) {
    try {
      const service = await prisma.service.update({
        where: { id },
        data,
        include: {
          servicePrices: {
            include: {
              category: true,
            },
          },
        },
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
          servicePrices: {
            include: {
              category: true,
            },
          },
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

  /**
   * Создание или обновление цены услуги для категории
   */
  async upsertServicePrice(data: {
    serviceId: string;
    categoryId: string;
    price: number;
  }) {
    try {
      const servicePrice = await prisma.servicePrice.upsert({
        where: {
          serviceId_categoryId: {
            serviceId: data.serviceId,
            categoryId: data.categoryId,
          },
        },
        update: {
          price: data.price,
        },
        create: {
          serviceId: data.serviceId,
          categoryId: data.categoryId,
          price: data.price,
        },
        include: {
          service: true,
          category: true,
        },
      });

      logger.info('Обновлена цена услуги', {
        serviceId: data.serviceId,
        categoryId: data.categoryId,
      });
      return servicePrice;
    } catch (error) {
      logger.error('Ошибка обновления цены услуги', { error, data });
      throw error;
    }
  }

  /**
   * Массовое обновление цен услуг
   */
  async bulkUpdateServicePrices(
    updates: {
      serviceId: string;
      categoryId: string;
      price: number;
    }[]
  ) {
    try {
      const transactions = updates.map((update) =>
        prisma.servicePrice.upsert({
          where: {
            serviceId_categoryId: {
              serviceId: update.serviceId,
              categoryId: update.categoryId,
            },
          },
          update: {
            price: update.price,
          },
          create: {
            serviceId: update.serviceId,
            categoryId: update.categoryId,
            price: update.price,
          },
        })
      );

      await prisma.$transaction(transactions);

      logger.info('Массовое обновление цен услуг', { count: updates.length });
      return true;
    } catch (error) {
      logger.error('Ошибка массового обновления цен', { error, updates });
      throw error;
    }
  }

  /**
   * Удаление цены услуги для категории
   */
  async deleteServicePrice(serviceId: string, categoryId: string) {
    try {
      await prisma.servicePrice.delete({
        where: {
          serviceId_categoryId: {
            serviceId,
            categoryId,
          },
        },
      });

      logger.info('Удалена цена услуги', { serviceId, categoryId });
    } catch (error) {
      logger.error('Ошибка удаления цены услуги', { error, serviceId, categoryId });
      throw error;
    }
  }

  /**
   * Изменение порядка услуг
   */
  async updateServicesOrder(updates: { id: string; order: number }[]) {
    try {
      const transactions = updates.map((update) =>
        prisma.service.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      );

      await prisma.$transaction(transactions);

      logger.info('Обновлен порядок услуг', { count: updates.length });
      return true;
    } catch (error) {
      logger.error('Ошибка обновления порядка услуг', { error, updates });
      throw error;
    }
  }

  /**
   * Получение таблицы услуг (матрица услуга-категория)
   */
  async getServicesTable() {
    try {
      const services = await prisma.service.findMany({
        orderBy: {
          order: 'asc',
        },
        include: {
          servicePrices: {
            include: {
              category: true,
            },
          },
        },
      });

      const categories = await prisma.carCategory.findMany({
        where: { isActive: true },
        orderBy: {
          order: 'asc',
        },
      });

      // Создаем матрицу цен
      const pricesMatrix: ServicesTablePricesMatrix = [];
      services.forEach((service) => {
        const row: IServiceTablePriceCell[] = [];
        categories.forEach((category) => {
          const servicePrice = service.servicePrices.find(
            (sp) => sp.categoryId === category.id
          );
          row.push({
            serviceId: service.id,
            categoryId: category.id,
            price: servicePrice?.price ?? null,
            id: servicePrice?.id ?? null,
          });
        });
        pricesMatrix.push(row);
      });

      return {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          duration: s.duration,
          order: s.order,
          isActive: s.isActive,
        })),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          order: c.order,
          isActive: c.isActive,
        })),
        prices: pricesMatrix,
      };
    } catch (error) {
      logger.error('Ошибка получения таблицы услуг', { error });
      throw error;
    }
  }
}

export default new ServiceService();

