// src/components/orders/SearchInputClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/app/(empleada)/buscar/buscar.module.css';

export const SearchInputClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const cleanQuery = query.trim();
      if (cleanQuery.length >= 2) {
        router.push(`/buscar?q=${encodeURIComponent(cleanQuery)}`);
      } else if (cleanQuery.length === 0) {
        router.push('/buscar');
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, router]);

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Escribe JL-0003, ticket talonario o cliente..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
        autoFocus
      />
    </div>
  );
};
