// src/app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Aquí implementaremos la autenticación de Supabase en las siguientes fases
  };

  return (
    <main className={styles.container}>
      <div className={`${styles.card} glassmorphism animate-fade-in-up`}>
        <div className={styles.logoSection}>
          {/* Aquí se cargará el logo de Lavandería J&L */}
          <div className={styles.logoPlaceholder}>J&L</div>
          <h1 className={styles.title}>Lavandería J&L</h1>
          <p className={styles.subtitle}>Gestión Operativa MYPE</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@lavanderiajl.com"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={`${styles.button} active-press transition-all`}>
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </main>
  );
}
