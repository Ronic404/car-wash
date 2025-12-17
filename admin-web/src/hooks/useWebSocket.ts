import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import wsService from '../services/websocketService';
import logger from '../utils/logger';

/**
 * Хук для работы с WebSocket
 */
export function useWebSocket() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Подключаемся к WebSocket только если пользователь авторизован
    if (!isAuthenticated) {
      return;
    }

    wsService.connect();

    // Подписываемся на новые записи
    const unsubscribeNewBooking = wsService.on('new_booking', (booking) => {
      logger.info('Получено уведомление о новой записи', { booking });
      // Обновляем кеш записей
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    });

    // Подписываемся на обновления записей
    const unsubscribeBookingUpdate = wsService.on('booking_update', (booking) => {
      logger.info('Получено уведомление об обновлении записи', { booking });
      // Обновляем кеш записей и конкретной записи
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', booking.id] });
    });

    // Cleanup при размонтировании
    return () => {
      unsubscribeNewBooking();
      unsubscribeBookingUpdate();
      wsService.disconnect();
    };
  }, [queryClient, isAuthenticated]);
}

