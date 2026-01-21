import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, message } from 'antd';
import type { IService } from '../../types/service';
import type { IWashingPost } from '../../types/washingPost';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';

interface IEditPostModalProps {
  open: boolean;
  post: IWashingPost;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPostModal(props: IEditPostModalProps) {
  const { open, post, onClose, onUpdated } = props;
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<IService[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await apiService.getServices();
        setServices(list);
      } catch (error: unknown) {
        message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: post.name,
      serviceIds: post.services?.map((x) => x.serviceId) ?? [],
    });
  }, [open, post, form]);

  const serviceOptions = useMemo(
    () =>
      services
        .filter((s) => s.isActive)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ value: s.id, label: s.name })),
    [services]
  );

  const save = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      await apiService.updateWashingPost(post.id, {
        name: (values.name as string).trim(),
        serviceIds: values.serviceIds as string[],
      });
      message.success('Пост обновлён');
      onUpdated();
      onClose();
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async () => {
    try {
      setIsSaving(true);
      await apiService.deleteWashingPost(post.id);
      message.success('Пост удалён');
      onUpdated();
      onClose();
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title="Редактирование поста"
      open={open}
      onCancel={onClose}
      footer={[
        <Popconfirm
          key="delete"
          title="Удалить пост?"
          description="Удаление возможно только если у поста нет записей/блокировок."
          okText="Удалить"
          cancelText="Отмена"
          onConfirm={deletePost}
        >
          <Button danger loading={isSaving}>
            Удалить
          </Button>
        </Popconfirm>,
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
        <Button key="save" type="primary" loading={isSaving} onClick={save}>
          Сохранить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ serviceIds: [] }}>
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, message: 'Введите название поста' }]}
        >
          <Input placeholder="Название поста" />
        </Form.Item>

        <Form.Item
          label="Активные услуги на посту"
          name="serviceIds"
          rules={[{ required: true, message: 'Выберите хотя бы одну услугу' }]}
        >
          <Select
            mode="multiple"
            placeholder="Выберите услуги"
            optionFilterProp="label"
            options={serviceOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}


