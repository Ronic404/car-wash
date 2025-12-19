import winston from 'winston';
import path from 'path';
import fs from 'fs';
import os from 'os';

const logDir = process.env.LOG_FILE_PATH || './logs';

// Создаем директорию для логов (recursive создаст все необходимые директории)
fs.mkdirSync(logDir, { recursive: true });

// Константы для ротации логов
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

/**
 * Настройка логгера Winston для Telegram бота
 */

// Формат для файлов: читаемый в development, JSON в production
const fileFormat = process.env.NODE_ENV === 'production'
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const serviceStr = service ? `[${service}] ` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${serviceStr}[${level.toUpperCase()}]: ${message}${metaStr ? ' ' + metaStr : ''}`;
      })
    );

// Общие опции для файловых транспортов
const fileTransportOptions = {
  maxsize: MAX_FILE_SIZE,
  maxFiles: MAX_FILES,
  tailable: true,
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  defaultMeta: {
    service: 'telegram-bot',
    hostname: os.hostname(),
    pid: process.pid,
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'telegram-bot-error.log'),
      level: 'error',
      ...fileTransportOptions,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'telegram-bot-combined.log'),
      ...fileTransportOptions,
    }),
  ],
  exceptionHandlers: [
    // Файл для необработанных исключений
    new winston.transports.File({
      filename: path.join(logDir, 'telegram-bot-exceptions.log'),
      ...fileTransportOptions,
    }),
  ],
  rejectionHandlers: [
    // Файл для необработанных отклоненных промисов
    new winston.transports.File({
      filename: path.join(logDir, 'telegram-bot-rejections.log'),
      ...fileTransportOptions,
    }),
  ],
  exitOnError: process.env.NODE_ENV === 'production' ? false : true,
});

// Выводим логи в консоль
// В development - с цветами и простым форматом для удобства разработки
// В production - JSON формат для Docker/Kubernetes и систем мониторинга
const consoleFormat = process.env.NODE_ENV === 'production'
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

const consoleTransport = new winston.transports.Console({ format: consoleFormat });

logger.add(consoleTransport);
logger.exceptions.handle(consoleTransport);
logger.rejections.handle(consoleTransport);

export default logger;

