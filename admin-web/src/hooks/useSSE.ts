import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import sseService from '../services/sseService';
import logger from '../utils/logger';

function isBookingLike(data: unknown): data is { id: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { id?: unknown }).id === 'string'
  );
}

/**
 * Хук для работы с Server-Sent Events
 */
export function useSSE() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Подключаемся к SSE только если пользователь авторизован
    if (!isAuthenticated) {
      return;
    }

    sseService.connect();

    // Подписываемся на новые записи
    const unsubscribeNewBooking = sseService.on('new_booking', (booking) => {
      logger.info('Получено уведомление о новой записи', { booking });
      // Обновляем кеш записей
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    });

    // Подписываемся на обновления записей
    const unsubscribeBookingUpdate = sseService.on('booking_update', (booking) => {
      logger.info('Получено уведомление об обновлении записи', { booking });
      // Обновляем кеш записей и конкретной записи
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (isBookingLike(booking)) {
        queryClient.invalidateQueries({ queryKey: ['booking', booking.id] });
      }
    });

    // Cleanup при размонтировании
    return () => {
      unsubscribeNewBooking();
      unsubscribeBookingUpdate();
      sseService.disconnect();
    };
  }, [queryClient, isAuthenticated]);
}

