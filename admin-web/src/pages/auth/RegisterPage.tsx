import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';
import logger from '../../utils/logger';
import { getAxiosErrorText } from '../../utils/axiosUtils';
import { useScreenSize } from '../../hooks/useBreakpoint';
import styles from './RegisterPage.module.scss';

const { Title, Text } = Typography;

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();

  const handleSubmit = async (values: { email: string; password: string; firstName: string; lastName?: string }) => {
    setLoading(true);
    try {
      await apiService.registerAdminRequest(values);
      message.success('Заявка отправлена. После подтверждения main-администратором вы сможете войти.');
      navigate('/login');
    } catch (err: unknown) {
      logger.error('Ошибка регистрации администратора', { error: err });
      const errorText = getAxiosErrorText(err);
      message.error(errorText || 'Ошибка регистрации. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <Card className={styles.registerCard} styles={{ body: { padding: isMobile ? 20 : 24 } }}>
        <div className={styles.titleContainer}>
          <Title level={isMobile ? 3 : 2}>🚗 Регистрация администратора</Title>
        </div>

        <div className={styles.hint}>
          <Text type="secondary">
            После отправки заявки доступ появится только после подтверждения администратором с ролью <b>main</b>.
          </Text>
        </div>

        <Form form={form} name="register" onFinish={handleSubmit} layout="vertical" size={isMobile ? 'middle' : 'large'}>
          <Form.Item
            name="firstName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Имя" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Фамилия"
            rules={[{ required: true, message: 'Введите фамилию' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Фамилия" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Пароль должен быть не менее 6 символов' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} className={styles.button}>
              Отправить заявку
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.linksRow}>
          <Link to="/login">Уже есть доступ? Войти</Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;


