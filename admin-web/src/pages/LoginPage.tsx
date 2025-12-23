import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useScreenSize } from '../hooks/useBreakpoint';
import logger from '../utils/logger';
import styles from './LoginPage.module.scss';

const { Title } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { isMobile } = useScreenSize();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      await login(values.email, values.password);
      message.success('Успешный вход!');
      navigate('/dashboard');
    } catch (err: unknown) {
      logger.error('Ошибка входа', { error: err });
      const errorText = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      message.error(errorText || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card
        className={styles.loginCard}
        bodyStyle={{ padding: isMobile ? 20 : 24 }}
      >
        <div className={styles.titleContainer}>
          <Title level={isMobile ? 3 : 2}>🚗 Панель администратора</Title>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size={isMobile ? 'middle' : 'large'}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Пароль должен быть не менее 6 символов' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className={styles.button}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
