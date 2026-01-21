import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, List, Space, Typography, Tag, Popconfirm, message, Spin, Empty } from 'antd';
import apiService from '../../services/apiService';
import { getAxiosErrorText } from '../../utils/axiosUtils';
import { useScreenSize } from '../../hooks/useBreakpoint';
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
  const { isMobile } = useScreenSize();
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
    () =>
      (admins ?? [])
        .filter((a) => a.isActive)
        .slice()
        .sort((a, b) => {
          if (a.role !== b.role) return a.role === 'MAIN' ? -1 : 1;
          return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
        }),
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

  const setRole = async (id: string, role: IAdminUser['role']) => {
    try {
      await apiService.setAdminRole(id, role);
      message.success('Роль обновлена');
      await refetchAdmins();
    } catch (error: unknown) {
      message.error(getAxiosErrorText(error) ?? (error instanceof Error ? error.message : 'Ошибка'));
    }
  };

  const isLoading = isRequestsLoading || isAdminsLoading;

  const roleTag = (role: IAdminUser['role']) => (
    <Tag color={role === 'MAIN' ? 'geekblue' : 'default'}>{role === 'MAIN' ? 'main' : 'regular'}</Tag>
  );

  return (
    <div className={styles.page}>
      <Title level={2}>Сотрудники</Title>

      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title="Администраторы" size="small">
            {allAdmins.length ? (
              <List
                dataSource={allAdmins}
                renderItem={(a) => (
                  <List.Item
                    actions={[
                      a.role === 'MAIN' ? (
                        <Popconfirm
                          key="make-regular"
                          title="Сделать regular?"
                          description="У main не будет доступа к странице «Сотрудники»."
                          okText="Сделать regular"
                          cancelText="Отмена"
                          onConfirm={() => setRole(a.id, 'REGULAR')}
                        >
                          <Button block={isMobile}>Сделать regular</Button>
                        </Popconfirm>
                      ) : (
                        <Popconfirm
                          key="make-main"
                          title="Сделать main?"
                          description="Main получает доступ к странице «Сотрудники»."
                          okText="Сделать main"
                          cancelText="Отмена"
                          onConfirm={() => setRole(a.id, 'MAIN')}
                        >
                          <Button type="primary" block={isMobile}>
                            Сделать main
                          </Button>
                        </Popconfirm>
                      ),
                      <Popconfirm
                        key="delete"
                        title="Удалить администратора?"
                        description="Нельзя удалить последнего main-администратора."
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => removeAdmin(a.id)}
                      >
                        <Button danger block={isMobile}>
                          Удалить
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
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
              <Empty description="Администраторов нет" />
            )}
          </Card>

          <Card title="Заявки на регистрацию" size="small">
            {pendingRequests.length ? (
              <List
                dataSource={pendingRequests}
                renderItem={(a) => (
                  <List.Item
                    actions={[
                      <Button key="approve" type="primary" onClick={() => approve(a.id)} block={isMobile}>
                        Подтвердить
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Удалить заявку?"
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => removeAdmin(a.id)}
                      >
                        <Button danger block={isMobile}>
                          Удалить
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
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
        </Space>
      )}
    </div>
  );
}

export default EmployeesPage;


