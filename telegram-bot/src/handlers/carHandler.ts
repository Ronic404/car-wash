import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';

/**
 * Обработчик выбора автомобиля для записи
 */
export async function handleSelectCar(ctx: Context, carId: string) {
  try {
    await ctx.answerCbQuery();

    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return;
    }

    const session = (ctx as any).session || {};
    const slotId = session.selectedSlotId;

    if (!slotId) {
      await ctx.reply('Ошибка: слот не выбран. Начните заново.');
      return;
    }

    // Получаем активные услуги
    const services = await apiService.getActiveServices();

    if (services.length === 0) {
      await ctx.reply('К сожалению, сейчас нет доступных услуг.');
      return;
    }

    // Показываем список услуг
    const buttons = services.map((service: any) => [
      {
        text: `${service.name} - ${service.price}₽`,
        callback_data: `select_service_${service.id}_${carId}_${slotId}`,
      },
    ]);

    buttons.push([{ text: '◀️ Назад', callback_data: 'view_slots' }]);

    await ctx.reply('Выберите услугу:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    logger.error('Ошибка выбора автомобиля', { error, carId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}


