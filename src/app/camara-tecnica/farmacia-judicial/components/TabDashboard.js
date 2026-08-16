'use client';

import styles from './TabDashboard.module.css';

export default function TabDashboard({ metrics, onNavigate, loading }) {
  if (loading) {
    return <div className={styles.loadingBox}>Carregando estatísticas do sistema...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* SEÇÃO DE CARDS DE INDICADORES */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.blueCard}`}>
          <div className={styles.kpiIcon}>💊</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Medicamentos Cadastrados</span>
            <strong className={styles.kpiValue}>{metrics.totalMedicamentosCadastrados}</strong>
            <small>No catálogo geral</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.emeraldCard}`}>
          <div className={styles.kpiIcon}>📦</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Itens em Estoque</span>
            <strong className={styles.kpiValue}>
              {metrics.totalEstoqueUnidades.toLocaleString('pt-BR')}
            </strong>
            <small>Unidades físicas disp.</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.greenCard}`}>
          <div className={styles.kpiIcon}>👤</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pacientes Ativos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesAtivos}</strong>
            <small>Em acompanhamento</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.amberCard}`}>
          <div className={styles.kpiIcon}>⏸️</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pacientes Inativos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesInativos}</strong>
            <small>Processos suspensos</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.slateCard}`}>
          <div className={styles.kpiIcon}>🕊️</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Óbitos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesObito}</strong>
            <small>Registrados</small>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE ATALHOS RÁPIDOS */}
      <div className={styles.quickActionsCard}>
        <h3>Atalhos e Ações Rápidas</h3>
        <div className={styles.actionButtonsRow}>
          <button type="button" onClick={() => onNavigate('DISPENSACAO')} className={styles.actionBtnPrimary}>
            ➕ Nova Dispensação
          </button>
          <button type="button" onClick={() => onNavigate('PACIENTES')} className={styles.actionBtnSecondary}>
            📋 Cadastrar Novo Paciente / Processo
          </button>
          <button type="button" onClick={() => onNavigate('ESTOQUE')} className={styles.actionBtnSecondary}>
            📥 Dar Entrada de Lote
          </button>
          <button type="button" onClick={() => onNavigate('RELATORIOS')} className={styles.actionBtnSecondary}>
            📊 Ver Relatório de Movimentação
          </button>
        </div>
      </div>
    </div>
  );
}