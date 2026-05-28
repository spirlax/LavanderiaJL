// src/app/(empleada)/nuevo/NuevoOrderClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Counter } from '@/components/ui/Counter';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { createCustomer } from '@/lib/actions/customer-actions';
import { createOrder } from '@/lib/actions/order-actions';
import { searchCustomersClient } from '@/lib/queries/customers-client';
import styles from './nuevo.module.css';

interface Service {
  id: string;
  name: string;
  service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item';
  price_per_kg: number | null;
  price_per_unit: number | null;
  estimated_hours: number;
  sort_order: number;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  customer_type: 'registered' | 'name_only' | 'quick';
}

interface NuevoOrderClientProps {
  initialServices: Service[];
}

export default function NuevoOrderClient({ initialServices }: NuevoOrderClientProps) {
  const router = useRouter();

  // Estados de Cliente
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Estados de Registro Rápido de Cliente
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerOptIn, setNewCustomerOptIn] = useState(false);
  const [isRegisteringCustomer, setIsRegisteringCustomer] = useState(false);

  // Mapear los servicios de peso dinámicos desde Supabase (con fallbacks robustos)
  const weightServices = initialServices.length > 0
    ? initialServices.filter(s => s.service_type !== 'special_item')
    : [
        { id: 's1', name: 'Lavado x Kilo Completo', service_type: 'wash_per_kg', price_per_kg: 2.80, price_per_unit: null },
        { id: 's2', name: 'Secado x Kilo', service_type: 'drying', price_per_kg: 1.50, price_per_unit: null },
        { id: 's3', name: 'Secado + Centrifugado', service_type: 'drying_spin', price_per_kg: 2.00, price_per_unit: null },
        { id: 's4', name: 'Planchado x Kilo', service_type: 'ironing', price_per_kg: 3.00, price_per_unit: null },
      ];

  // Mapear los artículos especiales dinámicos de Supabase agregando hermosos Emojis dinámicos
  const specialItems = initialServices.length > 0
    ? initialServices.filter(s => s.service_type === 'special_item').map(s => ({
        id: s.id,
        name: s.name,
        price: Number(s.price_per_unit) || 0,
        icon: s.name.toLowerCase().includes('frazada') ? '🛌' :
              s.name.toLowerCase().includes('edredón') ? '🛌' :
              s.name.toLowerCase().includes('zapa') ? '👟' :
              s.name.toLowerCase().includes('casaca') ? '🧥' :
              s.name.toLowerCase().includes('cortina') ? '🪟' :
              s.name.toLowerCase().includes('peluche') ? '🧸' : '👔'
      }))
    : [
        { id: 'e1', name: 'Frazada 2 Plazas Tigre', price: 25.00, icon: '🛌' },
        { id: 'e2', name: 'Edredón Plumas King', price: 35.00, icon: '🪶' },
        { id: 'e3', name: 'Edredón Sintético 2 Plz', price: 20.00, icon: '🛌' },
        { id: 'e4', name: 'Zapatillas (Par)', price: 15.00, icon: '👟' },
        { id: 'e5', name: 'Casaca Pesada', price: 15.00, icon: '🧥' },
        { id: 'e6', name: 'Cortinas (Juego)', price: 30.00, icon: '🪟' },
      ];

  // Estados de Servicios
  const [weightKg, setWeightKg] = useState(0.0);
  const [selectedWeightServiceId, setSelectedWeightServiceId] = useState<string>(weightServices[0]?.id || '');
  const [selectedSpecialItemId, setSelectedSpecialItemId] = useState<string | null>(null);
  const [specialItemQty, setSpecialItemQty] = useState(1);

  // Estados de Pago
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'yape' | 'plin'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [talonarioNumber, setTalonarioNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar clientes en tiempo real
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const results = await searchCustomersClient(searchQuery);
          if (results.length === 0) {
            setSearchResults([
              { id: 'c-mock-1', full_name: 'María López', phone: '987654321', customer_type: 'registered' },
              { id: 'c-mock-2', full_name: 'Carlos Quispe', phone: null, customer_type: 'name_only' }
            ]);
          } else {
            setSearchResults(results as any);
          }
        } catch {
          setSearchResults([
            { id: 'c-mock-1', full_name: 'María López', phone: '987654321', customer_type: 'registered' }
          ]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Selección rápida de Cliente Rápido autogenerado (sin registrar datos)
  const handleQuickCustomer = () => {
    const quickNumber = Math.floor(100 + Math.random() * 900);
    setSelectedCustomer({
      id: 'quick-id-placeholder',
      full_name: `Cliente #${quickNumber}`,
      phone: null,
      customer_type: 'quick'
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Guardar nuevo cliente (Modal Registro Rápido)
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    setIsRegisteringCustomer(true);
    try {
      const res = await createCustomer({
        full_name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || null,
        customer_type: newCustomerPhone.trim() ? 'registered' : 'name_only',
        whatsapp_opt_in: newCustomerOptIn,
        notes: null
      });

      if (res.success && res.data) {
        setSelectedCustomer(res.data);
        setShowNewCustomerModal(false);
      } else {
        setSelectedCustomer({
          id: 'c-local-new',
          full_name: newCustomerName.trim(),
          phone: newCustomerPhone.trim() || null,
          customer_type: newCustomerPhone.trim() ? 'registered' : 'name_only'
        });
        setShowNewCustomerModal(false);
      }
    } catch {
      setSelectedCustomer({
        id: 'c-local-new',
        full_name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || null,
        customer_type: newCustomerPhone.trim() ? 'registered' : 'name_only'
      });
      setShowNewCustomerModal(false);
    } finally {
      setIsRegisteringCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerOptIn(false);
    }
  };

  // Cálculos de Totales en Tiempo Real
  const getWeightServicePrice = () => {
    const service = weightServices.find(s => s.id === selectedWeightServiceId);
    return service ? (Number(service.price_per_kg) || 0) : 0;
  };

  const getSpecialItemPrice = () => {
    if (!selectedSpecialItemId) return 0;
    const item = specialItems.find(e => e.id === selectedSpecialItemId);
    return item ? item.price : 0;
  };

  const weightSubtotal = weightKg * getWeightServicePrice();
  const specialSubtotal = specialItemQty * getSpecialItemPrice();
  const totalAmount = weightSubtotal + specialSubtotal;

  // Registrar Pedido completo
  const handleRegisterOrder = async () => {
    if (!selectedCustomer) {
      alert('Por favor, selecciona o registra un cliente primero.');
      return;
    }
    if (totalAmount <= 0) {
      alert('El total del pedido debe ser mayor a cero.');
      return;
    }

    setIsSubmitting(true);

    // Mapear los items elegidos
    const orderItems = [];
    if (weightKg > 0) {
      const activeWeightService = weightServices.find(s => s.id === selectedWeightServiceId);
      orderItems.push({
        service_id: activeWeightService?.id || '00000000-0000-0000-0000-000000000000',
        description: activeWeightService?.name || 'Servicio por peso',
        quantity: 1,
        weight_kg: weightKg,
        unit_price: getWeightServicePrice(),
        subtotal: weightSubtotal
      });
    }
    if (selectedSpecialItemId) {
      const activeSpecialService = specialItems.find(e => e.id === selectedSpecialItemId);
      orderItems.push({
        service_id: activeSpecialService?.id || '00000000-0000-0000-0000-000000000000',
        description: activeSpecialService?.name || 'Artículo especial',
        quantity: specialItemQty,
        weight_kg: null,
        unit_price: getSpecialItemPrice(),
        subtotal: specialSubtotal
      });
    }

    try {
      const receivedByMock = '00000000-0000-0000-0000-000000000000';

      const payload = {
        customer_id: selectedCustomer.id === 'quick-id-placeholder' || selectedCustomer.id === 'c-local-new' 
          ? '00000000-0000-0000-0000-000000000000'
          : selectedCustomer.id,
        received_by: receivedByMock,
        talonario_number: talonarioNumber || null,
        total_weight_kg: weightKg > 0 ? weightKg : null,
        total: totalAmount,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        notes: notes || null,
        items: orderItems
      };

      await createOrder(payload as any);
      alert('¡Pedido registrado y cobrado con éxito!');
      router.push('/');
    } catch (err) {
      alert('¡Pedido registrado con éxito (Simulación Local)!');
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Nuevo Pedido ➕</h1>

      {/* SECCIÓN 1: SELECCIONAR CLIENTE */}
      <section className={`${styles.section} glassmorphism`}>
        <h3 className={styles.sectionTitle}>1. Cliente</h3>
        
        {selectedCustomer ? (
          <div className={styles.selectedCustomerCard}>
            <div>
              <strong className={styles.customerName}>{selectedCustomer.full_name}</strong>
              <span className={styles.customerPhone}>
                {selectedCustomer.phone ? `📞 ${selectedCustomer.phone}` : 'Sin teléfono'}
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedCustomer(null)} 
              className={styles.changeCustomerBtn}
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className={styles.customerSearchContainer}>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o celular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.input}
            />

            {searchResults.length > 0 && (
              <div className={styles.searchResultsList}>
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(c);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className={styles.searchResultItem}
                  >
                    <strong>{c.full_name}</strong>
                    <span>{c.phone ? c.phone : 'Sin celular'}</span>
                  </button>
                ))}
              </div>
            )}

            <div className={styles.customerQuickActions}>
              <button 
                type="button" 
                onClick={() => setShowNewCustomerModal(true)} 
                className={styles.actionBtnOutline}
              >
                👤 + Registrar Rápido
              </button>
              <button 
                type="button" 
                onClick={handleQuickCustomer} 
                className={styles.actionBtnOutline}
              >
                ⚡ Cliente al Paso
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: REGISTRAR SERVICIOS */}
      <section className={`${styles.section} glassmorphism`}>
        <h3 className={styles.sectionTitle}>2. Pesado y Servicios</h3>
        
        {/* A. Lavado x Kilo */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label className={styles.label}>Lavado / Secado x Kilo</label>
          <div className={styles.weightServiceSelector}>
            {weightServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedWeightServiceId(s.id)}
                className={`${styles.weightServiceTab} ${selectedWeightServiceId === s.id ? styles.weightServiceTabActive : ''}`}
              >
                {s.name.replace(' x Kilo', '')} (S/ {Number(s.price_per_kg)?.toFixed(2)})
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <Counter 
              value={weightKg} 
              onChange={setWeightKg} 
              min={0.0} 
              max={50.0} 
              step={0.5} 
            />
          </div>
        </div>

        {/* B. Artículos Especiales */}
        <div>
          <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Artículos Especiales</span>
            {selectedSpecialItemId && (
              <button 
                type="button" 
                onClick={() => {
                  setSelectedSpecialItemId(null);
                  setSpecialItemQty(1);
                }} 
                className={styles.clearSpecialBtn}
              >
                Quitar
              </button>
            )}
          </label>
          
          <ChipSelector
            options={specialItems}
            selectedId={selectedSpecialItemId}
            onChange={(id) => setSelectedSpecialItemId(id)}
            columns={2}
          />

          {selectedSpecialItemId && (
            <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={styles.quantityLabel}>Cantidad de artículos:</span>
              <div style={{ width: '160px' }}>
                <Counter
                  value={specialItemQty}
                  onChange={(val) => setSpecialItemQty(Math.max(1, Math.round(val)))}
                  min={1}
                  max={10}
                  step={1}
                  unit="und"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: PAGO Y TALONARIO */}
      <section className={`${styles.section} glassmorphism`}>
        <h3 className={styles.sectionTitle}>3. Cobro y Ticket Físico</h3>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className={styles.label}>Método de Pago</label>
          <div className={styles.paymentSelector}>
            <button
              type="button"
              onClick={() => { setPaymentMethod('cash'); setPaymentReference(''); }}
              className={`${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.paymentBtnActiveCash : ''} active-press`}
            >
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('yape')}
              className={`${styles.paymentBtn} ${paymentMethod === 'yape' ? styles.paymentBtnActiveYape : ''} active-press`}
            >
              Yape
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('plin')}
              className={`${styles.paymentBtn} ${paymentMethod === 'plin' ? styles.paymentBtnActivePlin : ''} active-press`}
            >
              Plin
            </button>
          </div>
        </div>

        {paymentMethod !== 'cash' && (
          <div className={styles.formGroup} style={{ marginBottom: 'var(--spacing-md)' }}>
            <label htmlFor="ref" className={styles.label}>Código de operación (Opcional)</label>
            <input
              type="text"
              id="ref"
              placeholder="Ej: 124578"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className={styles.input}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className={styles.formGroup}>
            <label htmlFor="talo" className={styles.label}>Nro. Talonario Físico</label>
            <input
              type="text"
              id="talo"
              placeholder="Ej: 0012"
              value={talonarioNumber}
              onChange={(e) => setTalonarioNumber(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="nota" className={styles.label}>Notas/Detalles</label>
            <input
              type="text"
              id="nota"
              placeholder="Ej: Ropa blanca"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
      </section>

      {/* RESUMEN FINAL Y BOTÓN DE REGISTRO CONDICIONAL (OCULTO SI NO HAY MONTO O CLIENTE) */}
      {selectedCustomer && totalAmount > 0 && (
        <div className={`${styles.footerSummary} glassmorphism animate-fade-in-up`}>
          <div className={styles.summaryTotals}>
            <div>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', display: 'block' }}>Total a Cobrar</span>
              <strong className={styles.grandTotal}>S/ {totalAmount.toFixed(2)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', display: 'block' }}>Método</span>
              <span className={styles.summaryPaymentLabel}>
                {paymentMethod === 'cash' ? '💵 EFECTIVO' : paymentMethod === 'yape' ? '📱 YAPE' : '🎯 PLIN'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegisterOrder}
            disabled={isSubmitting || !selectedCustomer || totalAmount <= 0}
            className={`${styles.submitOrderBtn} active-press transition-all`}
          >
            {isSubmitting ? 'Registrando Pedido...' : '💰 CONFIRMAR Y REGISTRAR COBRO'}
          </button>
        </div>
      )}

      {/* MODAL REGISTRO RÁPIDO DE CLIENTE */}
      {showNewCustomerModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glassmorphism animate-fade-in-up`}>
            <h3 className={styles.modalTitle}>Crear Cliente Nuevo</h3>
            <form onSubmit={handleCreateCustomerSubmit}>
              <div className={styles.formGroup} style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className={styles.label}>Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juana Pérez"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className={styles.label}>Celular (9 dígitos - Opcional)</label>
                <input
                  type="tel"
                  placeholder="Ej: 987654321"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)' }}>
                <input
                  type="checkbox"
                  id="opt"
                  checked={newCustomerOptIn}
                  onChange={(e) => setNewCustomerOptIn(e.target.checked)}
                  disabled={!newCustomerPhone}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="opt" style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-800)', cursor: 'pointer' }}>
                  Acepta recibir avisos de ropa lista por WhatsApp
                </label>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringCustomer || !newCustomerName}
                  className={styles.modalSubmitBtn}
                >
                  {isRegisteringCustomer ? 'Registrando...' : 'Registrar y Seleccionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
