'use client';

import styles from './ModalLiberacao.module.css';

export default function ModalLiberacao({
  releasingItem,
  setReleasingItem,
  regulationForm,
  setRegulationForm,
  handleReleaseDateChange,
  handleSelectQuotaType,
  handleConfirmRelease,
  setShowQuotaModal,
  setQuotaModalType,
  setQuotaModalYear,
  auxData
}) {
  if (!releasingItem) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContentLarge}>
        <div className={styles.modalHeader}>
          <h3>Liberar Paciente • Regulação de Exames</h3>
          <button 
            type="button" 
            onClick={() => setReleasingItem(null)} 
            className={styles.closeBtn}
          >
            ×
          </button>
        </div>

        <div className={styles.autoDataSection}>
          <h4 className={styles.modalSectionTitle}>Informações Automáticas do Paciente e Pedido</h4>
          
          <div className={styles.autoDataGrid}>
            <div className={styles.autoDataItem}>
              <label>Paciente</label>
              <span>{releasingItem.patientName}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Cartão SUS</label>
              <span>{releasingItem.susCard || 'Não informado'}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>CPF</label>
              <span>{releasingItem.cpf}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Data do Pedido</label>
              <span>{releasingItem.requestDate}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Procedimento</label>
              <span>[{releasingItem.examType}] - {releasingItem.procedure}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Classificação de Risco</label>
              <span className={`${styles.classBadge} ${styles[releasingItem.classification.toLowerCase()]}`}>
                {releasingItem.classification}
              </span>
            </div>

            <div className={styles.autoDataItem}>
              <label>UBS Solicitante</label>
              <span>{releasingItem.requestUbs}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Médico Solicitante</label>
              <span>{releasingItem.requestDoctor}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Data da Comunicação</label>
              <span>{releasingItem.communicationDate || 'Não preenchida'}</span>
            </div>

            <div className={styles.autoDataItem}>
              <label>Valor do Exame</label>
              <strong>R$ {releasingItem.estimatedCost.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirmRelease} className={styles.modalReleaseForm}>
          <h4 className={styles.modalSectionTitle}>Parâmetros de Autorização, Cota e Débito</h4>

          <div className={styles.releaseFieldsGrid}>
            <div className={styles.fieldGroup}>
              <label>Status da Solicitação *</label>
              <select 
                value={regulationForm.status} 
                onChange={(e) => setRegulationForm({ ...regulationForm, status: e.target.value })} 
                required
              >
                <option value="Liberado">Liberado (Confirmar Débito Financeiro)</option>
                <option value="Aguardando">Manter em Aguardando</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Data da Liberação *</label>
              <input 
                type="date" 
                value={regulationForm.releaseDate} 
                onChange={(e) => handleReleaseDateChange(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Tipo de Cota *</label>
              <select 
                value={regulationForm.quota} 
                onChange={(e) => handleSelectQuotaType(e.target.value)} 
                required
              >
                <option value="">-- Selecione o Tipo de Cota --</option>
                <option value="SUS">SUS</option>
                <option value="OCI">OCI</option>
                <option value="Credenciamento">Credenciamento</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Médico Regulador / Responsável *</label>
              <select 
                value={regulationForm.regulatorDoctorId} 
                onChange={(e) => setRegulationForm({ ...regulationForm, regulatorDoctorId: e.target.value })}
                required
              >
                <option value="">-- Selecione o Médico Regulador --</option>
                {auxData.medicos.filter(m => m.tipo === 'Regulador').map(m => (
                  <option key={m.id} value={m.id}>{m.nome} (CRM: {m.crm})</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Competência de Débito (Mês / Ano)</label>
              <div className={styles.monthYearDisplayBox}>
                <span>{regulationForm.quotaCompetenceMonth}/{regulationForm.quotaCompetenceYear}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setQuotaModalType(regulationForm.quota || 'OCI');
                    setQuotaModalYear(regulationForm.quotaCompetenceYear);
                    setShowQuotaModal(true);
                  }}
                  className={styles.openQuotaModalBtn}
                >
                  Consultar / Mudar Mês 📊
                </button>
              </div>
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Observação Geral</label>
              <textarea 
                rows="2" 
                placeholder="Insira observações adicionais..."
                value={regulationForm.generalObservation}
                onChange={(e) => setRegulationForm({ ...regulationForm, generalObservation: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={() => setReleasingItem(null)} 
              className={styles.secondaryBtn}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.approveBtn}>
              Confirmar e Liberar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}