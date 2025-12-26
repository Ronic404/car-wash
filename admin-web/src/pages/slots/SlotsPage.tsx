import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Space, Typography, Spin, Empty, message } from 'antd';
import dayjs from 'dayjs';
import type { IBooking } from '../../types/booking';
import type { ITimeBlock } from '../../types/timeBlock';
import type { IWashingPost } from '../../types/washingPost';
import type { IWashingPostSchedule } from '../../types/washingPostSchedule';
import Timeline from '../../components/Timeline/Timeline';
import CreatePostModal from '../../components/Slots/CreatePostModal';
import DaySettingsModal from '../../components/Slots/DaySettingsModal';
import OccupyTimeModal from '../../components/Slots/OccupyTimeModal';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';
import styles from './SlotsPage.module.scss';

const { Title } = Typography;

function SlotsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDaySettingsOpen, setIsDaySettingsOpen] = useState(false);
  const [isOccupyModalOpen, setIsOccupyModalOpen] = useState(false);
  const [occupyInitialPostId, setOccupyInitialPostId] = useState<string | undefined>(undefined);
  const [occupyInitialStartAt, setOccupyInitialStartAt] = useState<Date | undefined>(undefined);

  const { dateFrom, dateTo } = useMemo(() => {
    const from = new Date(selectedDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(selectedDate);
    to.setHours(23, 59, 59, 999);
    return { dateFrom: from.toISOString(), dateTo: to.toISOString() };
  }, [selectedDate]);

  const {
    data: posts,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useQuery<IWashingPost[]>({
    queryKey: ['washing-posts'],
    queryFn: () => apiService.getWashingPosts(),
  });

  const {
    data: bookings,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
  } = useQuery<IBooking[]>({
    queryKey: ['bookings', 'byDate', dateFrom, dateTo],
    queryFn: () => apiService.getBookings({ dateFrom, dateTo }),
  });

  const {
    data: blocks,
    isLoading: isBlocksLoading,
    refetch: refetchBlocks,
  } = useQuery<ITimeBlock[]>({
    queryKey: ['time-blocks', dateFrom, dateTo],
    queryFn: () => apiService.getTimeBlocks({ dateFrom, dateTo }),
  });

  const {
    data: schedules,
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useQuery<IWashingPostSchedule[]>({
    queryKey: ['washing-post-schedules', dayjs(selectedDate).format('YYYY-MM-DD')],
    queryFn: () => apiService.getWashingPostSchedules(dayjs(selectedDate).format('YYYY-MM-DD')),
  });

  const isLoading = isPostsLoading || isSchedulesLoading || isBookingsLoading || isBlocksLoading;

  const onUpdated = async () => {
    await Promise.all([refetchPosts(), refetchSchedules(), refetchBookings(), refetchBlocks()]);
  };

  const openOccupyModal = (initial?: { postId?: string; startAt?: Date }) => {
    setOccupyInitialPostId(initial?.postId);
    setOccupyInitialStartAt(initial?.startAt);
    setIsOccupyModalOpen(true);
  };

  const closeOccupyModal = () => {
    setIsOccupyModalOpen(false);
    setOccupyInitialPostId(undefined);
    setOccupyInitialStartAt(undefined);
  };

  const deleteBlock = async (id: string) => {
    try {
      await apiService.deleteTimeBlock(id);
      await onUpdated();
      message.success('Блокировка удалена');
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    }
  };

  return (
    <div>
      <Title level={2}>Управление слотами</Title>

      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => setIsPostModalOpen(true)}>Посты</Button>
        <Button onClick={() => setIsDaySettingsOpen(true)}>Настройки дня</Button>
        <Button type="primary" onClick={() => openOccupyModal()}>
          Занять слот
        </Button>
      </Space>

      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : posts && posts.length > 0 ? (
        <Timeline
          date={selectedDate}
          posts={posts}
          schedules={schedules ?? []}
          bookings={bookings ?? []}
          blocks={blocks ?? []}
          onDateChange={(d) => setSelectedDate(d)}
          onOccupyClick={({ postId, startAt }) => openOccupyModal({ postId, startAt })}
          onDeleteBlock={deleteBlock}
        />
      ) : (
        <Empty
          description="Нет постов. Создайте хотя бы один моечный пост."
          className={styles.empty}
        />
      )}

      <CreatePostModal
        open={isPostModalOpen}
        posts={posts ?? []}
        onClose={() => setIsPostModalOpen(false)}
        onUpdated={onUpdated}
      />

      <DaySettingsModal
        open={isDaySettingsOpen}
        date={selectedDate}
        posts={posts ?? []}
        schedules={schedules ?? []}
        onClose={() => setIsDaySettingsOpen(false)}
        onUpdated={onUpdated}
      />

      <OccupyTimeModal
        open={isOccupyModalOpen}
        date={selectedDate}
        posts={posts ?? []}
        schedules={schedules ?? []}
        initialPostId={occupyInitialPostId}
        initialStartAt={occupyInitialStartAt}
        onClose={closeOccupyModal}
        onCreated={onUpdated}
      />
    </div>
  );
}

export default SlotsPage;


