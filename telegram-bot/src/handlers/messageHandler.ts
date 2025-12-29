import { Context } from 'telegraf';
import logger from '../config/logger';
import { getTextFromContext } from '../types/telegram';
import { finalizeBookingFromSession } from './slotsHandler';

/**
 * Обработчик текстовых сообщений
 */
export async function handleMessage(ctx: Context) {
  try {
    const text = getTextFromContext(ctx);

    if (!text) {
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

