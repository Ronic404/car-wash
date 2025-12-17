import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import './BookingsPage.scss';

function BookingsPage() {
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: () => apiService.getBookings(statusFilter !== 'all' ? { status: statusFilter } : undefined),
  });

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; class: string } } = {
      PENDING: { text: 'Ожидает', class: 'pending' },
      CONFIRMED: { text: 'Подтверждена', class: 'confirmed' },
      CANCELLED: { text: 'Отменена', class: 'cancelled' },
      COMPLETED: { text: 'Завершена', class: 'completed' },
    };
    return badges[status] || { text: status, class: '' };
  };

  return (
    <div className="bookings-page">
      <div className="bookings-page__header">
        <h1>Записи</h1>
        <div className="bookings-page__filters">
          <button
            className={statusFilter === 'all' ? 'active' : ''}
            onClick={() => setStatusFilter('all')}
          >
            Все
          </button>
          <button
            className={statusFilter === 'PENDING' ? 'active' : ''}
            onClick={() => setStatusFilter('PENDING')}
          >
            Ожидают
          </button>
          <button
            className={statusFilter === 'CONFIRMED' ? 'active' : ''}
            onClick={() => setStatusFilter('CONFIRMED')}
          >
            Подтвержденные
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bookings-page__loading">Загрузка...</div>
      ) : bookings && bookings.length > 0 ? (
        <div className="bookings-page__list">
          {bookings.map((booking: any) => {
            const status = getStatusBadge(booking.status);
            const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');
            return (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="bookings-page__item"
              >
                <div className="bookings-page__item-header">
                  <span className={`bookings-page__status bookings-page__status--${status.class}`}>
                    {status.text}
                  </span>
                  <span className="bookings-page__date">{slotDate}</span>
                </div>
                <div className="bookings-page__item-body">
                  <div>
                    <strong>{booking.car.brand} {booking.car.model}</strong>
                    {booking.car.licensePlate && ` (${booking.car.licensePlate})`}
                  </div>
                  <div>{booking.service.name} - {booking.service.price}₽</div>
                  <div className="bookings-page__user">
                    {booking.user.firstName} {booking.user.lastName}
                    {booking.user.phone && ` • ${booking.user.phone}`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bookings-page__empty">Записей не найдено</div>
      )}
    </div>
  );
}

export default BookingsPage;

