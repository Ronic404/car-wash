import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы с моечными постами
 */
class WashingPostService {
  /**
   * Получение всех постов
   */
  async getAllPosts() {
    try {
      const posts = await prisma.washingPost.findMany({
        include: {
          services: { include: { service: true } },
        },
        orderBy: { order: 'asc' },
      });
      return posts;
    } catch (error) {
      logger.error('Ошибка получения постов', { error });
      throw error;
    }
  }

  /**
   * Получение активных постов
   */
  async getActivePosts() {
    try {
      const posts = await prisma.washingPost.findMany({
        where: { isActive: true },
        include: {
          services: { include: { service: true } },
        },
        orderBy: { order: 'asc' },
      });
      return posts;
    } catch (error) {
      logger.error('Ошибка получения активных постов', { error });
      throw error;
    }
  }

  /**
   * Создание нового поста
   */
  async createPost(data: {
    name: string;
    order?: number;
    isActive?: boolean;
    serviceIds?: string[];
  }) {
    try {
      if (data.order === undefined) {
        const maxOrder = await prisma.washingPost.aggregate({
          _max: { order: true },
        });
        data.order = (maxOrder._max.order ?? -1) + 1;
      }

      const post = await prisma.washingPost.create({
        data: {
          name: data.name,
          order: data.order,
          isActive: data.isActive ?? true,
          services: data.serviceIds?.length
            ? {
              create: data.serviceIds.map((serviceId) => ({ serviceId })),
            }
            : undefined,
        },
        include: {
          services: { include: { service: true } },
        },
      });

      logger.info('Создан новый пост', { postId: post.id });
      return post;
    } catch (error) {
      logger.error('Ошибка создания поста', { error, data });
      throw error;
    }
  }

  /**
   * Обновление поста
   */
  async updatePost(
    id: string,
    data: {
      name?: string;
      order?: number;
      isActive?: boolean;
      serviceIds?: string[];
    }
  ) {
    try {
      const post = await prisma.washingPost.update({
        where: { id },
        data: {
          name: data.name,
          order: data.order,
          isActive: data.isActive,
          services: data.serviceIds
            ? {
              deleteMany: {},
              create: data.serviceIds.map((serviceId) => ({ serviceId })),
            }
            : undefined,
        },
        include: {
          services: { include: { service: true } },
        },
      });

      logger.info('Пост обновлен', { postId: id });
      return post;
    } catch (error) {
      logger.error('Ошибка обновления поста', { error, postId: id, data });
      throw error;
    }
  }

  /**
   * Удаление поста
   */
  async deletePost(id: string) {
    try {
      const bookingsCount = await prisma.booking.count({ where: { postId: id } });
      const blocksCount = await prisma.timeBlock.count({ where: { postId: id } });

      if (bookingsCount > 0 || blocksCount > 0) {
        throw new Error(
          'Невозможно удалить пост: существуют связанные записи/блокировки. Используйте деактивацию.'
        );
      }

      await prisma.washingPost.delete({ where: { id } });
      logger.info('Пост удален', { postId: id });
    } catch (error) {
      logger.error('Ошибка удаления поста', { error, postId: id });
      throw error;
    }
  }
}

export default new WashingPostService();


