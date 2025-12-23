import { Response } from 'express';
import logger from '../config/logger';
import type { ISSEMessage } from '../types/sse';

/**
 * Сервис для работы с Server-Sent Events (SSE)
 */
class SSEService {
  private clients: Set<Response> = new Set();

  /**
   * Добавление нового клиента SSE
   */
  addClient(res: Response): void {
    // Устанавливаем заголовки для SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Отключаем буферизацию в nginx

    // Добавляем клиента
    this.clients.add(res);

    // Отправляем начальное сообщение
    this.sendToClient(res, { type: 'connected', data: { timestamp: new Date().toISOString() } });

    logger.info('SSE клиент подключен', { clientsCount: this.clients.size });

    // Обработка отключения клиента
    res.on('close', () => {
      this.clients.delete(res);
      logger.info('SSE клиент отключен', { clientsCount: this.clients.size });
    });
  }

  /**
   * Отправка сообщения конкретному клиенту
   */
  private sendToClient(res: Response, message: ISSEMessage): void {
    try {
      const data = `data: ${JSON.stringify(message)}\n\n`;
      res.write(data);
    } catch (error) {
      logger.error('Ошибка отправки SSE сообщения клиенту', { error });
      this.clients.delete(res);
    }
  }

  /**
   * Отправка сообщения всем подключенным клиентам
   */
  private broadcast(message: ISSEMessage): void {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    
    this.clients.forEach((client) => {
      try {
        client.write(data);
      } catch (error) {
        logger.error('Ошибка отправки SSE сообщения', { error });
        this.clients.delete(client);
      }
    });
  }

  /**
   * Отправка уведомления о новой записи всем подключенным администраторам
   */
  notifyNewBooking(booking: unknown): void {
    this.broadcast({
      type: 'new_booking',
      data: booking,
    });
    logger.info('SSE уведомление о новой записи отправлено');
  }

  /**
   * Отправка уведомления об обновлении записи
   */
  notifyBookingUpdate(booking: unknown): void {
    this.broadcast({
      type: 'booking_update',
      data: booking,
    });
    logger.info('SSE уведомление об обновлении записи отправлено');
  }

  /**
   * Получение количества подключенных клиентов
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export default new SSEService();

