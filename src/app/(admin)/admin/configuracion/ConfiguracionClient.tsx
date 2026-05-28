// src/app/(admin)/admin/configuracion/ConfiguracionClient.tsx
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { createService, updateService, deleteService } from '@/lib/actions/service-actions';
import styles from './configuracion.module.css';

interface Service {
  id: string;
  name: string;
  service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item';
  price_per_kg: number | null;
  price_per_unit: number | null;
  estimated_hours: number;
  sort_order: number;
}

interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'operator';
  phone: string;
  is_active: boolean;
}

interface ConfiguracionClientProps {
  initialServices: Service[];
}

export default function ConfiguracionClient({ initialServices }: ConfiguracionClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'emp-1', name: 'Esposa del Dueño (Confianza)', role: 'operator', phone: '987654321', is_active: true },
    { id: 'emp-2', name: 'Empleada #2 (Contratada)', role: 'operator', phone: '999888777', is_active: true }
  ]);

  const [businessName, setBusinessName] = useState('Lavandería J&L');
  const [address, setAddress] = useState('Av. Carlos Izaguirre Mz B Lt 19 Urb. Kama - S.M.P., Lima');
  const [phone, setPhone] = useState('987654321');

  // Estados del Formulario de Servicios (Crear / Editar)
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState<'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item'>('special_item');
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  const handleToggleEmployee = (id: string) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, is_active: !e.is_active } : e)
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Configuración general de MYPE guardada con éxito (Simulado)!');
  };

  const handleOpenCreateForm = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceType('special_item');
    setServicePrice(0);
    setShowForm(true);
  };

  const handleOpenEditForm = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServiceType(service.service_type);
    setServicePrice(service.service_type === 'special_item' ? (service.price_per_unit || 0) : (service.price_per_kg || 0));
    setShowForm(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setIsSubmittingService(true);
    try {
      const payload = {
        name: serviceName.trim(),
        service_type: serviceType,
        price_per_kg: serviceType === 'special_item' ? null : servicePrice,
        price_per_unit: serviceType === 'special_item' ? servicePrice : null,
        estimated_hours: 24,
        sort_order: serviceType === 'special_item' ? 10 : 1
      };

      let res;
      if (editingServiceId) {
        res = await updateService(editingServiceId, payload);
      } else {
        res = await createService(payload);
      }

      if (res.success) {
        alert(res.message);
        // Recargar el estado local de forma inteligente
        if (editingServiceId) {
          setServices(prev => prev.map(s => s.id === editingServiceId ? { ...s, ...payload, id: editingServiceId } as any : s));
        } else if (res.data) {
          setServices(prev => [...prev, res.data]);
        }
        setShowForm(false);
      } else {
        // Fallback local en caso de base simulada
        const fallbackItem = {
          id: editingServiceId || 's-local-' + Math.random().toString(),
          ...payload
        } as any;

        if (editingServiceId) {
          setServices(prev => prev.map(s => s.id === editingServiceId ? fallbackItem : s));
        } else {
          setServices(prev => [...prev, fallbackItem]);
        }
        setShowForm(false);
        alert('Tarifa guardada con éxito (Simulación Local).');
      }
    } catch (err) {
      alert('Error al guardar el servicio.');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este servicio? Esto lo quitará de forma permanente del catálogo.');
    if (!confirmDelete) return;

    try {
      const res = await deleteService(id);
      if (res.success) {
        setServices(prev => prev.filter(s => s.id !== id));
        alert(res.message);
      } else {
        // Fallback local
        setServices(prev => prev.filter(s => s.id !== id));
        alert('Servicio eliminado exitosamente (Simulación Local).');
      }
    } catch {
      setServices(prev => prev.filter(s => s.id !== id));
      alert('Servicio eliminado exitosamente (Simulación Local).');
    }
  };

  // Filtrado de servicios
  const weightServices = services.filter(s => s.service_type !== 'special_item');
  const specialItems = services.filter(s => s.service_type === 'special_item');

  return (
    <div className={`${styles.container} animate-fade-in-up`}>
      <Header
        title="Configuración y Tarifario ⚙"
        subtitle="Administra los precios por Kilo, edita los Artículos Especiales y gestiona los accesos."
      />

      <div className={styles.grid}>
        {/* COLUMNA IZQUIERDA: CONFIG GENERAL & EMPLEADOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {/* CONFIGURACIÓN GENERAL */}
          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>🏢 Datos de la MYPE</h3>
            <p className={styles.sectionSubtitle}>Datos principales de J&L que aparecen en el comprobante.</p>
            
            <form onSubmit={handleSaveConfig} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre Comercial</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Dirección Física (Lima)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Celular de Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button type="submit" className={`${styles.saveBtn} active-press transition-all`}>
                💾 Guardar Configuración
              </button>
            </form>
          </section>

          {/* GESTIÓN DE EMPLEADAS */}
          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>👥 Accesos de Empleadas</h3>
            <p className={styles.sectionSubtitle}>Habilita o suspende el acceso al registro móvil de operadoras.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {employees.map((emp) => (
                <div key={emp.id} className={styles.employeeRow}>
                  <div>
                    <strong style={{ fontSize: 'var(--font-sm)', display: 'block', color: 'var(--dark)' }}>{emp.name}</strong>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>📞 {emp.phone}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEmployee(emp.id)}
                    className={`${styles.toggleBtn} ${emp.is_active ? styles.toggleBtnActive : styles.toggleBtnInactive} active-press`}
                  >
                    {emp.is_active ? '🟢 Activo' : '🔴 Suspendido'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: GESTOR DE SERVICIOS INTERACTIVO */}
        <section className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className={styles.sectionTitle}>💰 Tarifario y Artículos</h3>
              <p className={styles.sectionSubtitle} style={{ marginBottom: 0 }}>Gestiona los precios de lavado por Kilo y los Artículos Especiales.</p>
            </div>
            {!showForm && (
              <button className={`${styles.saveBtn} active-press`} onClick={handleOpenCreateForm} style={{ width: 'auto', padding: '0 16px', height: '38px', fontSize: 'var(--font-xs)' }}>
                ➕ Agregar Tarifa
              </button>
            )}
          </div>

          {/* FORMULARIO INLINE CREAR / EDITAR */}
          {showForm && (
            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--primary-glow)', marginBottom: 'var(--spacing-md)' }}>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>
                {editingServiceId ? '✏ Editar Tarifa de Catálogo' : '➕ Registrar Nueva Tarifa'}
              </h4>
              <form onSubmit={handleSaveService} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre del Artículo / Servicio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Frazada King Heavy o Planchado Premium"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className={styles.input}
                    style={{ backgroundColor: 'var(--white)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Cobro</label>
                    <select
                      value={serviceType}
                      onChange={(e: any) => setServiceType(e.target.value)}
                      className={styles.input}
                      style={{ backgroundColor: 'var(--white)' }}
                    >
                      <option value="special_item">Por Unidad (Art. Especial)</option>
                      <option value="wash_per_kg">Por Peso (Lavado Kilo)</option>
                      <option value="drying">Por Peso (Secado Kilo)</option>
                      <option value="ironing">Por Peso (Planchado Kilo)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Monto del Cobro (S/)</label>
                    <input
                      type="number"
                      step="0.10"
                      required
                      min="0.50"
                      value={servicePrice || ''}
                      onChange={(e) => setServicePrice(Number(e.target.value))}
                      className={styles.input}
                      style={{ backgroundColor: 'var(--white)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                  <button type="submit" disabled={isSubmittingService} className={styles.saveBtn} style={{ flex: 2, height: '38px', fontSize: 'var(--font-xs)' }}>
                    {isSubmittingService ? 'Guardando...' : '💾 Guardar Tarifa'}
                  </button>
                  <button type="button" className={styles.toggleBtn} onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: 'var(--white)', border: '1px solid var(--gray-300)', color: 'var(--gray-800)' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTADOS DE TARIFAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* A. SERVICIOS POR KILO */}
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '4px', marginBottom: 'var(--spacing-sm)' }}>
                ⚖ Cobros Basados en Peso (Por Kilo)
              </h4>
              <div className={styles.pricesList}>
                {weightServices.map((service) => (
                  <div key={service.id} className={styles.priceRow}>
                    <div>
                      <span className={styles.priceName}>{service.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--gray-600)', display: 'block' }}>Kilo standard</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <strong style={{ color: 'var(--success)' }}>S/ {(service.price_per_kg || 0).toFixed(2)}</strong>
                      <button className={styles.toggleBtn} onClick={() => handleOpenEditForm(service)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                        ✏
                      </button>
                      <button className={styles.toggleBtn} onClick={() => handleDeleteService(service.id)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B. ARTÍCULOS ESPECIALES */}
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '4px', marginBottom: 'var(--spacing-sm)' }}>
                🛌 Artículos Especiales (Por Unidad)
              </h4>
              <div className={styles.pricesList} style={{ maxHeight: '260px' }}>
                {specialItems.length === 0 ? (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', textAlign: 'center', padding: '16px' }}>No hay artículos especiales configurados.</div>
                ) : (
                  specialItems.map((service) => (
                    <div key={service.id} className={styles.priceRow}>
                      <div>
                        <span className={styles.priceName}>{service.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--gray-600)', display: 'block' }}>Unidad completa</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <strong style={{ color: 'var(--success)' }}>S/ {(service.price_per_unit || 0).toFixed(2)}</strong>
                        <button className={styles.toggleBtn} onClick={() => handleOpenEditForm(service)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                          ✏
                      </button>
                        <button className={styles.toggleBtn} onClick={() => handleDeleteService(service.id)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                          🗑
                      </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
