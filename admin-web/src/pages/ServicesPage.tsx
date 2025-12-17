import { useQuery } from '@tanstack/react-query';
import apiService from '../services/apiService';
import './ServicesPage.scss';

function ServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiService.getServices(),
  });

  return (
    <div className="services-page">
      <h1>Управление услугами</h1>
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="services-page__list">
          {services && services.length > 0 ? (
            services.map((service: any) => (
              <div key={service.id} className="services-page__item">
                <div>
                  <strong>{service.name}</strong>
                  {service.description && <p>{service.description}</p>}
                </div>
                <div>
                  <div>Цена: {service.price}₽</div>
                  <div>Длительность: {service.duration} мин.</div>
                  <div>{service.isActive ? '✅ Активна' : '❌ Неактивна'}</div>
                </div>
              </div>
            ))
          ) : (
            <div>Услуг не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ServicesPage;

