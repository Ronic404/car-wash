import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import sseService from '../services/sseService';
import logger from '../utils/logger';
import { useAppNotification } from '../components/AppNotificationProvider';

function isBookingLike(data: unknown): data is { id: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { id?: unknown }).id === 'string'
  );
}

function getBookingPreview(data: unknown): {
  id?: string;
  startAt?: string;
  durationMinutes?: number;
  postName?: string;
  serviceName?: string;
} {
  if (typeof data !== 'object' || data === null) return {};
  const obj = data as {
    id?: unknown;
    startAt?: unknown;
    durationMinutes?: unknown;
    post?: { name?: unknown } | null;
    service?: { name?: unknown } | null;
  };

  return {
    id: typeof obj.id === 'string' ? obj.id : undefined,
    startAt: typeof obj.startAt === 'string' ? obj.startAt : undefined,
    durationMinutes: typeof obj.durationMinutes === 'number' ? obj.durationMinutes : undefined,
    postName: typeof obj.post?.name === 'string' ? obj.post?.name : undefined,
    serviceName: typeof obj.service?.name === 'string' ? obj.service?.name : undefined,
  };
}

/**
 * Хук для работы с Server-Sent Events
 */
export function useSSE() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { notify } = useAppNotification();

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

      const preview = getBookingPreview(booking);
      const dateText =
        typeof preview.startAt === 'string' && !Number.isNaN(new Date(preview.startAt).getTime())
          ? new Date(preview.startAt).toLocaleString('ru-RU')
          : undefined;

      const descriptionParts = [
        dateText,
        preview.postName ? `Пост: ${preview.postName}` : undefined,
        preview.serviceName ? `Услуга: ${preview.serviceName}` : undefined,
        typeof preview.durationMinutes === 'number' ? `Длительность: ${preview.durationMinutes} мин.` : undefined,
      ].filter(Boolean);

      const bookingId = preview.id;
      notify({
        type: 'info',
        key: bookingId ?? undefined,
        message: 'Новая запись',
        description: descriptionParts.length ? descriptionParts.join(' • ') : 'Откройте страницу “Записи” для деталей.',
        // duration по умолчанию 0 (висит, пока админ сам не закроет)
        action: bookingId
          ? {
              text: 'Открыть',
              onClick: () => navigate(`/bookings/${bookingId}`),
              closeOnClick: true,
            }
          : undefined,
      });
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
  }, [queryClient, isAuthenticated, navigate, notify]);
}

