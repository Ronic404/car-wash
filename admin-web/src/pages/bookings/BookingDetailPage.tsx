import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  message,
  Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import apiService from '../../services/apiService';
import { useScreenSize } from '../../hooks/useBreakpoint';
import styles from './BookingDetailPage.module.scss';
import type { IBooking } from '../../types/booking';
import { getAxiosErrorText } from '../../utils/axiosUtils';

const { Title } = Typography;

function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isMobile } = useScreenSize();

  const { data: booking, isLoading } = useQuery<IBooking>({
    queryKey: ['booking', id],
    queryFn: () => apiService.getBookingById(id!),
    enabled: !!id,
  });

  const getServicePriceText = (b: IBooking): string => {
    const prices = b.service.servicePrices?.map((sp) => sp.price) || [];
    if (prices.length === 0) return 'цена не указана';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `${min}₽` : `от ${min}₽`;
  };

  const getServiceDurationText = (b: IBooking): string => {
    const durations = b.service.servicePrices?.map((sp) => sp.duration) || [];
    if (durations.length === 0) return 'длительность не указана';
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    return min === max ? `${min} мин.` : `${min} - ${max} мин.`;
  };

  const confirmMutation = useMutation({
    mutationFn: () => apiService.confirmBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Запись подтверждена');
    },
    onError: (error: unknown) => {
      const errText = getAxiosErrorText(error);
      message.error(errText || 'Ошибка подтверждения');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiService.cancelBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Запись отменена');
    },
    onError: (error: unknown) => {
      const errText = getAxiosErrorText(error);
      message.error(errText || 'Ошибка отмены');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => apiService.completeBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Запись завершена');
    },
    onError: (error: unknown) => {
      const errText = getAxiosErrorText(error);
      message.error(errText || 'Ошибка завершения');
    },
  });

  if (isLoading) {
    return <Spin size="large" className={styles.spin} />;
  }

  if (!booking) {
    return <div>Запись не найдена</div>;
  }

  const slotDate = new Date(booking.slot.date).toLocaleString('ru-RU');
  const statusConfig: { [key: string]: { color: string; text: string } } = {
    PENDING: { color: 'warning', text: 'Ожидает подтверждения' },
    CONFIRMED: { color: 'success', text: 'Подтверждена' },
    CANCELLED: { color: 'error', text: 'Отменена' },
    COMPLETED: { color: 'default', text: 'Завершена' },
  };
  const status = statusConfig[booking.status] || { color: 'default', text: booking.status };

  return (
    <div>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/bookings')}>Записи</a> },
          { title: 'Детали записи' },
        ]}
        className={styles.breadcrumb}
      />

      <Card
        title={
          <Space>
            <Title level={3} className={styles.title}>Детали записи</Title>
            <Tag color={status.color}>{status.text}</Tag>
          </Space>
        }
        extra={
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/bookings')}
            size={isMobile ? 'middle' : 'large'}
          >
            {isMobile ? 'Назад' : 'Назад к записям'}
          </Button>
        }
      >
        <Descriptions 
          column={1}
          bordered
          size={isMobile ? 'small' : 'default'}
        >
          <Descriptions.Item label="Дата и время">
            {slotDate}
          </Descriptions.Item>
          <Descriptions.Item label="Автомобиль">
            <strong>{booking.car.brand} {booking.car.model}</strong>
            {booking.car.year && ` (${booking.car.year} г.)`}
            {booking.car.color && ` • ${booking.car.color}`}
            {booking.car.licensePlate && ` • ${booking.car.licensePlate}`}
          </Descriptions.Item>
          <Descriptions.Item label="Услуга">
            <strong>{booking.service.name}</strong>
            {booking.service.description && ` • ${booking.service.description}`}
            <br />
            Цена: {getServicePriceText(booking)} | Длительность: {getServiceDurationText(booking)}
          </Descriptions.Item>
          <Descriptions.Item label="Клиент">
            {booking.user.firstName} {booking.user.lastName}
            {booking.user.phone && ` • ${booking.user.phone}`}
            {booking.user.username && ` • @${booking.user.username}`}
          </Descriptions.Item>
          {booking.notes && (
            <Descriptions.Item label="Заметки">
              {booking.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        <div className={styles.actionsContainer}>
          {booking.status === 'PENDING' && (
            <Space wrap direction={isMobile ? 'vertical' : 'horizontal'} className={styles.space}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => confirmMutation.mutate()}
                loading={confirmMutation.isPending}
                size="large"
                block={isMobile}
              >
                Подтвердить
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
                size="large"
                block={isMobile}
              >
                Отменить
              </Button>
            </Space>
          )}
          {booking.status === 'CONFIRMED' && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
              size="large"
              block={isMobile}
            >
              Завершить
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default BookingDetailPage;


