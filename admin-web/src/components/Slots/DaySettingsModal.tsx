import { useEffect, useMemo, useState } from 'react';
import { Button, Divider, Form, Modal, Switch, TimePicker, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { IWashingPost } from '../../types/washingPost';
import type { IWashingPostSchedule } from '../../types/washingPostSchedule';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';
import { useScreenSize } from '../../hooks/useBreakpoint';

function minutesToTime(minutes: number): Dayjs {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
}

function timeToMinutes(value: Dayjs): number {
  return value.hour() * 60 + value.minute();
}

const timePickerProps = {
  format: 'HH:mm',
  minuteStep: 5,
  allowClear: false,
  showNow: false,
  needConfirm: false,
} as const;

interface IDaySettingsModalProps {
  open: boolean;
  date: Date;
  posts: IWashingPost[];
  schedules: IWashingPostSchedule[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function DaySettingsModal(props: IDaySettingsModalProps) {
  const { open, date, posts, schedules, onClose, onUpdated } = props;
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const { isMobile } = useScreenSize();

  const dayStr = useMemo(() => dayjs(date).format('YYYY-MM-DD'), [date]);

  const schedulesByPost = useMemo(() => {
    const map = new Map<string, IWashingPostSchedule>();
    for (const s of schedules) map.set(s.postId, s);
    return map;
  }, [schedules]);

  const initialValues = useMemo(() => {
    return {
      rows: posts
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((p) => {
          const s = schedulesByPost.get(p.id);
          return {
            postId: p.id,
            name: p.name,
            isActive: s?.isActive ?? false,
            workFrom: minutesToTime(s?.workFromMinutes ?? p.workFromMinutes ?? 10 * 60),
            workTo: minutesToTime(s?.workToMinutes ?? p.workToMinutes ?? 20 * 60),
          };
        }),
    };
  }, [posts, schedulesByPost]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(initialValues);
  }, [open, form, initialValues]);

  const save = async () => {
    try {
      const values = await form.validateFields();
      const rows: Array<{
        postId: string;
        isActive: boolean;
        workFrom: Dayjs;
        workTo: Dayjs;
      }> = values.rows;

      setIsSaving(true);
      await Promise.all(
        rows.map((r) =>
          apiService.upsertWashingPostSchedule({
            postId: r.postId,
            date: dayStr,
            isActive: r.isActive,
            workFromMinutes: timeToMinutes(r.workFrom),
            workToMinutes: timeToMinutes(r.workTo),
          })
        )
      );
      message.success('Настройки дня сохранены');
      onUpdated();
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
      title={`Настройки дня: ${dayjs(date).format('DD.MM.YYYY')}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
        <Button key="save" type="primary" loading={isSaving} onClick={save}>
          Сохранить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Typography.Text type="secondary">
          Тут задаём часы работы постов и активность на выбранный день.
        </Typography.Text>

        <Divider />

        <Form.List name="rows">
          {(fields) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 50px 140px 140px',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Form.Item name={[field.name, 'postId']} hidden>
                      <input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'name']} hidden>
                      <input />
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const name = form.getFieldValue(['rows', field.name, 'name']) as string;
                        return <Typography.Text strong>{name}</Typography.Text>;
                      }}
                    </Form.Item>
                  </div>

                  {isMobile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Form.Item name={[field.name, 'isActive']} valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'workFrom']}
                        rules={[{ required: true, message: 'Укажите время' }]}
                        style={{ marginBottom: 0 }}
                        label="С"
                      >
                        <TimePicker
                          {...timePickerProps}
                          style={{ width: 120 }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'workTo']}
                        rules={[{ required: true, message: 'Укажите время' }]}
                        style={{ marginBottom: 0 }}
                        label="До"
                      >
                        <TimePicker
                          {...timePickerProps}
                          style={{ width: 120 }}
                        />
                      </Form.Item>
                    </div>
                  ) : (
                    <>
                      <Form.Item
                        name={[field.name, 'isActive']}
                        valuePropName="checked"
                        style={{ marginBottom: 0, justifySelf: 'start' }}
                      >
                        <Switch />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'workFrom']}
                        rules={[{ required: true, message: 'Укажите время' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <TimePicker
                          {...timePickerProps}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'workTo']}
                        rules={[{ required: true, message: 'Укажите время' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <TimePicker
                          {...timePickerProps}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}


