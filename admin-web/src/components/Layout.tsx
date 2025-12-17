import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import './Layout.scss';

function Layout() {
  const { admin, logout } = useAuthStore();
  const location = useLocation();
  
  // Подключаем WebSocket для real-time обновлений
  useWebSocket();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="layout__sidebar">
        <div className="layout__sidebar-header">
          <h1>🚗 Автомойка</h1>
          <p className="layout__admin-name">
            {admin?.firstName} {admin?.lastName}
          </p>
        </div>
        <ul className="layout__nav">
          <li>
            <Link
              to="/dashboard"
              className={isActive('/dashboard') ? 'active' : ''}
            >
              📊 Дашборд
            </Link>
          </li>
          <li>
            <Link
              to="/bookings"
              className={isActive('/bookings') || location.pathname.startsWith('/bookings/') ? 'active' : ''}
            >
              📋 Записи
            </Link>
          </li>
          <li>
            <Link to="/slots" className={isActive('/slots') ? 'active' : ''}>
              ⏰ Слоты
            </Link>
          </li>
          <li>
            <Link to="/services" className={isActive('/services') ? 'active' : ''}>
              💼 Услуги
            </Link>
          </li>
          <li>
            <Link to="/employees" className={isActive('/employees') ? 'active' : ''}>
              👥 Сотрудники
            </Link>
          </li>
        </ul>
        <button className="layout__logout" onClick={logout}>
          Выйти
        </button>
      </nav>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

