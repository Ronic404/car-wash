import logger from '../utils/logger';

/**
 * Сервис для работы с WebSocket
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Подключение к WebSocket серверу
   */
  connect(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        logger.info('WebSocket подключен');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          logger.debug('WebSocket сообщение получено', message);

          // Уведомляем всех слушателей этого типа события
          const listeners = this.listeners.get(message.type);
          if (listeners) {
            listeners.forEach((listener) => listener(message.data));
          }

          // Также уведомляем слушателей всех событий
          const allListeners = this.listeners.get('*');
          if (allListeners) {
            allListeners.forEach((listener) => listener(message));
          }
        } catch (error) {
          logger.error('Ошибка парсинга WebSocket сообщения', { error });
        }
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket ошибка', { error });
      };

      this.ws.onclose = () => {
        logger.warn('WebSocket отключен');
        this.ws = null;

        // Попытка переподключения
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          logger.info(`Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
          logger.error('Достигнуто максимальное количество попыток переподключения');
        }
      };
    } catch (error) {
      logger.error('Ошибка подключения к WebSocket', { error });
    }
  }

  /**
   * Отключение от WebSocket сервера
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  /**
   * Подписка на события
   */
  on(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Возвращаем функцию для отписки
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Отправка сообщения
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logger.warn('WebSocket не подключен, сообщение не отправлено', { message });
    }
  }

  /**
   * Проверка состояния подключения
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();

