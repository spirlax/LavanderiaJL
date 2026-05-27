// src/app/(admin)/configuracion/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import styles from './configuracion.module.css';

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'operator';
  phone: string;
  is_active: boolean;
}

export default function ConfiguracionPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businessName, setBusinessName] = useState('Lavandería J&L');
  const [address, setAddress] = useState('Av. Carlos Izaguirre Mz B Lt 19 Urb. Kama - S.M.P., Lima');
  const [phone, setPhone] = useState('987654321');
  const [loading, setLoading] = useState(true);

  // Carga de catálogo de precios y empleados por defecto
  useEffect(() => {
    // Simulamos carga de datos desde Supabase
    setTimeout(() => {
      setServices([
        { id: 's1', name: 'Lavado x Kilo Completo', price: 2.80, unit: 'kg' },
        { id: 's2', name: 'Secado x Kilo', price: 1.50, unit: 'kg' },
        { id: 's3', name: 'Secado + Centrifugado x Kilo', price: 2.00, unit: 'kg' },
        { id: 's4', name: 'Planchado x Kilo', price: 3.00, unit: 'kg' },
        { id: 'e1', name: 'Frazada 2 Plazas Tigre', price: 25.00, unit: 'und' },
        { id: 'e2', name: 'Edredón Plumas King', price: 35.00, unit: 'und' },
        { id: 'e3', name: 'Edredón Sintético 2 Plz', price: 20.00, unit: 'und' },
        { id: 'e4', name: 'Zapatillas (Par)', price: 15.00, unit: 'und' },
      ]);
      setEmployees([
        { id: 'emp-1', name: 'Esposa del Dueño (Confianza)', role: 'operator', phone: '987654321', is_active: true },
        { id: 'emp-2', name: 'Empleada #2 (Contratada)', role: 'operator', phone: '999888777', is_active: true }
      ]);
      setLoading(false);
    }, 300);
  }, []);

  const handlePriceChange = (id: string, newPrice: number) => {
    setServices(prev =>
      prev.map(s => s.id === id ? { ...s, price: newPrice } : s)
    );
  };

  const handleToggleEmployee = (id: string) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, is_active: !e.is_active } : e)
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Configuración general guardada con éxito!');
  };

  const handleSavePrices = () => {
    alert('¡Catálogo de precios actualizado con éxito!');
  };

  return (
    <div className={`${styles.container} animate-fade-in-up`}>
      <Header
        title="Configuración y Tarifario ⚙️"
        subtitle="Modifica los precios del catálogo y gestiona los accesos de las empleadas de turno."
      />

      <div className={styles.grid}>
        {/* COLUMNA IZQUIERDA: CONFIG GENERAL & EMPLEADOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {/* CONFIGURACIÓN GENERAL */}
          <section className={`${styles.card} glassmorphism`}>
            <h3 className={styles.sectionTitle}>🏢 Datos de la MYPE</h3>
            
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
          <section className={`${styles.card} glassmorphism`}>
            <h3 className={styles.sectionTitle}>👥 Accesos de Empleadas</h3>
            <p className={styles.sectionSubtitle}>Habilita o deshabilita los permisos de acceso al celular para tus operadoras.</p>

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

        {/* COLUMNA DERECHA: CATÁLOGO DE PRECIOS */}
        <section className={`${styles.card} glassmorphism`} style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className={styles.sectionTitle}>💰 Tarifario y Precios (Soles)</h3>
          <p className={styles.sectionSubtitle}>Modifica los precios por Kilo y por unidad para el catálogo interactivo de ventas.</p>

          {loading ? (
            <div className={styles.loader}>Cargando tarifario...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flex: 1 }}>
              <div className={styles.pricesList}>
                {services.map((service) => (
                  <div key={service.id} className={styles.priceRow}>
                    <span className={styles.priceName}>{service.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.currencyPrefix}>S/</span>
                      <input
                        type="number"
                        step="0.10"
                        value={service.price}
                        onChange={(e) => handlePriceChange(service.id, Number(e.target.value))}
                        className={styles.inputPrice}
                      />
                      <span className={styles.unitSuffix}>/ {service.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePrices}
                className={`${styles.saveBtn} active-press transition-all`}
                style={{ marginTop: 'auto' }}
              >
                💾 Guardar Tarifas de Catálogo
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
