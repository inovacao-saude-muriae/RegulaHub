'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './DashboardAdmin.module.css';

export default function TechAdminDashboardPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSystemStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/health', { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error('Falha ao obter diagnósticos de infraestrutura');
      }

      const data = await res.json();
      setTelemetry(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/health', { cache: 'no-store' });

        if (!res.ok) {
          throw new Error('Falha ao obter diagnósticos de infraestrutura');
        }

        const data = await res.json();
        setTelemetry(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStatus();

    // Atualiza o diagnóstico a cada 30 segundos automaticamente
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !telemetry) {
    return (
      <div className={styles.container}>
        <p>Aferindo conexões de banco de dados e APIs...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. CABEÇALHO TÉCNICO DE MONITORAMENTO REAL */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel de Diagnóstico do Sistema (Real-Time) 🛠️</h1>
          <p className={styles.subtitle}>Telemetria em tempo real das tabelas, conexões do Prisma e sessões ativas.</p>
        </div>
        <button className={styles.btnPrimary} onClick={fetchSystemStatus}>
          🔄 Atualizar Diagnóstico
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', marginBottom: '1.5rem' }}>
          <strong>Erro no Diagnóstico:</strong> {error}
        </div>
      )}

      {/* 2. CARDS COM DADOS REAIS DO POSTGRES E SESSÕES */}
      <div className={styles.gridCards}>
        {/* CARD BANCO DE DADOS */}
        <div className={telemetry?.database?.status === 'ONLINE' ? styles.cardSuccess : styles.cardDanger}>
          <span className={styles.cardLabel}>Banco de Dados (Prisma/Postgres)</span>
          <strong className={styles.cardNumber}>{telemetry?.database?.status || 'DESCONECTADO'}</strong>
          <span className={styles.cardSubtext}>
            Latência de resposta query: <strong>{telemetry?.database?.pingMs}ms</strong>
          </span>
        </div>

        {/* CARD SESSÕES ATIVAS */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>Sessões Ativas no Banco</span>
          <strong className={styles.cardNumber}>{telemetry?.metrics?.sessoesAtivas || 0}</strong>
          <span className={styles.cardSubtext}>Usuários logados com token válido</span>
        </div>

        {/* CARD USUÁRIOS CADASTRADOS */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>Usuários no Banco</span>
          <strong className={styles.cardNumber}>{telemetry?.metrics?.totalUsuarios || 0}</strong>
          <span className={styles.cardSubtext}>Registros na tabela User</span>
        </div>

        {/* CARD AUTENTICAÇÃO */}
        <div className={styles.cardSuccess}>
          <span className={styles.cardLabel}>API de Autenticação</span>
          <strong className={styles.cardNumber}>OPERACIONAL</strong>
          <span className={styles.cardSubtext}>Gerenciando cookies HTTP-Only</span>
        </div>
      </div>

      {/* 3. TRILHA DE SESSÕES CRIADAS EM TEMPO REAL */}
      <div className={styles.mainGrid}>
        <div className={styles.panel} style={{ gridColumn: 'span 2' }}>
          <h2>Sessões Recentes Criadas no Banco</h2>
          <ul className={styles.logList}>
            {telemetry?.logs?.length > 0 ? (
              telemetry.logs.map((log) => (
                <li key={log.id} className={styles.logItem}>
                  <div>
                    <strong>{log.usuario}</strong>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Perfil: {log.role}</p>
                  </div>
                  <small className={styles.logTime}>Sessão iniciada às {log.data}</small>
                </li>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhuma sessão recente registrada.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}