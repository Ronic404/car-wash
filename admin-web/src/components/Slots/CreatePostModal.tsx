import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, List, Modal, Popconfirm, Select, Switch, Typography, message } from 'antd';
import type { IService } from '../../types/service';
import type { IWashingPost } from '../../types/washingPost';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';

interface ICreatePostModalProps {
  open: boolean;
  posts: IWashingPost[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function CreatePostModal(props: ICreatePostModalProps) {
  const { open, posts, onClose, onUpdated } = props;
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<IService[]>([]);

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      await apiService.createWashingPost({
        name: values.name,
        isActive: values.isActive,
        serviceIds: values.serviceIds,
      });
      message.success('Пост создан');
      form.resetFields();
      onUpdated();
    } catch (error: unknown) {
      const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
      message.error(text);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (post: IWashingPost, isActive: boolean) => {
    try {
      await apiService.updateWashingPost(post.id, { isActive });
      onUpdated();
    } catch (error: unknown) {
      const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
      message.error(text);
    }
  };

  const updateName = async (post: IWashingPost, name: string) => {
    try {
      if (!name.trim()) return;
      await apiService.updateWashingPost(post.id, { name: name.trim() });
      onUpdated();
    } catch (error: unknown) {
      const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
      message.error(text);
    }
  };

  const deletePost = async (post: IWashingPost) => {
    try {
      await apiService.deleteWashingPost(post.id);
      message.success('Пост удалён');
      onUpdated();
    } catch (error: unknown) {
      const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
      message.error(text);
    }
  };

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => a.order - b.order),
    [posts]
  );

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await apiService.getServices();
        setServices(list);
      } catch (error: unknown) {
        const text = getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка');
        message.error(text);
      }
    })();
  }, [open]);

  return (
    <Modal
      title="Моечные посты"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
        <Button key="create" type="primary" loading={isSaving} onClick={onCreate}>
          Создать пост
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isActive: true, serviceIds: [] }}
      >
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, message: 'Введите название поста' }]}
        >
          <Input placeholder="Например: Пост 1" />
        </Form.Item>

        <Form.Item label="Активен" name="isActive" valuePropName="checked">
          <Switch />
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
            options={services
              .filter((s) => s.isActive)
              .sort((a, b) => a.order - b.order)
              .map((s) => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">Существующие посты</Typography.Text>
        <List
          dataSource={sortedPosts}
          locale={{ emptyText: 'Постов пока нет' }}
          renderItem={(post) => (
            <List.Item
              actions={[
                <Switch
                  key="active"
                  checked={post.isActive}
                  onChange={(checked) => toggleActive(post, checked)}
                />,
                <Popconfirm
                  key="delete"
                  title="Удалить пост?"
                  description="Удаление возможно только если у поста нет слотов. Иначе лучше деактивировать."
                  onConfirm={() => deletePost(post)}
                  okText="Удалить"
                  cancelText="Отмена"
                >
                  <Button danger>Удалить</Button>
                </Popconfirm>,
              ]}
            >
              <Input
                defaultValue={post.name}
                onBlur={(e) => updateName(post, e.target.value)}
                style={{ maxWidth: 320 }}
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}


