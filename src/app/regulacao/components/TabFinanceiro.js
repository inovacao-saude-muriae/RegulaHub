'use client';

import styles from './TabFinanceiro.module.css';

export default function TabFinanceiro({
  finMonth,
  setFinMonth,
  finYear,
  setFinYear,
  MONTHS_LIST,
  calculateMonthQuotaDetails,
  handleOpenDefineTetoModal
}) {
  return (
    <div className={styles.financeContainer}>
      <div className={`${styles.card} ${styles.financeHeaderCard}`}>
        <h2 className={styles.cardTitle}>Painel de Controle Financeiro de Cotas</h2>
        <p>Selecione a competência para visualizar limites, gastos e saldos restantes de cada cota:</p>

        <div className={styles.financeFiltersRow}>
          <div className={styles.fieldGroup}>
            <label>Mês de Competência:</label>
            <select value={finMonth} onChange={(e) => setFinMonth(e.target.value)}>
              {MONTHS_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name} ({m.value})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Ano de Competência:</label>
            <select value={finYear} onChange={(e) => setFinYear(e.target.value)}>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.financeCardsGrid}>
        {['SUS', 'Credenciamento', 'OCI'].map((tipoCota) => {
          const details = calculateMonthQuotaDetails(tipoCota, finYear, finMonth);

          return (
            <div key={tipoCota} className={`${styles.card} ${styles.financeQuotaCard}`}>
              <div className={styles.financeCardHeader}>
                <h3>Cota: {tipoCota}</h3>
                <button
                  type="button"
                  onClick={() => handleOpenDefineTetoModal(tipoCota, details.totalLimit)}
                  className={styles.smallActionBtn}
                >
                  ✏ Editar Teto
                </button>
              </div>

              <div className={styles.financeCardBody}>
                <div>
                  <small className={styles.mutedText}>
                    Teto Disponível para {finMonth}/{finYear}:
                  </small>
                  <div className={styles.amountTotal}>
                    R$ {details.totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <small className={styles.mutedText}>Total Debitado (Liberados no Mês):</small>
                  <div className={styles.amountSpent}>
                    R$ {details.totalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className={styles.balanceDivider}>
                  <small className={styles.mutedText}>Saldo Restante:</small>
                  <div className={details.available >= 0 ? styles.positiveText : styles.negativeText}>
                    R$ {details.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}