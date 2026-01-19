import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Tag, Tabs, List, Typography, Spin, Empty, Switch, Space, DatePicker } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import apiService from '../../services/apiService';
import styles from './BookingsPage.module.scss';
import type { IBooking } from '../../types/booking';

const { Text, Title } = Typography;

function BookingsPage() {
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [showPast, setShowPast] = useState(false);
  const [historyRange, setHistoryRange] = useState<[Dayjs, Dayjs] | null>(() => {
    const to = dayjs().endOf('day');
    const from = dayjs().subtract(30, 'day').startOf('day');
    return [from, to];
  });

  const { dateFrom, dateTo } = useMemo((): { dateFrom?: string; dateTo?: string } => {
    if (!showPast) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return { dateFrom: d.toISOString() };
    }

    if (!historyRange) return {};
    const [from, to] = historyRange;
    return {
      dateFrom: from.startOf('day').toDate().toISOString(),
      dateTo: to.endOf('day').toDate().toISOString(),
    };
  }, [showPast, historyRange]);

  const { data: bookings, isLoading } = useQuery<IBooking[]>({
    queryKey: ['bookings', statusFilter, showPast, dateFrom, dateTo],
    queryFn: () =>
      apiService.getBookings({
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      }),
  });

  const getServicePriceText = (booking: IBooking): string => {
    const prices = booking.service.servicePrices?.map((sp) => sp.price) || [];
    if (prices.length === 0) return 'цена не указана';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `${min}₽` : `от ${min}₽`;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      PENDING: { color: 'warning', text: 'Ожидает' },
      CONFIRMED: { color: 'success', text: 'Подтверждена' },
      CANCELLED: { color: 'error', text: 'Отменена' },
      COMPLETED: { color: 'default', text: 'Завершена' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const tabItems = [
    {
      key: 'all',
      label: 'Все',
    },
    {
      key: 'PENDING',
      label: 'Ожидают',
    },
    {
      key: 'CONFIRMED',
      label: 'Подтвержденные',
    },
  ];

  return (
    <div>
      <Title level={2}>Записи</Title>

      <Space style={{ marginTop: 12 }} wrap>
        <Switch checked={showPast} onChange={setShowPast} />
        <Text type="secondary">Показывать прошедшие</Text>

        {showPast && (
          <DatePicker.RangePicker
            allowClear
            value={historyRange}
            onChange={(value) => setHistoryRange(value as [Dayjs, Dayjs] | null)}
            format="DD.MM.YYYY"
            placeholder={['С', 'По']}
          />
        )}
      </Space>

      <Tabs
        activeKey={statusFilter}
        items={tabItems}
        onChange={(key) => setStatusFilter(key)}
        className={styles.tabs}
      />

      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : bookings && bookings.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={bookings}
          renderItem={(booking) => {
            const slotDate = new Date(booking.startAt).toLocaleString('ru-RU');
            return (
              <List.Item>
                <Link to={`/bookings/${booking.id}`} className={styles.link}>
                  <Card
                    hoverable
                    className={styles.card}
                  >
                    <div className={styles.statusContainer}>
                      {getStatusTag(booking.status)}
                      <Text type="secondary" className={styles.dateText}>
                        <CalendarOutlined /> {slotDate}
                      </Text>
                    </div>
                    <div className={styles.infoRow}>
                      <CarOutlined /> <Text strong>{booking.car.brand} {booking.car.model}</Text>
                      {booking.car.licensePlate && (
                        <Text type="secondary"> ({booking.car.licensePlate})</Text>
                      )}
                    </div>
                    <div className={styles.infoRow}>
                      <Text>{booking.service.name}</Text> - <Text strong>{getServicePriceText(booking)}</Text>
                    </div>
                    <div>
                      <UserOutlined /> <Text>{booking.user.firstName} {booking.user.lastName}</Text>
                      {booking.user.phone && (
                        <>
                          <br />
                          <PhoneOutlined /> <Text type="secondary">{booking.user.phone}</Text>
                        </>
                      )}
                    </div>
                  </Card>
                </Link>
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="Записей не найдено" className={styles.empty} />
      )}
    </div>
  );
}

export default BookingsPage;


