import { Context } from 'telegraf';
import logger from '../config/logger';
import { getTextFromContext } from '../types/telegram';
import { finalizeBookingFromSession, handleViewSlots } from './slotsHandler';
import { handleViewServices } from './servicesHandler';
import { handleMyCars } from './carsHandler';
import { handleMyBookings } from './myBookingsHandler';
import { MENU_BUTTONS } from './startHandler';

/**
 * Обработчик текстовых сообщений
 */
export async function handleMessage(ctx: Context) {
  try {
    const text = getTextFromContext(ctx);

    if (!text) {
      return;
    }

    if (text === MENU_BUTTONS.slots) {
      await handleViewSlots(ctx);
      return;
    }
    if (text === MENU_BUTTONS.services) {
      await handleViewServices(ctx);
      return;
    }
    if (text === MENU_BUTTONS.myCars) {
      await handleMyCars(ctx);
      return;
    }
    if (text === MENU_BUTTONS.myBookings) {
      await handleMyBookings(ctx);
      return;
    }
    if (ctx.session?.waitingBookingNote) {
      const note = text.trim();
      if (note.length > 500) {
        await ctx.reply('Комментарий слишком длинный. Максимум 500 символов.');
        return;
      }

      ctx.session.waitingBookingNote = false;
      await finalizeBookingFromSession(ctx, note.length ? note : null);
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

