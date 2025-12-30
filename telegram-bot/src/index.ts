import { Telegraf, Scenes, Middleware, Context } from 'telegraf';
import LocalSession = require('telegraf-session-local');
import dotenv from 'dotenv';
import logger from './config/logger';
import { handleStart, handleShowMenu } from './handlers/startHandler';
import { handleCallback } from './handlers/callbackHandler';
import { handleMessage } from './handlers/messageHandler';
import { handleViewSlots } from './handlers/slotsHandler';
import { handleViewServices } from './handlers/servicesHandler';
import { handleMyCars } from './handlers/carsHandler';
import { handleMyBookings } from './handlers/myBookingsHandler';
import { addCarScene } from './scenes/addCarScene';

// Загружаем переменные окружения
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(BOT_TOKEN);

// Настройка сессий
const sessionMiddleware = new LocalSession({
  database: 'sessions.json', // Файл для хранения сессий (опционально, можно убрать для работы только в памяти)
}).middleware();

// Создаем Stage для управления сценами
const stage = new Scenes.Stage([addCarScene]);

// Middleware для логирования всех обновлений
bot.use((ctx, next) => {
  logger.debug('Получено обновление', {
    updateType: ctx.updateType,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
  });
  return next();
});

// Подключаем сессии и сцены
bot.use(sessionMiddleware);
// Приведение типа необходимо из-за конфликта типов между базовым Context и SceneContext
// Stage.middleware() возвращает Middleware<SceneContext>, но bot.use ожидает Middleware<Context>
// Это безопасное приведение, так как SceneContext расширяет Context
bot.use(stage.middleware() as unknown as Middleware<Context>);

// Обработка команд
bot.command('start', handleStart);
bot.command('slots', handleViewSlots);
bot.command('services', handleViewServices);
bot.command('mycars', handleMyCars);
bot.command('mybookings', handleMyBookings);
bot.command('menu', handleShowMenu);
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

