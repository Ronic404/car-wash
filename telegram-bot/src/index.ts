import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import logger from './config/logger';
import { handleStart } from './handlers/startHandler';
import { handleCallback } from './handlers/callbackHandler';
import { handleMessage } from './handlers/messageHandler';

// Загружаем переменные окружения
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(BOT_TOKEN);

// Middleware для логирования всех обновлений
bot.use((ctx, next) => {
  logger.debug('Получено обновление', {
    updateType: ctx.updateType,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
  });
  return next();
});

// Обработка команды /start
bot.command('start', handleStart);

// Обработка callback запросов
bot.on('callback_query', handleCallback);

// Обработка текстовых сообщений
bot.on('text', handleMessage);

// Обработка ошибок
bot.catch((err, ctx) => {
  logger.error('Ошибка в боте', {
    error: err,
    userId: ctx.from?.id,
    updateType: ctx.updateType,
  });
  ctx.reply('Произошла ошибка. Попробуйте позже или используйте /start');
});

// Запуск бота
bot.launch().then(() => {
  logger.info('Telegram бот запущен');
}).catch((error) => {
  logger.error('Ошибка запуска бота', { error });
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => {
  logger.info('SIGINT получен, завершение работы бота...');
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  logger.info('SIGTERM получен, завершение работы бота...');
  bot.stop('SIGTERM');
  process.exit(0);
});

