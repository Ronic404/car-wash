import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, List, Modal, Select, Typography, message } from 'antd';
import EditPostModal from './EditPostModal';
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      await apiService.createWashingPost({
        name: values.name,
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

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => a.order - b.order),
    [posts]
  );

  const editingPost = useMemo(
    () => (editingPostId ? posts.find((p) => p.id === editingPostId) ?? null : null),
    [editingPostId, posts]
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
      <List
        dataSource={sortedPosts}
        locale={{ emptyText: 'Постов пока нет' }}
        renderItem={(post) => (
          <List.Item
            actions={[
              <Button key="edit" onClick={() => setEditingPostId(post.id)}>
                Редактировать
              </Button>,
            ]}
          >
            <Typography.Text strong>{post.name}</Typography.Text>
          </List.Item>
        )}
      />

      <Form
        style={{ marginTop: 16 }}
        form={form}
        layout="vertical"
        initialValues={{ serviceIds: [] }}
      >
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, message: 'Введите название поста' }]}
        >
          <Input placeholder="Например: Пост 1" />
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

      {editingPost &&
        <EditPostModal
          open={true}
          post={editingPost}
          onClose={() => setEditingPostId(null)}
          onUpdated={onUpdated}
        />
      }
    </Modal>
  );
}


