import type { Context } from 'telegraf';

/**
 * Безопасно отвечает на callbackQuery, если он есть, игнорируя ошибки,
 * чтобы хендлеры работали и для inline-кнопок, и для reply-клавиатуры/команд.
 */
export async function safeAnswerCb(ctx: Context) {
  if (ctx.callbackQuery) {
    try {
      await ctx.answerCbQuery();
    } catch {
      /* ignore */
    }
  }
}


