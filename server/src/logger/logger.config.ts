import fs from 'fs';
import os from 'os';
import path from 'path';
import winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

const logDir = process.env.LOG_FILE_PATH || './logs';
const isProduction = process.env.NODE_ENV === 'production';

// Создаем директорию для логов (recursive создаст все необходимые директории)
fs.mkdirSync(logDir, { recursive: true });

// Константы для ротации логов
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Общие опции для файловых транспортов
const fileTransportOptions = {
    maxsize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    tailable: true,
};

// Формат для файлов: читаемый в development, JSON в production
const fileFormat = isProduction
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

// Выводим логи в консоль
// В development - с цветами и простым форматом для удобства разработки
// В production - JSON формат для Docker/Kubernetes и систем мониторинга
const consoleFormat = isProduction
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

export const loggerConfig: WinstonModuleOptions = {
    level: isProduction ? 'info' : 'debug',
    format: fileFormat,
    defaultMeta: {
        service: 'server',
        hostname: os.hostname(),
        pid: process.pid,
    },
    transports: [
        // Запись всех логов в файл
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            ...fileTransportOptions,
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            ...fileTransportOptions,
        }),
        new winston.transports.Console({ format: consoleFormat }),
    ],
    exceptionHandlers: [
        // Файл для необработанных исключений
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            ...fileTransportOptions,
        }),
        new winston.transports.Console({ format: consoleFormat }),
    ],
    rejectionHandlers: [
        // Файл для необработанных отклоненных промисов
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            ...fileTransportOptions,
        }),
        new winston.transports.Console({ format: consoleFormat }),
    ],
    exitOnError: isProduction ? false : true,
}