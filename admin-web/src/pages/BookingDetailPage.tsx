import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/apiService';
import logger from '../utils/logger';
import './BookingDetailPage.scss';

function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => apiService.getBookingById(id!),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiService.confirmBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiService.cancelBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => apiService.completeBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  if (isLoading) {
    return <div className="booking-detail-page">Загрузка...</div>;
  }

  if (!booking) {
    return <div className="booking-detail-page">Запись не найдена</div>;
  }

  const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');

  return (
    <div className="booking-detail-page">
      <button onClick={() => navigate('/bookings')} className="booking-detail-page__back">
        ← Назад к записям
      </button>

      <div className="booking-detail-page__card">
        <div className="booking-detail-page__header">
          <h1>Детали записи</h1>
          <span className={`booking-detail-page__status booking-detail-page__status--${booking.status.toLowerCase()}`}>
            {booking.status === 'PENDING' && 'Ожидает подтверждения'}
            {booking.status === 'CONFIRMED' && 'Подтверждена'}
            {booking.status === 'CANCELLED' && 'Отменена'}
            {booking.status === 'COMPLETED' && 'Завершена'}
          </span>
        </div>

        <div className="booking-detail-page__info">
          <div className="booking-detail-page__section">
            <h2>Дата и время</h2>
            <p>{slotDate}</p>
          </div>

          <div className="booking-detail-page__section">
            <h2>Автомобиль</h2>
            <p>
              <strong>{booking.car.brand} {booking.car.model}</strong>
              {booking.car.year && ` (${booking.car.year} г.)`}
              {booking.car.color && ` • ${booking.car.color}`}
              {booking.car.licensePlate && ` • ${booking.car.licensePlate}`}
            </p>
          </div>

          <div className="booking-detail-page__section">
            <h2>Услуга</h2>
            <p>
              <strong>{booking.service.name}</strong>
              {booking.service.description && ` • ${booking.service.description}`}
            </p>
            <p>Цена: {booking.service.price}₽</p>
            <p>Длительность: {booking.service.duration} мин.</p>
          </div>

          <div className="booking-detail-page__section">
            <h2>Клиент</h2>
            <p>
              {booking.user.firstName} {booking.user.lastName}
              {booking.user.phone && ` • ${booking.user.phone}`}
              {booking.user.username && ` • @${booking.user.username}`}
            </p>
          </div>

          {booking.notes && (
            <div className="booking-detail-page__section">
              <h2>Заметки</h2>
              <p>{booking.notes}</p>
            </div>
          )}
        </div>

        <div className="booking-detail-page__actions">
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="booking-detail-page__btn booking-detail-page__btn--confirm"
              >
                {confirmMutation.isPending ? 'Подтверждение...' : 'Подтвердить'}
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="booking-detail-page__btn booking-detail-page__btn--cancel"
              >
                {cancelMutation.isPending ? 'Отмена...' : 'Отменить'}
              </button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="booking-detail-page__btn booking-detail-page__btn--complete"
            >
              {completeMutation.isPending ? 'Завершение...' : 'Завершить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetailPage;

