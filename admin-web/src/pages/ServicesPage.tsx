import { useQuery } from '@tanstack/react-query';
import { Card, List, Typography, Spin, Empty, Tag } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import styles from './ServicesPage.module.scss';

const { Title, Text } = Typography;

function ServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiService.getServices(),
  });

  return (
    <div>
      <Title level={2}>Управление услугами</Title>
      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : services && services.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={services}
          renderItem={(service: any) => (
            <List.Item>
              <Card>
                <div className={styles.infoRow}>
                  <ShoppingOutlined /> <Text strong>{service.name}</Text>
                </div>
                {service.description && (
                  <div className={styles.infoRow}>
                    <Text type="secondary">{service.description}</Text>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <Text>Цена: </Text>
                  <Text strong>{service.price}₽</Text>
                </div>
                <div className={styles.infoRow}>
                  <Text>Длительность: </Text>
                  <Text>{service.duration} мин.</Text>
                </div>
                <div>
                  {service.isActive ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Активна</Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">Неактивна</Tag>
                  )}
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Услуг не найдено" className={styles.empty} />
      )}
    </div>
  );
}

export default ServicesPage;
