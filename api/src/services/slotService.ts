import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Сервис для работы со слотами времени
 */
class SlotService {
  /**
   * Получение доступных слотов на указанные даты
   */
  async getAvailableSlots(dateFrom: Date, dateTo: Date) {
    try {
      const slots = await prisma.timeSlot.findMany({
        where: {
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
          isAvailable: true,
        },
        include: {
          bookings: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED'],
              },
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Фильтруем слоты, которые еще не заполнены
      const availableSlots = slots.filter(
        (slot) => slot.bookings.length < slot.maxBookings
      );

      return availableSlots;
    } catch (error) {
      logger.error('Ошибка получения слотов', { error, dateFrom, dateTo });
      throw error;
    }
  }

  /**
   * Создание нового слота
   */
  async createSlot(data: {
    date: Date;
    duration?: number;
    maxBookings?: number;
  }) {
    try {
      const slot = await prisma.timeSlot.create({
        data: {
          date: data.date,
          duration: data.duration || 60,
          maxBookings: data.maxBookings || 1,
          isAvailable: true,
        },
      });

      logger.info('Создан новый слот', { slotId: slot.id });
      return slot;
    } catch (error) {
      logger.error('Ошибка создания слота', { error, data });
      throw error;
    }
  }

  /**
   * Обновление слота
   */
  async updateSlot(id: string, data: {
    date?: Date;
    duration?: number;
    maxBookings?: number;
    isAvailable?: boolean;
  }) {
    try {
      const slot = await prisma.timeSlot.update({
        where: { id },
        data,
      });

      logger.info('Слот обновлен', { slotId: id });
      return slot;
    } catch (error) {
      logger.error('Ошибка обновления слота', { error, slotId: id });
      throw error;
    }
  }

  /**
   * Удаление слота
   */
  async deleteSlot(id: string) {
    try {
      await prisma.timeSlot.delete({
        where: { id },
      });

      logger.info('Слот удален', { slotId: id });
    } catch (error) {
      logger.error('Ошибка удаления слота', { error, slotId: id });
      throw error;
    }
  }

  /**
   * Получение всех слотов
   */
  async getAllSlots(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    isAvailable?: boolean;
  }) {
    try {
      const where: NonNullable<Parameters<typeof prisma.timeSlot.findMany>[0]>['where'] = {};

      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        };
      }

      if (filters?.isAvailable !== undefined) {
        where.isAvailable = filters.isAvailable;
      }

      const slots = await prisma.timeSlot.findMany({
        where,
        include: {
          bookings: {
            include: {
              user: true,
              car: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return slots;
    } catch (error) {
      logger.error('Ошибка получения слотов', { error, filters });
      throw error;
    }
  }
}

export default new SlotService();

