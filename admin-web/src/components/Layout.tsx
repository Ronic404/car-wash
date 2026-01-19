import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, MenuProps, Avatar, Dropdown, Typography, Button, Tooltip } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useSSE } from '../hooks/useSSE';
import { useScreenSize } from '../hooks/useBreakpoint';
import styles from './Layout.module.scss';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

function Layout() {
  const { admin, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const [collapsed, setCollapsed] = useState(false);
  const [isBreakpointBroken, setIsBreakpointBroken] = useState(false);
  
  // Подключаем SSE для real-time обновлений
  useSSE();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Дашборд</Link>,
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: <Link to="/bookings">Записи</Link>,
    },
    {
      key: '/slots',
      icon: <ClockCircleOutlined />,
      label: <Link to="/slots">Слоты</Link>,
    },
    {
      key: '/services',
      icon: <ShoppingOutlined />,
      label: <Link to="/services">Услуги</Link>,
    },
    ...(admin?.role === 'MAIN'
      ? [
          {
            key: '/employees',
            icon: <TeamOutlined />,
            label: <Link to="/employees">Сотрудники</Link>,
          } as const,
        ]
      : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user',
      label: (
        <div className={styles.userMenuContainer}>
          <Text strong>{admin?.firstName} {admin?.lastName}</Text>
          <br />
          <Text type="secondary" className={styles.userMenuEmail}>{admin?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const selectedKeys = [location.pathname];
  if (location.pathname.startsWith('/bookings/')) {
    selectedKeys[0] = '/bookings';
  }

  return (
    <AntLayout className={styles.layout}>
      <Sider
        breakpoint="lg"
        collapsedWidth={collapsed ? 0 : 80}
        width={200}
        collapsed={collapsed || isBreakpointBroken}
        onBreakpoint={(broken) => {
          setIsBreakpointBroken(broken);
        }}
        trigger={null}
        className={styles.sider}
      >
        <div className={`${styles.logoContainer} ${(collapsed || isBreakpointBroken) ? styles.collapsed : ''}`}>
          {(collapsed || isBreakpointBroken) ? '🚗' : '🚗 Автомойка'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
        />
      </Sider>
      <AntLayout 
        className={styles.mainLayout}
        style={{ 
          marginLeft: collapsed ? 0 : (isBreakpointBroken ? 80 : 200),
          transition: 'margin-left 0.2s'
        }}
      >
        <Header className={styles.header}>
          <Tooltip title={collapsed ? 'Показать меню' : 'Скрыть меню'}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.menuButton}
            />
          </Tooltip>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className={styles.userDropdown}>
              <Avatar icon={<UserOutlined />} />
              {!isMobile && (
                <Text>{admin?.firstName} {admin?.lastName}</Text>
              )}
            </div>
          </Dropdown>
        </Header>
        <Content className={`${styles.content} ${isMobile ? styles.mobile : ''}`}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
