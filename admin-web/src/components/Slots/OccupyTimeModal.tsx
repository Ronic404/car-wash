import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Radio, Select, TimePicker, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { IWashingPost } from '../../types/washingPost';
import type { IWashingPostSchedule } from '../../types/washingPostSchedule';
import type { IService } from '../../types/service';
import type { TimeBlockKind } from '../../types/timeBlock';
import type { IUser } from '../../types/user';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';

interface IOccupyTimeModalProps {
  open: boolean;
  date: Date;
  posts: IWashingPost[];
  schedules: IWashingPostSchedule[];
  initialPostId?: string;
  initialStartAt?: Date;
  onClose: () => void;
  onCreated: () => void;
}

export default function OccupyTimeModal(props: IOccupyTimeModalProps) {
  const { open, date, posts, schedules, initialPostId, initialStartAt, onClose, onCreated } = props;
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<IService[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const currentKind = Form.useWatch('kind', form) as TimeBlockKind | 'BOOKING' | undefined;
  const selectedUserId = Form.useWatch('userId', form) as string | undefined;

  const dayStr = useMemo(() => dayjs(date).format('YYYY-MM-DD'), [date]);

  const activePostIds = useMemo(() => {
    return new Set(schedules.filter((s) => s.isActive).map((s) => s.postId));
  }, [schedules]);

  const activePosts = useMemo(
    () => posts.filter((p) => activePostIds.has(p.id)).sort((a, b) => a.order - b.order),
    [posts, activePostIds]
  );

  const serviceOptions = useMemo(() => {
    return services
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ value: s.id, label: s.name }));
  }, [services]);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label:
          [u.firstName, u.lastName].filter(Boolean).join(' ') +
            (u.username ? ` (@${u.username})` : '') || u.id,
      })),
    [users]
  );

  const carOptions = useMemo(() => {
    if (!selectedUserId) return [];
    const user = users.find((u) => u.id === selectedUserId);
    return (user?.cars ?? []).map((c) => ({
      value: c.id,
      label: [c.brand, c.model, c.color, c.licensePlate].filter(Boolean).join(' ') || c.id,
    }));
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await apiService.getServices();
        setServices(list);
        const usersList = await apiService.getUsers();
        setUsers(usersList);
      } catch (error: unknown) {
        const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
        message.error(text);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const start = initialStartAt ? dayjs(initialStartAt) : dayjs(date).hour(9).minute(0);
    const defaultEnd = start.add(30, 'minute');
    form.setFieldsValue({
      kind: 'BOOKING' as TimeBlockKind,
      postId: initialPostId,
      startTime: start,
      endTime: defaultEnd,
      serviceId: undefined,
      userId: undefined,
      carId: undefined,
      carBrand: undefined,
      carModel: undefined,
      note: undefined,
    });
  }, [open, form, date, initialPostId, initialStartAt]);

  const onValuesChange = (changed: Record<string, unknown>, all: Record<string, unknown>) => {
    const serviceId = all.serviceId as string | undefined;
    const startTime = all.startTime as Dayjs | undefined;
    if (serviceId && startTime) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        const end = startTime.add(service.duration, 'minute');
        form.setFieldValue('endTime', end);
      }
    }

    if ('kind' in changed) {
      const kind = changed.kind as string;
      if (kind === 'BOOKING') {
        form.setFieldValue('carBrand', undefined);
        form.setFieldValue('carModel', undefined);
      }
    }
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const postId: string = values.postId;
      const kind: TimeBlockKind | 'BOOKING' = values.kind;
      const startTime: Dayjs = values.startTime;
      const endTime: Dayjs = values.endTime;
      const serviceId: string | undefined = values.serviceId;
      const userId: string | undefined = values.userId;
      const carId: string | undefined = values.carId;

      const startAt = dayjs(dayStr)
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(0)
        .millisecond(0);
      const endAt = dayjs(dayStr)
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(0)
        .millisecond(0);

      setIsSaving(true);
      if (kind === 'BOOKING') {
        await apiService.createAdminBookingByTime({
          userId: userId!,
          carId: carId!,
          serviceId: serviceId!,
          postId,
          startAt: startAt.toISOString(),
          notes: values.note ?? null,
        });
        message.success('Создана запись');
      } else {
        await apiService.createTimeBlock({
          postId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          kind: kind as TimeBlockKind,
          serviceId: serviceId ?? null,
          carBrand: values.carBrand ?? null,
          carModel: values.carModel ?? null,
          note: values.note ?? null,
        });
        message.success('Время занято');
      }
      onCreated();
      onClose();
    } catch (error: unknown) {
      const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
      message.error(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title="Занять слот"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        <Button key="ok" type="primary" loading={isSaving} onClick={submit}>
          Занять
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
        <Form.Item name="postId" label="Пост" rules={[{ required: true, message: 'Выберите пост' }]}>
          <Select
            placeholder={activePosts.length ? 'Выберите пост' : 'Нет активных постов на этот день'}
            options={activePosts.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>

        <Form.Item name="kind" label="Тип">
          <Radio.Group
            options={[
              { value: 'BOOKING', label: 'Запись клиента' },
              { value: 'MANUAL_BOOKING', label: 'Ручная запись' },
              { value: 'BLOCK', label: 'Блокировка' },
            ]}
          />
        </Form.Item>

        {currentKind !== 'BLOCK' && (
          <Form.Item
            name="serviceId"
            label="Услуга"
            rules={[{ required: true, message: 'Выберите услугу' }]}
          >
            <Select allowClear placeholder="Выберите услугу" options={serviceOptions} />
          </Form.Item>
        )}

        {currentKind === 'BOOKING' && (
          <>
            <Form.Item
              name="userId"
              label="Клиент"
              rules={[{ required: true, message: 'Выберите клиента' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Выберите клиента"
                options={userOptions}
                onChange={() => form.setFieldValue('carId', undefined)}
              />
            </Form.Item>
            <Form.Item
              name="carId"
              label="Авто"
              rules={[{ required: true, message: 'Выберите авто' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={selectedUserId ? 'Выберите авто' : 'Сначала выберите клиента'}
                options={carOptions}
                disabled={!selectedUserId}
              />
            </Form.Item>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="startTime" label="Начало" rules={[{ required: true, message: 'Укажите время' }]}>
          <TimePicker
            format="HH:mm"
            minuteStep={30}
            allowClear={false}
            showNow={false}
            needConfirm={false}
          />
          </Form.Item>
          <Form.Item name="endTime" label="Конец" rules={[{ required: true, message: 'Укажите время' }]}>
          <TimePicker
            format="HH:mm"
            minuteStep={30}
            allowClear={false}
            showNow={false}
            needConfirm={false}
          />
          </Form.Item>
        </div>

        {currentKind === 'MANUAL_BOOKING' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="carBrand" label="Марка (для ручной записи)">
              <Input placeholder="Например: Toyota" />
            </Form.Item>
            <Form.Item name="carModel" label="Модель (для ручной записи)">
              <Input placeholder="Например: Camry" />
            </Form.Item>
          </div>
        )}

        <Form.Item name="note" label="Комментарий">
          <Input.TextArea rows={3} placeholder="Например: клиент без Telegram, записан по телефону" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


