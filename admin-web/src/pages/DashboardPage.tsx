import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import './DashboardPage.scss';

function DashboardPage() {
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    today: 0,
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiService.getBookings(),
  });

  useEffect(() => {
    if (bookings) {
      const pending = bookings.filter((b: any) => b.status === 'PENDING').length;
      const confirmed = bookings.filter((b: any) => b.status === 'CONFIRMED').length;
      const today = new Date().toDateString();
      const todayBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.slot.date).toDateString();
        return bookingDate === today;
      }).length;

      setStats({ pending, confirmed, today: todayBookings });
    }
  }, [bookings]);

  return (
    <div className="dashboard-page">
      <h1>Дашборд</h1>
      <div className="dashboard-page__stats">
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-value">{stats.pending}</div>
          <div className="dashboard-page__stat-label">Ожидают подтверждения</div>
          <Link to="/bookings?status=PENDING" className="dashboard-page__stat-link">
            Посмотреть →
          </Link>
        </div>
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-value">{stats.confirmed}</div>
          <div className="dashboard-page__stat-label">Подтвержденные</div>
          <Link to="/bookings?status=CONFIRMED" className="dashboard-page__stat-link">
            Посмотреть →
          </Link>
        </div>
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-value">{stats.today}</div>
          <div className="dashboard-page__stat-label">Записи на сегодня</div>
          <Link to="/bookings" className="dashboard-page__stat-link">
            Посмотреть →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

