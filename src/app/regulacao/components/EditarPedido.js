"use client";

import { useState } from "react";
import styles from "./EditarPedido.module.css";

export default function EditarPedido({
  editingItem,
  setEditingItem,
  auxData,
  handleEditStatusChange,
  handleSaveEditedOrder,
  onBack,
}) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!editingItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleSaveEditedOrder) {
      await handleSaveEditedOrder(e);
    }
    // Exibe o modal elegante de sucesso
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onBack(); // Retorna automaticamente para a fila
  };

  return (
    <div className={styles.card}>
      {/* MODAL ELEGANTE DE SUCESSO */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIcon}>✓</div>
            </div>

            <h3 className={styles.modalTitle}>Alteração Realizada!</h3>
            <p className={styles.modalDescription}>
              As informações do pedido <strong>#{editingItem.id}</strong> do paciente{" "}
              <strong>{editingItem.patientName}</strong> foram atualizadas com sucesso.
            </p>

            <button
              type="button"
              className={styles.modalConfirmBtn}
              onClick={handleCloseSuccessModal}
            >
              Voltar para a Fila
            </button>
          </div>
        </div>
      )}

      {/* CABEÇALHO DA TELA */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>
            Editar Pedido de Regulação #{editingItem.id}
          </h2>
          <p className={styles.subtitle}>
            Alteração de status, procedimentos e dados da solicitação médica
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

      <form onSubmit={handleSubmit} className={styles.patientFormContainer}>
        {/* SEÇÃO 1: IDENTIFICAÇÃO DO PACIENTE (SOMENTE LEITURA) */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>1. Identificação do Paciente (Consulta)</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Nome do Paciente</label>
              <input
                type="text"
                value={editingItem.patientName || ""}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
              <label>CPF</label>
              <input
                type="text"
                value={editingItem.cpf || ""}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colMother}`}>
              <label>Nome da Mãe</label>
              <input
                type="text"
                value={editingItem.motherName || "Não informada"}
                disabled
                readOnly
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colSus}`}>
              <label>Cartão SUS</label>
              <input
                type="text"
                value={editingItem.susCard || "Não informado"}
                disabled
                readOnly
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: DADOS DO EXAME E SOLICITAÇÃO (EDITÁVEL) */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>2. Detalhes do Exame e Solicitação</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colStatus}`}>
              <label>Status do Pedido *</label>
              <select
                value={editingItem.status || "Aguardando"}
                onChange={(e) => handleEditStatusChange(e.target.value)}
                required
              >
                <option value="Aguardando">Aguardando (Volta para Fila)</option>
                <option value="Liberado">Liberado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Devolvido">Devolvido</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colProcedure}`}>
              <label>Procedimento / Exame *</label>
              <select
                value={editingItem.procedureId || ""}
                onChange={(e) => {
                  const procId = Number(e.target.value);
                  const foundProc = auxData.procedimentos?.find((p) => p.id === procId);
                  setEditingItem({
                    ...editingItem,
                    procedureId: procId,
                    procedure: foundProc ? foundProc.nome : editingItem.procedure,
                    estimatedCost: foundProc ? foundProc.valor : editingItem.estimatedCost,
                  });
                }}
                required
              >
                <option value="">-- Selecione o Procedimento --</option>
                {auxData.procedimentos?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (R$ {Number(p.valor).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colRisk}`}>
              <label>Classificação de Risco *</label>
              <select
                value={editingItem.classification || "Verde"}
                onChange={(e) => setEditingItem({ ...editingItem, classification: e.target.value })}
                required
              >
                <option value="Verde">Verde (Eletivo)</option>
                <option value="Amarelo">Amarelo (Prioritário)</option>
                <option value="Vermelho">Vermelho (Urgente)</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colDoctor}`}>
              <label>Médico Solicitante</label>
              <select
                value={editingItem.medicoSolicitanteId || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, medicoSolicitanteId: e.target.value })
                }
              >
                <option value="">-- Selecione o Médico Solicitante --</option>
                {auxData.medicos
                  ?.filter((m) => m.tipo !== "Regulador")
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} (CRM: {m.crm})
                    </option>
                  ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colUbs}`}>
              <label>UBS Solicitante</label>
              <select
                value={editingItem.ubsResponsavelId || ""}
                onChange={(e) => setEditingItem({ ...editingItem, ubsResponsavelId: e.target.value })}
              >
                <option value="">-- Selecione a UBS --</option>
                {auxData.ubsList?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} (CNES: {u.cnes})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Observação / Justificativa Clínica</label>
              <textarea
                rows={3}
                value={editingItem.justification || editingItem.observacao || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    justification: e.target.value,
                    observacao: e.target.value,
                  })
                }
                placeholder="Descreva o motivo da alteração..."
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryBtn} onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className={styles.updateBtn}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}