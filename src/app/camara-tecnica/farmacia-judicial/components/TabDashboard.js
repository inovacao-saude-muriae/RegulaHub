'use client';

import styles from './TabDashboard.module.css';

export default function TabDashboard({ 
  metrics = {}, 
  onNavigate, 
  loading, 
  medicamentosList = [] 
}) {
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
            <strong className={styles.kpiValue}>
              {metrics.totalMedicamentosCadastrados ?? medicamentosList.length}
            </strong>
            <small>No catálogo geral</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.emeraldCard}`}>
          <div className={styles.kpiIcon}>📦</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Itens em Estoque</span>
            <strong className={styles.kpiValue}>
              {(metrics.totalEstoqueUnidades || 0).toLocaleString('pt-BR')}
            </strong>
            <small>Unidades físicas disp.</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.greenCard}`}>
          <div className={styles.kpiIcon}>👤</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pacientes Ativos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesAtivos || 0}</strong>
            <small>Em acompanhamento</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.amberCard}`}>
          <div className={styles.kpiIcon}>⏸️</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pacientes Inativos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesInativos || 0}</strong>
            <small>Processos suspensos</small>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.slateCard}`}>
          <div className={styles.kpiIcon}>🕊️</div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Óbitos</span>
            <strong className={styles.kpiValue}>{metrics.pacientesObito || 0}</strong>
            <small>Registrados</small>
          </div>
        </div>
      </div>

      {/* TABELA DE MEDICAMENTOS E QUANTIDADES EM ESTOQUE */}
      <div className={styles.tableSectionCard}>
        <div className={styles.tableHeaderBar}>
          <h3>Catálogo de Medicamentos e Estoque Atual</h3>
          <span className={styles.tableBadgeCount}>
            Total: {medicamentosList.length} itens
          </span>
        </div>

        {medicamentosList.length === 0 ? (
          <div className={styles.emptyState}>Nenhum medicamento cadastrado no momento.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.medTable}>
              <thead>
                <tr>
                  <th>Código / ID</th>
                  <th>Nome do Medicamento / Descrição</th>
                  <th>Dosagem / Apresentação</th>
                  <th style={{ textAlign: 'right' }}>Qtd. em Estoque</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicamentosList.map((med, index) => {
                  // Mapeamento abrangente de propriedades de estoque
                  const estoqueAtual = 
                    med.qtdAtual ?? 
                    med.quantidadeEmEstoque ?? 
                    med.qtdEstoque ?? 
                    med.quantidade ?? 
                    med.estoque ?? 
                    0;

                  const isLowStock = Number(estoqueAtual) <= (med.estoqueMinimo || 5);
                  const keyId = med.id || med.codigo || `med-${index}`;

                  return (
                    <tr key={keyId}>
                      <td>
                        <strong>#{med.id || med.codigo || index + 1}</strong>
                      </td>
                      <td>
                        <div className={styles.medName}>
                          {med.nome || med.nomeMedicamento || med.descricao}
                        </div>
                        {med.principioAtivo && (
                          <small className={styles.medSubText}>Princípio: {med.principioAtivo}</small>
                        )}
                      </td>
                      <td>{med.dosagem || med.apresentacao || med.tipo || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={styles.stockQuantity}>
                          {Number(estoqueAtual).toLocaleString('pt-BR')} {med.unidadeMedida || 'un'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {Number(estoqueAtual) === 0 ? (
                          <span className={`${styles.statusBadge} ${styles.dangerBadge}`}>Sem Estoque</span>
                        ) : isLowStock ? (
                          <span className={`${styles.statusBadge} ${styles.warningBadge}`}>Estoque Baixo</span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.successBadge}`}>Em Dia</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}