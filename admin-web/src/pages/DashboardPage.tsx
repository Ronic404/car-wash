import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import apiService from '../services/apiService';
import styles from './DashboardPage.module.scss';

const { Title } = Typography;

function DashboardPage() {
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    today: 0,
  });

  const { data: bookings, isLoading } = useQuery({
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

  if (isLoading) {
    return <Spin size="large" className={styles.spin} />;
  }

  return (
    <div>
      <Title level={2}>Дашборд</Title>
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Ожидают подтверждения"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className={styles.linkContainer}>
              <Link to="/bookings?status=PENDING">Посмотреть →</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Подтвержденные"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className={styles.linkContainer}>
              <Link to="/bookings?status=CONFIRMED">Посмотреть →</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Записи на сегодня"
              value={stats.today}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className={styles.linkContainer}>
              <Link to="/bookings">Посмотреть →</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
