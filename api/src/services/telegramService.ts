import axios from 'axios';
import logger from '../config/logger';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

/**
 * Простой сервис для отправки уведомлений в Telegram пользователю по его telegramId.
 * Добавили подробный лог на случай ошибок, чтобы понимать, что отвечает API Telegram.
 */
async function sendMessage(telegramId: string, text: string) {
  if (!TELEGRAM_API_URL) {
    logger.warn('TELEGRAM_BOT_TOKEN не задан, уведомление не отправлено');
    return;
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: telegramId,
      text,
      parse_mode: 'HTML',
    });
    logger.info('Telegram уведомление отправлено', { telegramId });
  } catch (error: unknown) {
    logger.error('Ошибка отправки уведомления в Telegram', {
      telegramId,
      message: error instanceof Error ? error.message : String(error),
      response: (error as { response?: { data?: unknown } })?.response?.data,
    });
  }
}

export default { sendMessage };


