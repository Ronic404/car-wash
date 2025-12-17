import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/apiService';
import './SlotsPage.scss';

function SlotsPage() {
  const [dateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', dateFrom, dateTo],
    queryFn: () => apiService.getSlots({ dateFrom, dateTo }),
  });

  return (
    <div className="slots-page">
      <h1>Управление слотами</h1>
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="slots-page__list">
          {slots && slots.length > 0 ? (
            slots.map((slot: any) => (
              <div key={slot.id} className="slots-page__item">
                <div>
                  <strong>{new Date(slot.date).toLocaleString('ru-RU')}</strong>
                </div>
                <div>
                  {slot.isAvailable ? '✅ Доступен' : '❌ Недоступен'}
                </div>
                <div>Записей: {slot.bookings?.length || 0} / {slot.maxBookings}</div>
              </div>
            ))
          ) : (
            <div>Слотов не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SlotsPage;

