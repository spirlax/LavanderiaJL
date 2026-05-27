// src/components/ui/Counter.tsx
'use client';

import React from 'react';
import styles from './Counter.module.css';

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.5,
  unit = 'kg'
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(newValue);
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${styles.btn} active-press transition-all`}
      >
        −
      </button>
      
      <div className={styles.valueDisplay}>
        <span className={styles.number}>{value.toFixed(1)}</span>
        <span className={styles.unit}>{unit}</span>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${styles.btn} active-press transition-all`}
      >
        +
      </button>
    </div>
  );
};
