import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, List, Typography, Spin, Empty, Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';
import styles from './SlotsPage.module.scss';
import type { ISlot } from '../../types/slot';

const { Title, Text } = Typography;

function SlotsPage() {
  const { dateFrom, dateTo } = useMemo(() => ({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }), []);

  const { data: slots, isLoading } = useQuery<ISlot[]>({
    queryKey: ['slots', dateFrom, dateTo],
    queryFn: () => apiService.getSlots({ dateFrom, dateTo }),
  });

  return (
    <div>
      <Title level={2}>Управление слотами</Title>
      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : slots && slots.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={slots}
          renderItem={(slot) => (
            <List.Item>
              <Card>
                <div className={styles.infoRow}>
                  <ClockCircleOutlined /> <Text strong>
                    {new Date(slot.date).toLocaleString('ru-RU')}
                  </Text>
                </div>
                <div className={styles.infoRow}>
                  {slot.isAvailable ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Доступен</Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">Недоступен</Tag>
                  )}
                </div>
                <div>
                  <Text type="secondary">
                    Записей: {slot.bookings?.length || 0} / {slot.maxBookings}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Слотов не найдено" className={styles.empty} />
      )}
    </div>
  );
}

export default SlotsPage;


