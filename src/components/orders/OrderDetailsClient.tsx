// src/components/orders/OrderDetailsClient.tsx
'use client';

import React, { useState } from 'react';
import { StatusBadge, OrderStatus } from '@/components/ui/StatusBadge';
import { BigButton } from '@/components/ui/BigButton';
import { updateOrderStatus } from '@/lib/actions/order-actions';
import styles from '@/app/(empleada)/pedidos/[id]/detalle.module.css';

interface OrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  weight: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  talonario_number: string | null;
  notes: string | null;
  created_at: string;
  items: { name: string; qty: number; subtotal: number }[];
  history: { status: OrderStatus; time: string; changed_by: string }[];
}

interface OrderDetailsClientProps {
  initialOrder: OrderDetail;
}

export const OrderDetailsClient: React.FC<OrderDetailsClientProps> = ({
  initialOrder
}) => {
  const [order, setOrder] = useState<OrderDetail>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus({
        order_id: order.id,
        new_status: nextStatus,
        changed_by: '00000000-0000-0000-0000-000000000000', // Mock de empleada de turno
        notes: `Pedido avanzado a ${nextStatus} desde la app móvil`
      });

      if (res.success) {
        setOrder(prev => ({
          ...prev,
          status: nextStatus,
          history: [
            ...prev.history,
            {
              status: nextStatus,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              changed_by: 'Esposa del Dueño'
            }
          ]
        }));
        alert(`¡Pedido actualizado a ${nextStatus}!`);
      } else {
        // Fallback local en desarrollo
        setOrder(prev => ({
          ...prev,
          status: nextStatus,
          history: [
            ...prev.history,
            {
              status: nextStatus,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              changed_by: 'Esposa del Dueño'
            }
          ]
        }));
      }
    } catch {
      setOrder(prev => ({
        ...prev,
        status: nextStatus,
        history: [
          ...prev.history,
          {
            status: nextStatus,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            changed_by: 'Esposa del Dueño'
          }
        ]
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>{order.order_number}</h1>
          <span className={styles.date}>Recibido: {order.created_at}</span>
        </div>
        <StatusBadge status={order.status} animate={true} />
      </header>

      {/* DETALLE DEL CLIENTE Y COBRO */}
      <section className={`${styles.card} glassmorphism`}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <span className={styles.labelTitle}>Cliente</span>
          <strong className={styles.customerName}>{order.customer_name}</strong>
          {order.customer_phone && <span className={styles.customerPhone}>📞 {order.customer_phone}</span>}
        </div>

        {order.talonario_number && (
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <span className={styles.labelTitle}>Ticket Talonario Físico</span>
            <strong style={{ fontSize: 'var(--font-md)', color: 'var(--dark)' }}>Nro. {order.talonario_number}</strong>
          </div>
        )}

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <span className={styles.labelTitle}>Prendas / Servicios</span>
          <div className={styles.itemsList}>
            {order.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <span>{item.qty}x {item.name}</span>
                <strong>S/ {item.subtotal.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        {order.notes && (
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <span className={styles.labelTitle}>Notas del Pedido</span>
            <p className={styles.notesText}>{order.notes}</p>
          </div>
        )}

        <div className={styles.totalRow}>
          <div>
            <span className={styles.labelTitle}>Método: {order.payment_method.toUpperCase()}</span>
            <span className={styles.paymentStatus}>🟢 PAGADO ADELANTADO</span>
          </div>
          <strong className={styles.grandTotal}>S/ {order.total.toFixed(2)}</strong>
        </div>
      </section>

      {/* LÍNEA DE TIEMPO / HISTORIAL */}
      <section className={`${styles.card} glassmorphism`}>
        <h3 className={styles.sectionTitle}>Historial de Procesos</h3>
        <div className={styles.timeline}>
          {order.history.map((h, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineMeta}>
                <strong>{h.status.toUpperCase()}</strong>
                <span>{h.time} por {h.changed_by}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACCIONES OPERATIVAS MÓVILES (BOTONES GIGANTES) */}
      <section style={{ marginTop: 'var(--spacing-lg)' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 'var(--spacing-md)' }}>
          Acción del Estado Actual
        </h3>

        {order.status === 'received' && (
          <BigButton
            variant="warning"
            active={true}
            icon="🧼"
            disabled={isUpdating}
            onClick={() => handleStatusChange('washing')}
          >
            🔴 COMENZAR A LAVAR
          </BigButton>
        )}

        {order.status === 'washing' && (
          <BigButton
            variant="warning"
            active={true}
            icon="💨"
            disabled={isUpdating}
            onClick={() => handleStatusChange('drying')}
          >
            🟡 COMENZAR A SECAR
          </BigButton>
        )}

        {order.status === 'drying' && (
          <BigButton
            variant="success"
            active={true}
            icon="✨"
            disabled={isUpdating}
            onClick={() => handleStatusChange('ready')}
          >
            🟢 MARCAR COMO LISTO
          </BigButton>
        )}

        {order.status === 'ready' && (
          <BigButton
            variant="primary"
            active={true}
            icon="🤝"
            disabled={isUpdating}
            onClick={() => handleStatusChange('delivered')}
          >
            🔵 ENTREGAR AL CLIENTE
          </BigButton>
        )}

        {order.status === 'delivered' && (
          <div className={styles.completedBanner}>
            ✅ ¡Este pedido ya fue entregado y completado!
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className={styles.cancelledBanner}>
            ❌ Este pedido fue cancelado.
          </div>
        )}
      </section>
    </div>
  );
};
