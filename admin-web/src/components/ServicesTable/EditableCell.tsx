import { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
import { IServicePrice } from '../../types/service';

interface IEditableCellProps {
  value: IServicePrice;
  onChange: (value: IServicePrice) => void;
  editing: boolean;
}

export function EditableCell({ value, onChange, editing }: IEditableCellProps) {
  const [localValue, setLocalValue] = useState<number | null>(value.price);

  useEffect(() => {
    setLocalValue(value.price);
  }, [value]);

  const handleChange = (newValue: number | null) => {
    setLocalValue(newValue);
    onChange({
      ...value,
      price: newValue,
    });
  };

  const handleBlur = () => {
    onChange({
      ...value,
      price: localValue,
    });
  };

  if (!editing) {
    const displayValue = value.price;
    return (
      <div style={{ padding: '8px', minHeight: '32px' }}>
        {displayValue !== null && displayValue !== undefined
          ? `${displayValue}₽`
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
      precision={2}
      style={{ width: '100%' }}
      placeholder="Цена"
      suffix="₽"
    />
  );
}

