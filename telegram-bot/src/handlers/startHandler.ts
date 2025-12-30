import { Context } from 'telegraf';
import userService from '../services/userService';
import logger from '../config/logger';

export const MENU_BUTTONS = {
  slots: '📅 Посмотреть доступные слоты',
  services: '💰 Прайс услуг',
  myCars: '🚗 Мои автомобили',
  myBookings: '📋 Мои записи',
};

function mainKeyboard() {
  return {
    keyboard: [
      [{ text: MENU_BUTTONS.slots }],
      [{ text: MENU_BUTTONS.services }],
      [{ text: MENU_BUTTONS.myCars }, { text: MENU_BUTTONS.myBookings }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

/**
 * Обработчик команды /start
 */
export async function handleStart(ctx: Context) {
  try {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    // Получаем или создаем пользователя
    const user = await userService.getOrCreateUser({
      id: telegramUser.id.toString(),
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
    });

    logger.info('Пользователь запустил бота', { userId: user.id, telegramId: telegramUser.id });

    const welcomeMessage = `👋 Добро пожаловать в бот автомойки!

Я помогу вам записаться на мойку автомобиля.

Используйте кнопки ниже для навигации:`;

    await ctx.reply(welcomeMessage, {
      // reply_markup: {
      //   inline_keyboard: [
      //     [
      //       { text: '📅 Посмотреть доступные слоты', callback_data: 'view_slots' },
      //     ],
      //     [
      //       { text: '💰 Прайс услуг', callback_data: 'view_services' },
      //     ],
      //     [
      //       { text: '🚗 Мои автомобили', callback_data: 'my_cars' },
      //       { text: '📋 Мои записи', callback_data: 'my_bookings' },
      //     ],
      //   ],
      // },
      reply_markup: mainKeyboard(),
    });
  } catch (error) {
    logger.error('Ошибка обработки команды /start', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleShowMenu(ctx: Context) {
  await ctx.reply('Меню:', {
    reply_markup: mainKeyboard(),
  });
}
