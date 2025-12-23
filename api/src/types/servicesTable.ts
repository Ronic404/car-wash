/**
 * Типы для таблицы услуг (матрица услуга-категория)
 */
export interface IServiceTablePriceCell {
  serviceId: string;
  categoryId: string;
  price: number | null;
  duration: number | null;
  id: string | null;
}

export type ServicesTablePricesMatrix = IServiceTablePriceCell[][];


