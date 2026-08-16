"use client";

import styles from "./LiberarPedido.module.css";
import ModalSeletorCotas from "./Modals/ModalSeletorCotas";

export default function LiberarPedido({
  releasingItem,
  regulationForm,
  setRegulationForm,
  auxData,
  handleSelectQuotaType,
  handleReleaseDateChange,
  handleConfirmRelease,
  onBack,
  showQuotaModal,
  setShowQuotaModal,
  quotaModalType,
  quotaModalYear,
  setQuotaModalYear,
  handleSelectMonthFromModal,
  calculateMonthQuotaDetails,
}) {
  if (!releasingItem) return null;

  return (
    <div className={styles.card}>
      {/* MODAL SELETOR DE COMPETÊNCIA DA COTA */}
      {showQuotaModal && (
        <ModalSeletorCotas
          open={showQuotaModal}
          onClose={() => setShowQuotaModal(false)}
          tipoCota={quotaModalType}
          anoAtual={quotaModalYear}
          setAnoAtual={setQuotaModalYear}
          onSelectMonth={handleSelectMonthFromModal}
          calculateMonthQuotaDetails={calculateMonthQuotaDetails}
          defaultMonth={regulationForm.quotaCompetenceMonth}
        />
      )}

      {/* CABEÇALHO DA TELA */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>
            Liberar Exame do Paciente: {releasingItem.patientName}
          </h2>
          <p className={styles.subtitle}>
            Código de Regulação: <strong>#{releasingItem.id}</strong> | Data de Entrada:{" "}
            {releasingItem.requestDate}
          </p>
        </div>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onBack}
        >
          ← Voltar para a Fila
        </button>
      </div>

      <form onSubmit={handleConfirmRelease} className={styles.patientFormContainer}>
        {/* SEÇÃO 1: INFORMAÇÕES DO PEDIDO (SOMENTE LEITURA / CONSULTA) */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>1. Informações do Pedido (Consulta)</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Nome do Paciente</label>
              <input type="text" value={releasingItem.patientName || ""} disabled readOnly />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
              <label>CPF</label>
              <input type="text" value={releasingItem.cpf || ""} disabled readOnly />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colMother}`}>
              <label>Nome da Mãe</label>
              <input
                type="text"
                value={releasingItem.motherName || "Não informada"}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colProcedure}`}>
              <label>Procedimento / Exame</label>
              <input
                type="text"
                value={`${releasingItem.procedure || ""} (R$ ${Number(releasingItem.estimatedCost || 0).toFixed(2)})`}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colRisk}`}>
              <label>Classificação de Risco</label>
              <input type="text" value={releasingItem.classification || "Verde"} disabled readOnly />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colDoctor}`}>
              <label>Médico Solicitante</label>
              <input
                type="text"
                value={releasingItem.requestDoctor || "Não informado"}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colUbs}`}>
              <label>UBS Solicitante</label>
              <input
                type="text"
                value={releasingItem.requestUbs || "Não informada"}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Justificativa Clínica Inicial</label>
              <textarea
                rows={2}
                value={releasingItem.justification || "Sem justificativa cadastrada."}
                disabled
                readOnly
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: DADOS DA AUTORIZAÇÃO E COTA (EDITÁVEIS) */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>2. Dados da Autorização e Cota</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colStatus}`}>
              <label>Status do Pedido *</label>
              <select
                value={regulationForm.status}
                onChange={(e) => setRegulationForm({ ...regulationForm, status: e.target.value })}
                required
              >
                <option value="Liberado">Liberado</option>
                <option value="Aguardando">Aguardando (Manter na Fila)</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Devolvido">Devolvido</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colRisk}`}>
              <label>Tipo de Cota *</label>
              <select
                value={regulationForm.quota}
                onChange={(e) => handleSelectQuotaType(e.target.value)}
                required
              >
                <option value="">-- Selecione a Cota --</option>
                <option value="OCI">OCI</option>
                <option value="SUS">SUS</option>
                <option value="PPI">PPI</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
              <label>Data de Liberação *</label>
              <input
                type="date"
                value={regulationForm.releaseDate}
                onChange={(e) => handleReleaseDateChange(e.target.value)}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Médico Regulador / Responsável</label>
              <select
                value={regulationForm.regulatorDoctorId}
                onChange={(e) =>
                  setRegulationForm({ ...regulationForm, regulatorDoctorId: e.target.value })
                }
              >
                <option value="">-- Selecione o Médico Regulador --</option>
                {auxData.medicos?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} (CRM: {m.crm})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Observação Geral de Liberação</label>
              <textarea
                rows={3}
                value={regulationForm.generalObservation}
                onChange={(e) =>
                  setRegulationForm({ ...regulationForm, generalObservation: e.target.value })
                }
                placeholder="Digite observações sobre a autorização do exame..."
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryBtn} onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className={styles.updateBtn}>
            Confirmar Liberação
          </button>
        </div>
      </form>
    </div>
  );
}