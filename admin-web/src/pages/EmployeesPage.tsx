import { Typography, Empty } from 'antd';
import styles from './EmployeesPage.module.scss';

const { Title } = Typography;

function EmployeesPage() {
  return (
    <div>
      <Title level={2}>Управление сотрудниками</Title>
      <Empty description="Функционал в разработке" className={styles.empty} />
    </div>
  );
}

export default EmployeesPage;
