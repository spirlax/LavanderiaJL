// src/app/(admin)/maquinas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import styles from './maquinas.module.css';

interface Machine {
  id: string;
  name: string;
  brand: string | null;
  machine_type: 'washer' | 'dryer' | 'ironer' | 'other';
  capacity_kg: number;
  status: 'working' | 'review' | 'repair' | 'out_of_service';
  status_note: string | null;
  last_maintenance: string | null;
}

export default function GestionMaquinasPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [newStatus, setNewStatus] = useState<Machine['status']>('working');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Carga del catálogo de máquinas por defecto
  useEffect(() => {
    // Simulamos carga de datos desde Supabase
    setTimeout(() => {
      setMachines([
        { id: 'm1', name: 'Lavadora #1', brand: 'Samsung', machine_type: 'washer', capacity_kg: 18.00, status: 'working', status_note: 'Operando normal', last_maintenance: '2026-05-10' },
        { id: 'm2', name: 'Lavadora #2', brand: 'LG', machine_type: 'washer', capacity_kg: 18.00, status: 'review', status_note: 'Ruidos extraños al centrifugar', last_maintenance: '2026-05-12' },
        { id: 'm3', name: 'Lavadora #3 (Industrial)', brand: 'Speed Queen', machine_type: 'washer', capacity_kg: 22.00, status: 'working', status_note: 'Excelente para frazadas pesadas', last_maintenance: '2026-04-15' },
        { id: 'm4', name: 'Secadora #1', brand: 'General Electric', machine_type: 'dryer', capacity_kg: 15.00, status: 'working', status_note: 'Operando normal', last_maintenance: '2026-05-01' },
        { id: 'm5', name: 'Secadora #2', brand: 'Samsung', machine_type: 'dryer', capacity_kg: 18.00, status: 'repair', status_note: 'Cambio de faja del tambor en proceso', last_maintenance: '2026-05-20' },
        { id: 'm6', name: 'Secadora #3 (Fuerte)', brand: 'Speed Queen', machine_type: 'dryer', capacity_kg: 20.00, status: 'working', status_note: 'Secado rápido de edredones', last_maintenance: '2026-04-18' },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    setMachines(prev =>
      prev.map(m =>
        m.id === editingMachine.id
          ? { ...m, status: newStatus, status_note: statusNote.trim() || 'Actualizado por el dueño' }
          : m
      )
    );

    alert(`¡Estado de ${editingMachine.name} actualizado con éxito!`);
    setEditingMachine(null);
    setStatusNote('');
  };

  const getStatusLabel = (status: Machine['status']) => {
    switch (status) {
      case 'working': return <span className="badge badge-success">Operativa</span>;
      case 'review': return <span className="badge badge-warning">En Revisión</span>;
      case 'repair': return <span className="badge badge-danger">En Reparación</span>;
      case 'out_of_service': return <span className="badge badge-danger" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>Inactiva</span>;
      default: return status;
    }
  };

  const activeCount = machines.filter(m => m.status === 'working').length;
  const totalCount = machines.length;
  const percentOperative = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className={`${styles.container} animate-fade-in-up`}>
      <Header
        title="Maquinaria y Estado Físico 🔧"
        subtitle="Monitorea y cambia el estado de operatividad de las lavadoras y secadoras de tu local."
        badgeText={`${percentOperative}% Operativo`}
        badgeVariant={percentOperative >= 80 ? 'success' : 'warning'}
      />

      {/* MÉTRICAS DE OPERATIVIDAD DE MAQUINARIAS */}
      <section className={styles.statsRow}>
        <div className={`${styles.statsCard} glassmorphism`}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>Máquinas Operativas</span>
          <strong style={{ fontSize: 'var(--font-2xl)', color: 'var(--success)' }}>{activeCount} / {totalCount}</strong>
        </div>
        <div className={`${styles.statsCard} glassmorphism`}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>En Reparación / Falla</span>
          <strong style={{ fontSize: 'var(--font-2xl)', color: 'var(--danger)' }}>
            {machines.filter(m => m.status === 'repair' || m.status === 'out_of_service').length}
          </strong>
        </div>
        <div className={`${styles.statsCard} glassmorphism`}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>Capacidad Total Instalada</span>
          <strong style={{ fontSize: 'var(--font-2xl)', color: 'var(--primary)' }}>
            {machines.reduce((sum, m) => sum + m.capacity_kg, 0)} kg
          </strong>
        </div>
      </section>

      {loading ? (
        <div className={styles.loader}>Cargando inventario de maquinaria...</div>
      ) : (
        <section className={styles.machinesGrid}>
          {machines.map((machine) => (
            <div key={machine.id} className={`${styles.machineCard} glassmorphism`}>
              <div className={styles.machineHeader}>
                <div>
                  <h3 className={styles.machineName}>{machine.name}</h3>
                  <span className={styles.machineSub}>
                    {machine.brand} · {machine.machine_type === 'washer' ? '🧼 Lavadora' : '💨 Secadora'}
                  </span>
                </div>
                {getStatusLabel(machine.status)}
              </div>

              <div className={styles.machineBody}>
                <div className={styles.metaRow}>
                  <span>Capacidad:</span>
                  <strong>{machine.capacity_kg.toFixed(1)} Kilos</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Último Manto:</span>
                  <span>{machine.last_maintenance}</span>
                </div>
                
                {machine.status_note && (
                  <div className={styles.statusNoteArea}>
                    <strong>Observación:</strong>
                    <p style={{ margin: 0 }}>{machine.status_note}</p>
                  </div>
                )}
              </div>

              <div className={styles.machineFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMachine(machine);
                    setNewStatus(machine.status);
                    setStatusNote(machine.status_note || '');
                  }}
                  className={`${styles.editBtn} active-press transition-all`}
                >
                  🔧 Actualizar Estado / Falla
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* FORMULARIO EDITAR ESTADO (MODAL ANIDADO) */}
      {editingMachine && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glassmorphism animate-fade-in-up`}>
            <h3 className={styles.modalTitle}>Editar Estado: {editingMachine.name}</h3>
            
            <form onSubmit={handleUpdateStatus} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nuevo Estado Operativo</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="working">🟢 Operando Normal (Working)</option>
                  <option value="review">🟡 En Revisión Preventiva (Review)</option>
                  <option value="repair">🟠 En Reparación Activa (Repair)</option>
                  <option value="out_of_service">🔴 Fuera de Servicio Total (Out of Service)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Notas de Falla / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Fuga leve de agua en la válvula trasera."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
