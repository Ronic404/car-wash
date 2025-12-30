import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';
import { safeAnswerCb } from '../utils/telegrafUtils';

/**
 * Обработчик просмотра записей пользователя
 */
export async function handleMyBookings(ctx: Context) {
  try {
    await safeAnswerCb(ctx);

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

    await ctx.reply('⏳ Загружаю ваши записи...');

    const bookings = await apiService.getUserBookings(user.id);
    if (bookings.length === 0) {
      await ctx.reply('У вас пока нет записей.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📅 Записаться', callback_data: 'view_slots' }],
            [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
          ],
        },
      });
      return;
    }

    const statusEmojiMap: Record<string, string> = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      CANCELLED: '❌',
      COMPLETED: '✔️',
    };

    const statusTextMap: Record<string, string> = {
      PENDING: 'Ожидает подтверждения',
      CONFIRMED: 'Подтверждена',
      CANCELLED: 'Отменена',
      COMPLETED: 'Завершена',
    };

    let message = '📋 Ваши записи:\n\n';

    bookings.forEach((booking, index) => {
      const startAt = new Date(booking.startAt).toLocaleString('ru-RU');
      const postName = booking.post?.name ? ` (${booking.post.name})` : '';

      const statusEmoji = statusEmojiMap[booking.status] ?? '❓';
      const statusText = statusTextMap[booking.status] ?? booking.status;

      // Получаем цену из servicePrices, если доступна
      const service = booking.service;
      const servicePrices = service?.servicePrices || [];
      let priceText = 'цена не указана';

      if (servicePrices.length > 0) {
        const prices = servicePrices.map((sp) => sp.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceText = minPrice === maxPrice ? `${minPrice}₽` : `от ${minPrice}₽`;
      }

      message += `${index + 1}. ${statusEmoji} ${statusText}\n`;
      message += `   📅 ${startAt}${postName}\n`;
      message += `   🚗 ${booking.car?.brand ?? ''} ${booking.car?.model ?? ''}\n`;
      message += `   💼 ${service?.name || 'Услуга'} - ${priceText}\n\n`;
    });

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Новая запись', callback_data: 'view_slots' }],
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error: unknown) {
    logger.error('Ошибка получения записей', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке записей. Попробуйте позже.');
  }
}


