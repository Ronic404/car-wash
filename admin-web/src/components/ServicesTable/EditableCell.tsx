import { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
import { IServicePrice } from '../../types/service';

interface IEditableCellProps {
  value: IServicePrice;
  onChange: (value: IServicePrice) => void;
  editing: boolean;
  type: 'price' | 'duration';
}

export function EditableCell({ value, onChange, editing, type }: IEditableCellProps) {
  const [localValue, setLocalValue] = useState<number | null>(
    type === 'price' ? value.price : value.duration
  );

  useEffect(() => {
    setLocalValue(type === 'price' ? value.price : value.duration);
  }, [value, type]);

  const handleChange = (newValue: number | null) => {
    setLocalValue(newValue);
    onChange({
      ...value,
      [type]: newValue,
    });
  };

  const handleBlur = () => {
    onChange({
      ...value,
      [type]: localValue,
    });
  };

  if (!editing) {
    const displayValue = type === 'price' ? value.price : value.duration;
    return (
      <div style={{ padding: '8px', minHeight: '32px' }}>
        {displayValue !== null && displayValue !== undefined
          ? type === 'price'
            ? `${displayValue}₽`
            : `${displayValue} мин.`
          : '-'}
      </div>
    );
  }

  return (
    <InputNumber
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={0}
      precision={type === 'price' ? 2 : 0}
      style={{ width: '100%' }}
      placeholder={type === 'price' ? 'Цена' : 'Длительность'}
      suffix={type === 'price' ? '₽' : 'мин.'}
    />
  );
}

