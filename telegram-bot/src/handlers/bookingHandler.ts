import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';

/**
 * Обработчик выбора услуги и создания записи
 */
export async function handleSelectService(
  ctx: Context,
  serviceId: string,
  carId: string,
  slotId: string
) {
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

    await ctx.reply('⏳ Создаю запись...');

    // Создаем запись
    const booking = await apiService.createBooking({
      userId: user.id,
      carId,
      serviceId,
      slotId,
    });

    // Очищаем сессию
    (ctx as any).session = (ctx as any).session || {};
    (ctx as any).session.selectedSlotId = null;

    const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');

    await ctx.reply(
      `✅ Запись успешно создана!

📅 Дата и время: ${slotDate}
🚗 Автомобиль: ${booking.car.brand} ${booking.car.model}
💼 Услуга: ${booking.service.name}
💰 Цена: ${booking.service.price}₽
📊 Статус: Ожидает подтверждения

Администратор скоро подтвердит вашу запись. Вы получите уведомление.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
          ],
        },
      }
    );

    logger.info('Создана новая запись через бота', {
      bookingId: booking.id,
      userId: user.id,
    });
  } catch (error: any) {
    logger.error('Ошибка создания записи', {
      error,
      serviceId,
      carId,
      slotId,
      userId: ctx.from?.id,
    });
    await ctx.reply(`❌ Ошибка: ${error.message || 'Не удалось создать запись'}`);
  }
}

/**
 * Обработчик просмотра записей пользователя
 */
export async function handleMyBookings(ctx: Context) {
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

    let message = '📋 Ваши записи:\n\n';

    bookings.forEach((booking: any, index: number) => {
      const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');
      const statusEmoji = {
        PENDING: '⏳',
        CONFIRMED: '✅',
        CANCELLED: '❌',
        COMPLETED: '✔️',
      }[booking.status] || '❓';

      const statusText = {
        PENDING: 'Ожидает подтверждения',
        CONFIRMED: 'Подтверждена',
        CANCELLED: 'Отменена',
        COMPLETED: 'Завершена',
      }[booking.status] || booking.status;

      message += `${index + 1}. ${statusEmoji} ${statusText}\n`;
      message += `   📅 ${slotDate}\n`;
      message += `   🚗 ${booking.car.brand} ${booking.car.model}\n`;
      message += `   💼 ${booking.service.name} - ${booking.service.price}₽\n\n`;
    });

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Новая запись', callback_data: 'view_slots' }],
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error) {
    logger.error('Ошибка получения записей', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке записей. Попробуйте позже.');
  }
}

