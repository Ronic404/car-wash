import { useState, useCallback, useMemo } from 'react';
import {
  Button,
  Input,
  Modal,
  message,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/apiService';
import { IServicesTable, IService, ICarCategory, IServicePrice } from '../../types/service';
import { EditableCell } from './EditableCell';
import styles from './ServicesTable.module.scss';
import { debounce } from 'lodash';

const { Text } = Typography;

interface IServicesTableProps {
  data: IServicesTable;
}

interface ISortableRowProps {
  service: IService;
  serviceIndex: number;
  categories: ICarCategory[];
  prices: IServicePrice[];
  editing: boolean;
  onPriceChange: (serviceIndex: number, categoryIndex: number, price: IServicePrice) => void;
  onDelete: (serviceId: string) => void;
}

function SortableRow({
  service,
  serviceIndex,
  categories,
  prices,
  editing,
  onPriceChange,
  onDelete,
}: ISortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `service-${service.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={styles.tableRow}>
      <td className={styles.serviceNameCell}>
        <Space>
          <span {...attributes} {...listeners} className={styles.dragHandle}>
            <DragOutlined />
          </span>
          <Text>{service.name}</Text>
          {editing && (
            <Popconfirm
              title="Удалить услугу?"
              onConfirm={() => onDelete(service.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                className={styles.deleteButton}
              />
            </Popconfirm>
          )}
        </Space>
      </td>
      {categories.map((category, categoryIndex) => (
        <td key={category.id} colSpan={2}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div className={styles.priceCell} style={{ flex: 1 }}>
              <EditableCell
                value={prices[categoryIndex]}
                onChange={(value) => onPriceChange(serviceIndex, categoryIndex, value)}
                editing={editing}
                type="price"
              />
            </div>
            <div className={styles.durationCell} style={{ flex: 1 }}>
              <EditableCell
                value={prices[categoryIndex]}
                onChange={(value) => onPriceChange(serviceIndex, categoryIndex, value)}
                editing={editing}
                type="duration"
              />
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
}

interface ISortableHeaderProps {
  category: ICarCategory;
  editing: boolean;
  onDelete: (categoryId: string) => void;
}

function SortableHeader({ category, editing, onDelete }: ISortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `category-${category.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`${styles.categoryHeader} ${styles.tableHeader}`}
      colSpan={2}
    >
      <Space>
        {editing && (
          <span {...attributes} {...listeners} className={styles.dragHandle}>
            <DragOutlined />
          </span>
        )}
        <Text strong>{category.name}</Text>
        {editing && (
          <Popconfirm
            title="Удалить категорию?"
            onConfirm={() => onDelete(category.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className={styles.deleteButton}
            />
          </Popconfirm>
        )}
      </Space>
    </th>
  );
}

export function ServicesTable({ data }: IServicesTableProps) {
  const [editing, setEditing] = useState(false);
  const [localData, setLocalData] = useState<IServicesTable>(data);
  const [newServiceName, setNewServiceName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Обновляем локальные данные при изменении пропсов
  useMemo(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  const bulkUpdateMutation = useMutation({
    mutationFn: (prices: IServicePrice[]) => {
      const validPrices = prices
        .filter(
          (p) => p.price !== null && p.duration !== null
        )
        .map((p) => ({
          serviceId: p.serviceId,
          categoryId: p.categoryId,
          price: p.price as number,
          duration: p.duration as number,
        }));
      return apiService.bulkUpdateServicePrices(validPrices);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-table'] });
      message.success('Изменения сохранены');
    },
    onError: () => {
      message.error('Ошибка при сохранении изменений');
    },
  });

  const debouncedSave = useCallback(
    debounce((prices: IServicePrice[]) => {
      bulkUpdateMutation.mutate(prices);
    }, 1000),
    []
  );

  const handlePriceChange = useCallback(
    (serviceIndex: number, categoryIndex: number, price: IServicePrice) => {
      const newPrices = [...localData.prices];
      newPrices[serviceIndex] = [...newPrices[serviceIndex]];
      newPrices[serviceIndex][categoryIndex] = price;
      setLocalData({ ...localData, prices: newPrices });

      // Сохраняем с задержкой
      const allPrices: IServicePrice[] = [];
      newPrices.forEach((row) => {
        row.forEach((cell) => {
          if (cell.price !== null || cell.duration !== null) {
            allPrices.push(cell);
          }
        });
      });
      debouncedSave(allPrices);
    },
    [localData, debouncedSave]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Определяем тип перетаскивания по префиксу
    if (activeId.startsWith('service-') && overId.startsWith('service-')) {
      // Перетаскивание услуг (строк)
      const activeServiceId = activeId.replace('service-', '');
      const overServiceId = overId.replace('service-', '');

      const oldIndex = localData.services.findIndex((s) => s.id === activeServiceId);
      const newIndex = localData.services.findIndex((s) => s.id === overServiceId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newServices = arrayMove(localData.services, oldIndex, newIndex);
      const newPrices = arrayMove(localData.prices, oldIndex, newIndex);

      // Обновляем порядок
      const updatedServices = newServices.map((s, index) => ({
        ...s,
        order: index,
      }));

      setLocalData({
        ...localData,
        services: updatedServices,
        prices: newPrices,
      });

      // Сохраняем порядок
      apiService
        .updateServicesOrder(updatedServices.map((s) => ({ id: s.id, order: s.order })))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['services-table'] });
        })
        .catch(() => {
          message.error('Ошибка при сохранении порядка услуг');
        });
    } else if (activeId.startsWith('category-') && overId.startsWith('category-')) {
      // Перетаскивание категорий (столбцов)
      const activeCategoryId = activeId.replace('category-', '');
      const overCategoryId = overId.replace('category-', '');

      const oldIndex = localData.categories.findIndex((c) => c.id === activeCategoryId);
      const newIndex = localData.categories.findIndex((c) => c.id === overCategoryId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newCategories = arrayMove(localData.categories, oldIndex, newIndex);

      // Переставляем столбцы в матрице цен
      const newPrices = localData.prices.map((row) =>
        arrayMove(row, oldIndex, newIndex)
      );

      // Обновляем порядок
      const updatedCategories = newCategories.map((c, index) => ({
        ...c,
        order: index,
      }));

      setLocalData({
        ...localData,
        categories: updatedCategories,
        prices: newPrices,
      });

      // Сохраняем порядок
      apiService
        .updateCarCategoriesOrder(
          updatedCategories.map((c) => ({ id: c.id, order: c.order }))
        )
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['services-table'] });
        })
        .catch(() => {
          message.error('Ошибка при сохранении порядка категорий');
        });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await apiService.deleteService(serviceId);
      queryClient.invalidateQueries({ queryKey: ['services-table'] });
      message.success('Услуга удалена');
    } catch (error) {
      message.error('Ошибка при удалении услуги');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await apiService.deleteCarCategory(categoryId);
      queryClient.invalidateQueries({ queryKey: ['services-table'] });
      message.success('Категория удалена');
    } catch (error) {
      message.error('Ошибка при удалении категории');
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      message.warning('Введите название услуги');
      return;
    }

    try {
      await apiService.createService({ name: newServiceName.trim() });
      queryClient.invalidateQueries({ queryKey: ['services-table'] });
      setNewServiceName('');
      setIsAddingService(false);
      message.success('Услуга добавлена');
    } catch (error) {
      message.error('Ошибка при добавлении услуги');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('Введите название категории');
      return;
    }

    try {
      await apiService.createCarCategory({ name: newCategoryName.trim() });
      queryClient.invalidateQueries({ queryKey: ['services-table'] });
      setNewCategoryName('');
      setIsAddingCategory(false);
      message.success('Категория добавлена');
    } catch (error) {
      message.error('Ошибка при добавлении категории');
    }
  };

  const serviceIds = localData.services.map((s) => `service-${s.id}`);
  const categoryIds = localData.categories.map((c) => `category-${c.id}`);

  return (
    <div>
      <div className={styles.controls}>
        {editing ? (
          <>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => setEditing(false)}
            >
              Завершить редактирование
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsAddingService(true)}
            >
              Добавить услугу
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsAddingCategory(true)}
            >
              Добавить категорию
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
            className={styles.editButton}
          >
            Редактировать
          </Button>
        )}
      </div>

      <Modal
        title="Добавить услугу"
        open={isAddingService}
        onOk={handleAddService}
        onCancel={() => {
          setIsAddingService(false);
          setNewServiceName('');
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название услуги"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          onPressEnter={handleAddService}
        />
      </Modal>

      <Modal
        title="Добавить категорию"
        open={isAddingCategory}
        onOk={handleAddCategory}
        onCancel={() => {
          setIsAddingCategory(false);
          setNewCategoryName('');
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название категории"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onPressEnter={handleAddCategory}
        />
      </Modal>

      <div className={styles.tableContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.serviceNameCell}>Услуга</th>
                {editing ? (
                  <SortableContext
                    items={categoryIds}
                    strategy={horizontalListSortingStrategy}
                  >
                    {localData.categories.map((category) => (
                      <SortableHeader
                        key={category.id}
                        category={category}
                        editing={editing}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  localData.categories.map((category) => (
                    <th key={category.id} colSpan={2} className={styles.categoryHeader}>
                      <Text strong>{category.name}</Text>
                    </th>
                  ))
                )}
              </tr>
              <tr>
                <th></th>
                {localData.categories.map((category) => (
                  <th key={category.id} colSpan={2} className={styles.categoryHeader}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div className={styles.priceCell} style={{ flex: 1 }}>
                        Цена
                      </div>
                      <div className={styles.durationCell} style={{ flex: 1 }}>
                        Длительность
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editing ? (
                <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
                  {localData.services.map((service, serviceIndex) => (
                    <SortableRow
                      key={service.id}
                      service={service}
                      serviceIndex={serviceIndex}
                      categories={localData.categories}
                      prices={localData.prices[serviceIndex] || []}
                      editing={editing}
                      onPriceChange={handlePriceChange}
                      onDelete={handleDeleteService}
                    />
                  ))}
                </SortableContext>
              ) : (
                localData.services.map((service, serviceIndex) => (
                  <tr key={service.id}>
                    <td className={styles.serviceNameCell}>
                      <Text>{service.name}</Text>
                    </td>
                    {localData.categories.map((category, categoryIndex) => (
                      <td key={category.id} colSpan={2}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div className={styles.priceCell} style={{ flex: 1 }}>
                            <EditableCell
                              value={localData.prices[serviceIndex]?.[categoryIndex] || {
                                id: null,
                                serviceId: service.id,
                                categoryId: category.id,
                                price: null,
                                duration: null,
                              }}
                              onChange={() => {}}
                              editing={false}
                              type="price"
                            />
                          </div>
                          <div className={styles.durationCell} style={{ flex: 1 }}>
                            <EditableCell
                              value={localData.prices[serviceIndex]?.[categoryIndex] || {
                                id: null,
                                serviceId: service.id,
                                categoryId: category.id,
                                price: null,
                                duration: null,
                              }}
                              onChange={() => {}}
                              editing={false}
                              type="duration"
                            />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}

