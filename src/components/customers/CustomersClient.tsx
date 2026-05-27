// src/components/customers/CustomersClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import styles from '@/app/(admin)/admin/clientes/clientes.module.css';

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  customer_type: 'registered' | 'name_only' | 'quick';
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export const CustomersClient: React.FC<CustomersClientProps> = ({
  initialCustomers
}) => {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    let result = customers;

    if (search.trim()) {
      const cleanSearch = search.toLowerCase();
      result = result.filter(c => 
        c.full_name.toLowerCase().includes(cleanSearch) || 
        (c.phone && c.phone.includes(cleanSearch))
      );
    }

    if (filterType !== 'all') {
      result = result.filter(c => c.customer_type === filterType);
    }

    setFilteredCustomers(result);
  }, [search, filterType, customers]);

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;

    const headers = ['Nombre Completo', 'Tipo de Cliente', 'Celular', 'Visitas Totales', 'Total Gastado (S/)', 'Ultima Visita', 'Fecha Registro\n'];
    const rows = filteredCustomers.map(c => [
      c.full_name,
      c.customer_type === 'registered' ? 'Registrado' : c.customer_type === 'name_only' ? 'Solo Nombre' : 'Al Paso',
      c.phone || 'Sin celular',
      c.total_orders,
      c.total_spent.toFixed(2),
      c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : 'Nunca',
      c.created_at
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers.join(',') + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_lavanderia_jl_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'registered': return <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>WhatsApp</span>;
      case 'name_only': return <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Solo Nombre</span>;
      case 'quick': return <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Al Paso</span>;
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      <Header
        title="Gestión de Clientes 👥"
        subtitle="Analiza la recurrencia, descargas de bases de datos y fidelidad de los clientes de J&L."
        badgeText={`Total: ${filteredCustomers.length}`}
        badgeVariant="primary"
      />

      <section className={`${styles.card} glassmorphism ${styles.filtersRow}`}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por nombre o número de celular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterActions}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className={styles.selectFilter}
          >
            <option value="all">Todos los Tipos</option>
            <option value="registered">Registrados (Con WhatsApp)</option>
            <option value="name_only">Solo Nombre</option>
            <option value="quick">Clientes Rápido (Al Paso)</option>
          </select>

          <button 
            type="button" 
            onClick={handleExportCSV}
            disabled={filteredCustomers.length === 0}
            className={`${styles.exportBtn} active-press transition-all`}
          >
            📥 Exportar base de datos a Excel (CSV)
          </button>
        </div>
      </section>

      <section className={`${styles.card} glassmorphism`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre del Cliente</th>
                <th>Tipo</th>
                <th>Celular de Contacto</th>
                <th style={{ textAlign: 'center' }}>Total Visitas</th>
                <th style={{ textAlign: 'right' }}>Total Consumido</th>
                <th>Última Visita</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className={styles.customerName}>{customer.full_name}</td>
                    <td>{getCustomerTypeLabel(customer.customer_type)}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 'var(--weight-medium)' }}>
                      {customer.phone ? `📞 ${customer.phone}` : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'var(--weight-semibold)' }}>
                      {customer.total_orders}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                      S/ {customer.total_spent.toFixed(2)}
                    </td>
                    <td>
                      {customer.last_order_at 
                        ? new Date(customer.last_order_at).toLocaleDateString() 
                        : 'Nunca'}
                    </td>
                    <td style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>
                      {customer.created_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.noData}>
                    📭 No se encontraron clientes registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
