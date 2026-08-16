'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getRelatorioEntradas, getRelatorioSaidas } from '../actions';
import styles from './TabRelatorios.module.css';

export default function TabRelatorios() {
  const [reportType, setReportType] = useState('SAIDAS'); // SAIDAS ou ENTRADAS
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função interna ao useEffect para busca de dados
  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [resEntradas, resSaidas] = await Promise.all([
          getRelatorioEntradas(),
          getRelatorioSaidas()
        ]);
        setEntradas(resEntradas || []);
        setSaidas(resSaidas || []);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []); // <--- Array vazio perfeito, executado apenas na montagem

  const handleExportExcel = () => {
    const isSaidas = reportType === 'SAIDAS';
    const dataToExport = isSaidas ? saidas : entradas;

    if (dataToExport.length === 0) return alert('Nenhum dado disponível para exportar.');

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isSaidas ? 'Saídas' : 'Entradas');
    XLSX.writeFile(
      workbook, 
      `Relatorio_Farmacia_Judicial_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className={styles.card}>
      {/* ... mantido o restante do JSX ... */}
    </div>
  );
}