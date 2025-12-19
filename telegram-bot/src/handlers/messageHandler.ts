import { Context } from 'telegraf';
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

    // Неизвестная команда
    await ctx.reply(
      'Я не понимаю эту команду. Используйте /start для начала работы.'
    );
  } catch (error) {
    logger.error('Ошибка обработки сообщения', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при обработке сообщения.');
  }
}

