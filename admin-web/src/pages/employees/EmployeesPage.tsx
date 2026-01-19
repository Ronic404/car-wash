import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, List, Space, Typography, Tag, Popconfirm, message, Spin, Empty } from 'antd';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';
import styles from './EmployeesPage.module.scss';

const { Title } = Typography;

interface IAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  isActive: boolean;
  role: 'MAIN' | 'REGULAR';
  createdAt?: string;
  lastLogin?: string | null;
}

function EmployeesPage() {
  const {
    data: requests,
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = useQuery<IAdminUser[]>({
    queryKey: ['admin-registration-requests'],
    queryFn: () => apiService.getAdminRegistrationRequests(),
  });

  const {
    data: admins,
    isLoading: isAdminsLoading,
    refetch: refetchAdmins,
  } = useQuery<IAdminUser[]>({
    queryKey: ['admins'],
    queryFn: () => apiService.getAdmins(),
  });

  const pendingRequests = useMemo(
    () => (requests ?? []).filter((a) => !a.isActive).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    [requests]
  );

  const allAdmins = useMemo(
    () => (admins ?? []).slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    [admins]
  );

  const approve = async (id: string) => {
    try {
      await apiService.approveAdmin(id);
      message.success('Заявка подтверждена');
      await Promise.all([refetchRequests(), refetchAdmins()]);
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    }
  };

  const removeAdmin = async (id: string) => {
    try {
      await apiService.deleteAdmin(id);
      message.success('Администратор удалён');
      await Promise.all([refetchRequests(), refetchAdmins()]);
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    }
  };

  const isLoading = isRequestsLoading || isAdminsLoading;

  const roleTag = (role: IAdminUser['role']) => (
    <Tag color={role === 'MAIN' ? 'geekblue' : 'default'}>{role === 'MAIN' ? 'main' : 'regular'}</Tag>
  );

  return (
    <div>
      <Title level={2}>Сотрудники</Title>

      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title="Заявки на регистрацию" size="small">
            {pendingRequests.length ? (
              <List
                dataSource={pendingRequests}
                renderItem={(a) => (
                  <List.Item
                    actions={[
                      <Button key="approve" type="primary" onClick={() => approve(a.id)}>
                        Подтвердить
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Удалить заявку?"
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => removeAdmin(a.id)}
                      >
                        <Button danger>Удалить</Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Typography.Text strong>
                            {a.firstName} {a.lastName ?? ''}
                          </Typography.Text>
                          {roleTag(a.role)}
                        </Space>
                      }
                      description={<Typography.Text type="secondary">{a.email}</Typography.Text>}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Заявок нет" />
            )}
          </Card>

          <Card title="Администраторы" size="small">
            {allAdmins.length ? (
              <List
                dataSource={allAdmins}
                renderItem={(a) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Удалить администратора?"
                        description="Нельзя удалить последнего main-администратора."
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => removeAdmin(a.id)}
                      >
                        <Button danger>Удалить</Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Typography.Text strong>
                            {a.firstName} {a.lastName ?? ''}
                          </Typography.Text>
                          {roleTag(a.role)}
                          {!a.isActive && <Tag>ожидает</Tag>}
                        </Space>
                      }
                      description={<Typography.Text type="secondary">{a.email}</Typography.Text>}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Администраторов нет" />
            )}
          </Card>
        </Space>
      )}
    </div>
  );
}

export default EmployeesPage;


