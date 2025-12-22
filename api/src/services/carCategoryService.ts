import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы с категориями автомобилей
 */
class CarCategoryService {
  /**
   * Получение всех категорий
   */
  async getAllCategories() {
    try {
      const categories = await prisma.carCategory.findMany({
        orderBy: {
          order: 'asc',
        },
      });

      return categories;
    } catch (error) {
      logger.error('Ошибка получения категорий', { error });
      throw error;
    }
  }

  /**
   * Получение активных категорий
   */
  async getActiveCategories() {
    try {
      const categories = await prisma.carCategory.findMany({
        where: { isActive: true },
        orderBy: {
          order: 'asc',
        },
      });

      return categories;
    } catch (error) {
      logger.error('Ошибка получения активных категорий', { error });
      throw error;
    }
  }

  /**
   * Получение категории по ID
   */
  async getCategoryById(id: string) {
    try {
      const category = await prisma.carCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error('Категория не найдена');
      }

      return category;
    } catch (error) {
      logger.error('Ошибка получения категории', { error, id });
      throw error;
    }
  }

  /**
   * Создание новой категории
   */
  async createCategory(data: {
    name: string;
    order?: number;
    isActive?: boolean;
  }) {
    try {
      // Если order не указан, ставим максимальный + 1
      if (data.order === undefined) {
        const maxOrder = await prisma.carCategory.aggregate({
          _max: { order: true },
        });
        data.order = (maxOrder._max.order ?? -1) + 1;
      }

      const category = await prisma.carCategory.create({
        data: {
          name: data.name,
          order: data.order,
          isActive: data.isActive ?? true,
        },
      });

      logger.info('Создана новая категория', { categoryId: category.id });
      return category;
    } catch (error) {
      logger.error('Ошибка создания категории', { error, data });
      throw error;
    }
  }

  /**
   * Обновление категории
   */
  async updateCategory(
    id: string,
    data: {
      name?: string;
      order?: number;
      isActive?: boolean;
    }
  ) {
    try {
      const category = await prisma.carCategory.update({
        where: { id },
        data,
      });

      logger.info('Обновлена категория', { categoryId: id });
      return category;
    } catch (error) {
      logger.error('Ошибка обновления категории', { error, id, data });
      throw error;
    }
  }

  /**
   * Удаление категории
   */
  async deleteCategory(id: string) {
    try {
      // Проверяем, есть ли связанные ServicePrice
      const servicePrices = await prisma.servicePrice.findMany({
        where: { categoryId: id },
      });

      if (servicePrices.length > 0) {
        throw new Error(
          'Невозможно удалить категорию: существуют связанные услуги'
        );
      }

      await prisma.carCategory.delete({
        where: { id },
      });

      logger.info('Удалена категория', { categoryId: id });
    } catch (error) {
      logger.error('Ошибка удаления категории', { error, id });
      throw error;
    }
  }

  /**
   * Изменение порядка категорий
   */
  async updateCategoriesOrder(updates: { id: string; order: number }[]) {
    try {
      const transactions = updates.map((update) =>
        prisma.carCategory.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      );

      await prisma.$transaction(transactions);

      logger.info('Обновлен порядок категорий', { count: updates.length });
      return true;
    } catch (error) {
      logger.error('Ошибка обновления порядка категорий', { error, updates });
      throw error;
    }
  }
}

export default new CarCategoryService();

