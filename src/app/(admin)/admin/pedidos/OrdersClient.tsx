// src/app/(admin)/pedidos/OrdersClient.tsx
'use client';

import React, { useState } from 'react';
import styles from './pedidos.module.css';

interface OrdersClientProps {
  initialOrders: any[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Estados legibles
  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Recibido';
      case 'washing': return 'Lavando';
      case 'drying': return 'Secando';
      case 'ironing': return 'Planchando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'received': return 'badge-primary';
      case 'washing': return 'badge-warning';
      case 'drying': return 'badge-warning';
      case 'ironing': return 'badge-warning';
      case 'ready': return 'badge-success animate-pulse-soft';
      case 'delivered': return 'badge-secondary';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  // Filtrado del lado del cliente para búsqueda rápida interactiva
  const filteredOrders = orders.filter((order) => {
    const customerName = order.customers?.full_name?.toLowerCase() || '';
    const ticketNumber = order.order_number?.toLowerCase() || '';
    const talonarioNumber = order.talonario_number?.toLowerCase() || '';
    const cleanSearch = searchTerm.toLowerCase();

    const matchesSearch = customerName.includes(cleanSearch) || 
                          ticketNumber.includes(cleanSearch) || 
                          talonarioNumber.includes(cleanSearch);

    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesPayment = paymentFilter === '' || order.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Exportar a CSV para Excel (BI del Dueño)
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ['Nro Ticket', 'Nro Talonario', 'Cliente', 'Celular', 'Fecha', 'Receptor', 'Total (S/)', 'Metodo Pago', 'Estado'];
    const rows = filteredOrders.map(order => [
      order.order_number,
      order.talonario_number || 'Ninguno',
      order.customers?.full_name || 'Desconocido',
      order.customers?.phone || 'Ninguno',
      new Date(order.created_at).toLocaleDateString('es-PE'),
      order.profiles?.full_name || 'Personal',
      order.total.toFixed(2),
      order.payment_method.toUpperCase(),
      getStatusText(order.status)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JL_Reporte_Pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      {/* Caja de Filtros */}
      <div className={styles.filterCard}>
        <div className={styles.filterTitle}>
          <span>🔍</span> Filtros de Búsqueda Avanzada
        </div>
        
        <div className={styles.filterGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Buscar por Nombre o Ticket</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej. María Gómez / JL-0001" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Estado de Servicio</label>
            <select 
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="received">Recibidos</option>
              <option value="washing">Lavando</option>
              <option value="drying">Secando</option>
              <option value="ironing">Planchando</option>
              <option value="ready">Listos para entregar</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Método de Pago</label>
            <select 
              className={styles.select}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>📋 Historial de Servicios Registrados ({filteredOrders.length})</h3>
          {filteredOrders.length > 0 && (
            <button className={styles.btnPrimary} onClick={handleExportCSV}>
              📥 Exportar Excel (CSV)
            </button>
          )}
        </div>

        <div className={styles.tableContainer}>
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No se encontraron pedidos con los filtros seleccionados.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Talonario</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Atendido Por</th>
                  <th>Peso / Ítems</th>
                  <th>Método Pago</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--primary)' }}>
                      {order.order_number}
                    </td>
                    <td>{order.talonario_number || <em style={{ color: 'var(--gray-600)' }}>[Sin talonario]</em>}</td>
                    <td style={{ fontWeight: 'var(--weight-semibold)' }}>{order.customers?.full_name}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('es-PE')}</td>
                    <td>{order.profiles?.full_name || 'Operadora'}</td>
                    <td>{order.total_weight_kg ? `${order.total_weight_kg} kg` : 'Especial'}</td>
                    <td>{order.payment_method.toUpperCase()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                      S/ {order.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
