// src/app/(admin)/datos/page.tsx
'use client';

import React, { useState } from 'react';
import { bulkImportCustomers } from '@/lib/actions/customer-actions';
import styles from './datos.module.css';

interface ParsedCustomer {
  full_name: string;
  phone: string;
  notes: string;
  status: 'valid' | 'invalid';
  error?: string;
}

export default function ImportPage() {
  const [dataType, setDataType] = useState<'customers'>('customers');
  const [rawText, setRawText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleParse = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!rawText.trim()) {
      setErrorMessage('Por favor, pega el contenido o arrastra un archivo CSV para empezar.');
      setParsedData([]);
      return;
    }

    try {
      const lines = rawText.split('\n');
      const parsed: ParsedCustomer[] = [];

      lines.forEach((line, idx) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // Omitir líneas vacías

        // Soportar delimitador de Tabulador (Excel) o Coma (CSV estándar)
        const delimiter = trimmedLine.includes('\t') ? '\t' : ',';
        const columns = trimmedLine.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

        if (idx === 0 && columns[0].toLowerCase().includes('nombre')) {
          // Detectar y omitir fila cabecera (e.g. Nombre, Celular, Notas)
          return;
        }

        const name = columns[0];
        const phoneRaw = columns[1] || '';
        const notes = columns[2] || 'Importado de Excel';

        // Validaciones básicas de negocio
        if (!name || name.length < 2) {
          parsed.push({
            full_name: name || '[VACÍO]',
            phone: phoneRaw,
            notes,
            status: 'invalid',
            error: 'El nombre debe tener al menos 2 letras.'
          });
        } else {
          // Limpiar teléfono (dejar solo dígitos)
          const phoneClean = phoneRaw.replace(/\D/g, '');
          
          if (phoneClean && phoneClean.length !== 9) {
            parsed.push({
              full_name: name,
              phone: phoneRaw,
              notes,
              status: 'invalid',
              error: 'El número de celular en el formato de Lima/Perú debe tener exactamente 9 dígitos.'
            });
          } else {
            parsed.push({
              full_name: name,
              phone: phoneClean ? phoneClean : '',
              notes,
              status: 'valid'
            });
          }
        }
      });

      if (parsed.length === 0) {
        setErrorMessage('No se encontró ninguna fila válida para procesar en el texto pegado.');
      } else {
        setParsedData(parsed);
      }
    } catch (err: any) {
      setErrorMessage('Error al parsear el contenido pegado. Asegúrate de que las columnas coincidan.');
      setParsedData([]);
    }
  };

  const handleImport = async () => {
    const validCustomers = parsedData.filter(c => c.status === 'valid');
    if (validCustomers.length === 0) {
      setErrorMessage('No hay registros válidos en la lista para importar a la base de datos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await bulkImportCustomers(
        validCustomers.map(c => ({
          full_name: c.full_name,
          phone: c.phone || null,
          notes: c.notes || null
        }))
      );

      if (response.success) {
        setSuccessMessage(response.message);
        setRawText('');
        setParsedData([]);
      } else {
        setErrorMessage(response.message);
      }
    } catch (err: any) {
      setErrorMessage('Ocurrió un error inesperado al procesar la importación: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setRawText('');
    setParsedData([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>💾 Importador de Clientes Históricos (Excel / CSV)</h3>
          <p className={styles.description}>
            Carga de forma masiva tu cartera de clientes anterior. Copia y pega las filas directamente desde Excel 
            o escribe un formato CSV separado por comas.
          </p>
        </div>

        <div className={styles.instructions}>
          <h4>📋 Formato de Columnas Requerido:</h4>
          <ul>
            <li><strong>Columna 1:</strong> Nombre Completo (Ej. <code>María Gómez</code>) - <em>Obligatorio</em></li>
            <li><strong>Columna 2:</strong> Celular (Ej. <code>987654321</code>) - <em>Opcional (Debe tener 9 dígitos)</em></li>
            <li><strong>Columna 3:</strong> Notas adicionales (Ej. <code>Trae ropa delicada de algodón</code>) - <em>Opcional</em></li>
          </ul>
        </div>

        <div className={styles.selectorSection}>
          <label className={styles.label}>Selecciona el tipo de información a importar:</label>
          <select 
            className={styles.select} 
            value={dataType} 
            onChange={(e) => setDataType(e.target.value as 'customers')}
          >
            <option value="customers">Lista de Clientes (Nombre, Celular, Notas)</option>
          </select>
        </div>

        <label className={styles.label}>Pega aquí tus datos de Excel (Copia y pega celdas completas):</label>
        <textarea
          className={styles.textarea}
          placeholder="Nombre&#9;Celular&#9;Notas&#10;María Gómez&#9;987654321&#9;Cliente frecuente&#10;Juan Pérez&#9;&#9;Solo lavado al seco"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleParse} disabled={isSubmitting}>
            🔍 Validar Filas
          </button>
          {parsedData.length > 0 && (
            <button className={styles.btnPrimary} onClick={handleImport} disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, var(--success), var(--success-hover))' }}>
              {isSubmitting ? 'Importando...' : `🚀 Importar Oficialmente ${parsedData.filter(c => c.status === 'valid').length} Clientes`}
            </button>
          )}
          <button className={styles.btnSecondary} onClick={handleClear} disabled={isSubmitting}>
            Limpiar Todo
          </button>
        </div>

        {errorMessage && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            ✅ {successMessage}
          </div>
        )}

        {parsedData.length > 0 && (
          <div className={styles.previewSection}>
            <h4 className={styles.title} style={{ fontSize: 'var(--font-md)' }}>
              Previsualización de los Datos a Importar ({parsedData.length} registros detectados):
            </h4>
            <div className={styles.previewTableContainer}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>Línea</th>
                    <th>Nombre</th>
                    <th>Celular</th>
                    <th>Notas</th>
                    <th>Estado de Validación</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((customer, idx) => (
                    <tr key={idx} style={{ backgroundColor: customer.status === 'invalid' ? 'var(--warning-light)' : 'transparent' }}>
                      <td style={{ fontWeight: 'var(--weight-bold)' }}>{idx + 1}</td>
                      <td>{customer.full_name}</td>
                      <td>{customer.phone || <em style={{ color: 'var(--gray-600)' }}>[Ninguno]</em>}</td>
                      <td>{customer.notes}</td>
                      <td>
                        {customer.status === 'valid' ? (
                          <span className="badge badge-success">✓ Listo</span>
                        ) : (
                          <span className="badge badge-warning" title={customer.error}>
                            ⚠️ Error: {customer.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
