import { Context } from 'telegraf';
import { handleCarInput } from './carHandler';
import logger from '../config/logger';

/**
 * Обработчик текстовых сообщений
 */
export async function handleMessage(ctx: Context) {
  try {
    const text = (ctx.message as any)?.text;

    if (!text) {
      return;
    }

    const session = (ctx as any).session || {};

    // Обработка добавления автомобиля
    if (session.addingCar) {
      const carData = session.carData || {};

      if (!carData.brand) {
        await handleCarInput(ctx, 'brand', text);
      } else if (!carData.model) {
        await handleCarInput(ctx, 'model', text);
      } else if (carData.year === undefined && !carData.yearSet) {
        (ctx as any).session.carData.yearSet = true;
        await handleCarInput(ctx, 'year', text);
      } else if (!carData.color && !carData.colorSet) {
        (ctx as any).session.carData.colorSet = true;
        await handleCarInput(ctx, 'color', text);
      } else if (!carData.licensePlate && !carData.licensePlateSet) {
        (ctx as any).session.carData.licensePlateSet = true;
        await handleCarInput(ctx, 'licensePlate', text);
      }
      return;
    }

    // Неизвестная команда
    await ctx.reply(
      'Я не понимаю эту команду. Используйте /start для начала работы.'
    );
  } catch (error) {
    logger.error('Ошибка обработки сообщения', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при обработке сообщения.');
  }
}

