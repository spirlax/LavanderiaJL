// src/components/ui/ChipSelector.tsx
'use client';

import React from 'react';
import styles from './ChipSelector.module.css';

interface Option {
  id: string;
  name: string;
  price?: number;
  icon?: string;
}

interface ChipSelectorProps {
  options: Option[];
  selectedId: string | null;
  onChange: (id: string) => void;
  columns?: number;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  options,
  selectedId,
  onChange,
  columns = 2
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 'var(--spacing-sm)'
  };

  return (
    <div style={gridStyle}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        const chipClass = [
          styles.chip,
          isSelected ? styles.selected : '',
          'transition-all',
          'active-press'
        ].filter(Boolean).join(' ');

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={chipClass}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <div className={styles.meta}>
              <span className={styles.name}>{option.name}</span>
              {option.price !== undefined && (
                <span className={styles.price}>S/ {option.price.toFixed(2)}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
