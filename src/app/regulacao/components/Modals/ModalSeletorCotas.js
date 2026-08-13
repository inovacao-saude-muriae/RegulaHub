'use client';



export default function ModalSeletorCotas({
  showQuotaModal,
  setShowQuotaModal,
  quotaModalType,
  setQuotaModalType,
  quotaModalYear,
  setQuotaModalYear,
  MONTHS_LIST,
  calculateMonthQuotaDetails,
  regulationForm,
  releasingItem,
  handleSelectMonthFromModal
}) {
  if (!showQuotaModal) return null;

  return (
    <div className={styles.modalOverlayQuota}>
      <div className={styles.modalContentQuota}>
        <div className={styles.modalHeader}>
          <div>
            <h3>Consulta de Cotas Mensais e Saldos</h3>
            <p>
              Cota selecionada: <strong>{quotaModalType}</strong>. Escolha a competência para o débito:
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowQuotaModal(false)} 
            className={styles.closeBtn}
          >
            ×
          </button>
        </div>

        <div className={styles.quotaModalFilterRow}>
          <div className={styles.fieldItem}>
            <label>Tipo de Cota</label>
            <select value={quotaModalType} onChange={(e) => setQuotaModalType(e.target.value)}>
              <option value="SUS">SUS</option>
              <option value="OCI">OCI</option>
              <option value="Credenciamento">Credenciamento</option>
            </select>
          </div>

          <div className={styles.fieldItem}>
            <label>Ano da Competência</label>
            <select value={quotaModalYear} onChange={(e) => setQuotaModalYear(e.target.value)}>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapperModal}>
          <table className={styles.tableModal}>
            <thead>
              <tr>
                <th>Mês / Competência</th>
                <th>Teto Mensal</th>
                <th>Acumulado Utilizado</th>
                <th>Saldo Restante</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS_LIST.map((m) => {
                const details = calculateMonthQuotaDetails(quotaModalType, quotaModalYear, m.value);
                const isSelected = 
                  regulationForm.quota === quotaModalType &&
                  regulationForm.quotaCompetenceMonth === m.value &&
                  regulationForm.quotaCompetenceYear === quotaModalYear;

                return (
                  <tr key={m.value} className={isSelected ? styles.selectedQuotaRow : ''}>
                    <td>
                      <strong>{m.name} ({m.value}/{quotaModalYear})</strong>
                    </td>
                    <td>R$ {details.totalLimit.toFixed(2)}</td>
                    <td>R$ {details.totalUsed.toFixed(2)}</td>
                    <td>
                      <strong className={details.available >= (releasingItem?.estimatedCost || 0) ? styles.positiveText : styles.negativeText}>
                        R$ {details.available.toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className={styles.selectMonthBtn}
                        onClick={() => handleSelectMonthFromModal(m.value)}
                      >
                        {isSelected ? 'Mês Selecionado' : 'Selecionar Mês'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={() => setShowQuotaModal(false)} 
            className={styles.primaryBtn}
          >
            Concluir Seleção
          </button>
        </div>
      </div>
    </div>
  );
}