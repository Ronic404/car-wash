import { useQuery } from '@tanstack/react-query';
import { Typography, Spin, Empty } from 'antd';
import apiService from '../services/apiService';
import { ServicesTable } from '../components/ServicesTable/ServicesTable';
import { IServicesTable } from '../types/service';
import styles from './ServicesPage.module.scss';

const { Title } = Typography;

function ServicesPage() {
  const { data: tableData, isLoading } = useQuery<IServicesTable>({
    queryKey: ['services-table'],
    queryFn: () => apiService.getServicesTable(),
  });

  return (
    <div>
      <Title level={2}>Управление услугами</Title>
      {isLoading ? (
        <Spin size="large" className={styles.spin} />
      ) : tableData ? (
        <ServicesTable data={tableData} />
      ) : (
        <Empty description="Данные не найдены" className={styles.empty} />
      )}
    </div>
  );
}

export default ServicesPage;
