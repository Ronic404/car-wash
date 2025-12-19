import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';

/**
 * Обработчик просмотра автомобилей пользователя
 */
export async function handleMyCars(ctx: Context) {
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

    await ctx.reply('⏳ Загружаю ваши автомобили...');

    const cars = await apiService.getUserCars(user.id);

    if (cars.length === 0) {
      await ctx.reply('У вас пока нет сохраненных автомобилей.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
            [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
          ],
        },
      });
      return;
    }

    let message = '🚗 Ваши автомобили:\n\n';

    cars.forEach((car, index) => {
      message += `${index + 1}. ${car.brand} ${car.model}`;
      if (car.year) {
        message += ` (${car.year} г.)`;
      }
      if (car.color) {
        message += ` - ${car.color}`;
      }
      if (car.licensePlate) {
        message += ` ${car.licensePlate}`;
      }
      message += '\n\n';
    });

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error) {
    logger.error('Ошибка получения автомобилей', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке автомобилей. Попробуйте позже.');
  }
}

