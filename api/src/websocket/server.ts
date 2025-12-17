import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import logger from '../config/logger';

/**
 * WebSocket сервер для real-time уведомлений
 */
class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();

  /**
   * Инициализация WebSocket сервера
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      logger.info('WebSocket клиент подключен', { clientId });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          logger.debug('WebSocket сообщение получено', { clientId, data });
        } catch (error) {
          logger.error('Ошибка парсинга WebSocket сообщения', { error, clientId });
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info('WebSocket клиент отключен', { clientId });
      });

      ws.on('error', (error) => {
        logger.error('WebSocket ошибка', { error, clientId });
        this.clients.delete(clientId);
      });

      // Отправляем приветственное сообщение
      ws.send(JSON.stringify({ type: 'connected', clientId }));
    });

    logger.info('WebSocket сервер инициализирован');
  }

  /**
   * Отправка уведомления о новой записи всем подключенным администраторам
   */
  notifyNewBooking(booking: any): void {
    const message = JSON.stringify({
      type: 'new_booking',
      data: booking,
    });

    this.broadcast(message);
    logger.info('Уведомление о новой записи отправлено', { bookingId: booking.id });
  }

  /**
   * Отправка уведомления об обновлении записи
   */
  notifyBookingUpdate(booking: any): void {
    const message = JSON.stringify({
      type: 'booking_update',
      data: booking,
    });

    this.broadcast(message);
    logger.info('Уведомление об обновлении записи отправлено', { bookingId: booking.id });
  }

  /**
   * Отправка сообщения всем подключенным клиентам
   */
  private broadcast(message: string): void {
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        // Удаляем неактивных клиентов
        this.clients.delete(clientId);
      }
    });
  }

  /**
   * Генерация уникального ID для клиента
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение количества подключенных клиентов
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export default new WebSocketService();

