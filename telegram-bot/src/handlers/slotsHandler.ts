import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';

/**
 * Обработчик просмотра доступных слотов
 */
export async function handleViewSlots(ctx: Context) {
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

    // Получаем слоты на сегодня и завтра
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2); // +2 дня, чтобы включить завтра

    await ctx.reply('⏳ Загружаю доступные слоты...');

    const slots = await apiService.getAvailableSlots(today, tomorrow);

    if (slots.length === 0) {
      await ctx.reply('К сожалению, на ближайшие дни нет доступных слотов.');
      return;
    }

    // Группируем слоты по датам
    const slotsByDate: { [key: string]: any[] } = {};
    slots.forEach((slot: any) => {
      const date = new Date(slot.date).toLocaleDateString('ru-RU');
      if (!slotsByDate[date]) {
        slotsByDate[date] = [];
      }
      slotsByDate[date].push(slot);
    });

    let message = '📅 Доступные слоты:\n\n';

    // Создаем кнопки для выбора слотов
    const buttons: any[] = [];

    Object.keys(slotsByDate).forEach((date) => {
      message += `📆 ${date}:\n`;
      slotsByDate[date].forEach((slot) => {
        const time = new Date(slot.date).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        });
        message += `  • ${time}\n`;
        buttons.push([
          {
            text: `${date} ${time}`,
            callback_data: `select_slot_${slot.id}`,
          },
        ]);
      });
      message += '\n';
    });

    buttons.push([{ text: '◀️ Назад', callback_data: 'back_to_menu' }]);

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    logger.error('Ошибка получения слотов', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке слотов. Попробуйте позже.');
  }
}

/**
 * Обработчик выбора слота
 */
export async function handleSelectSlot(ctx: Context, slotId: string) {
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

    // Сохраняем выбранный слот в контексте пользователя
    // В реальности это должно храниться в БД или кеше
    (ctx as any).session = (ctx as any).session || {};
    (ctx as any).session.selectedSlotId = slotId;
    (ctx as any).session.userId = user.id;

    // Получаем автомобили пользователя
    const cars = await apiService.getUserCars(user.id);

    if (cars.length === 0) {
      await ctx.reply(
        'У вас нет сохраненных автомобилей. Давайте добавим новый автомобиль.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
              [{ text: '◀️ Назад', callback_data: 'view_slots' }],
            ],
          },
        }
      );
      return;
    }

    // Показываем список автомобилей для выбора
    const buttons = cars.map((car: any) => [
      {
        text: `${car.brand} ${car.model}${car.licensePlate ? ` (${car.licensePlate})` : ''}`,
        callback_data: `select_car_${car.id}`,
      },
    ]);

    buttons.push([
      { text: '➕ Добавить новый автомобиль', callback_data: 'add_car' },
    ]);
    buttons.push([{ text: '◀️ Назад', callback_data: 'view_slots' }]);

    await ctx.reply('Выберите автомобиль для мойки:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    logger.error('Ошибка выбора слота', { error, slotId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

