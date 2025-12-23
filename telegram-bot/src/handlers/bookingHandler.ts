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
    ctx.session ??= {};
    ctx.session.selectedSlotId = null;

    if (!booking.slot) {
      await ctx.reply('Ошибка: не удалось получить информацию о слоте');
      return;
    }

    if (!booking.car) {
      await ctx.reply('Ошибка: не удалось получить информацию об автомобиле');
      return;
    }

    const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');

    // Получаем цену из servicePrices, если доступна
    const service = booking.service;
    const servicePrices = service?.servicePrices || [];
    let priceText = 'цена будет определена администратором';
    
    if (servicePrices.length > 0) {
      const prices = servicePrices.map((sp) => sp.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      priceText = minPrice === maxPrice ? `${minPrice}₽` : `от ${minPrice}₽`;
    }

    await ctx.reply(
      `✅ Запись успешно создана!

📅 Дата и время: ${slotDate}
🚗 Автомобиль: ${booking.car.brand} ${booking.car.model}
💼 Услуга: ${service?.name || 'Услуга'}
💰 Цена: ${priceText}
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Не удалось создать запись';
    logger.error('Ошибка создания записи', {
      error,
      serviceId,
      carId,
      slotId,
      userId: ctx.from?.id,
    });
    await ctx.reply(`❌ Ошибка: ${errorMessage}`);
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

    bookings.forEach((booking, index) => {
      if (!booking.slot || !booking.car) {
        return; // Пропускаем записи без необходимых данных
      }

      const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');
      
      const statusEmojiMap = {
        PENDING: '⏳',
        CONFIRMED: '✅',
        CANCELLED: '❌',
        COMPLETED: '✔️',
      };
      
      const statusTextMap = {
        PENDING: 'Ожидает подтверждения',
        CONFIRMED: 'Подтверждена',
        CANCELLED: 'Отменена',
        COMPLETED: 'Завершена',
      };

      const statusEmoji = statusEmojiMap[booking.status] || '❓';
      const statusText = statusTextMap[booking.status] || booking.status;

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
      message += `   📅 ${slotDate}\n`;
      message += `   🚗 ${booking.car.brand} ${booking.car.model}\n`;
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
  } catch (error) {
    logger.error('Ошибка получения записей', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке записей. Попробуйте позже.');
  }
}

