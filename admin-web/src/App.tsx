import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import SlotsPage from './pages/slots/SlotsPage';
import ServicesPage from './pages/services/ServicesPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import Layout from './components/Layout';

/**
 * Компонент для защищенных маршрутов
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="employees" element={<EmployeesPage />} />
      </Route>
    </Routes>
  );
}

export default App;

