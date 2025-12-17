import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import expressWinston from 'express-winston';
import { createServer } from 'http';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { swaggerSpec } from './config/swagger';
import wsService from './websocket/server';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.API_PORT || 3000;

// Инициализация WebSocket
wsService.initialize(server);

// Middleware для безопасности
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true,
}));

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование HTTP запросов
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req) => req.url === '/health',
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger документация
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api', routes);

// Обработка ошибок
app.use(notFoundHandler);
app.use(errorHandler);

// Запуск сервера
server.listen(PORT, () => {
  logger.info(`API сервер запущен на порту ${PORT}`);
  logger.info(`Swagger документация доступна по адресу http://localhost:${PORT}/api/docs`);
  logger.info(`WebSocket сервер доступен по адресу ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM получен, завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT получен, завершение работы...');
  process.exit(0);
});

