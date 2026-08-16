"use client";

import { useState } from "react";
import styles from "./CadastroMedicos.module.css";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";
import { createMedico, updateMedico, deleteMedico } from "../actions";

export default function TabCadastroMedicos({
  formMedico,
  setFormMedico,
  auxData = { medicos: [] },
  reloadData = () => {},
}) {
  const [deleteConfig, setDeleteConfig] = useState(null);

  const resetFormMedico = () => {
    setFormMedico({
      id: null,
      nome: "",
      crm: "",
      ufCrm: "MG",
      especialidade: "",
      search: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

  const carregarMedicoParaEdicao = (m) => {
    setFormMedico({
      id: m.id,
      nome: m.nome,
      crm: m.crm,
      ufCrm: m.ufCrm || "MG",
      especialidade: m.especialidade || "",
      search: `${m.nome} (CRM: ${m.crm})`,
      sugestoes: [],
      showSugestoes: false,
      isEditing: true,
      isFormActive: true,
    });
  };

  return (
    <div className={styles.card}>
      <ModalConfirmacaoExclusao
        config={deleteConfig}
        onConfirm={() => {
          if (deleteConfig?.onConfirm) deleteConfig.onConfirm();
          setDeleteConfig(null);
        }}
        onCancel={() => setDeleteConfig(null)}
      />

      <div className={styles.searchSectionContainer}>
        <div className={styles.fieldGroup}>
          <label>Buscar Médico no Banco (CRM ou Nome)</label>
          <div className={styles.searchActionRow}>
            <div className={styles.autocompleteWrapper}>
              <input
                type="text"
                value={formMedico.search || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const termLower = val.toLowerCase().trim();
                  let sugestoes = [];
                  if (termLower.length >= 2) {
                    sugestoes = (auxData.medicos || []).filter(
                      (m) => m.nome.toLowerCase().includes(termLower) || m.crm.includes(termLower)
                    );
                  }
                  setFormMedico((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (formMedico.sugestoes && formMedico.sugestoes.length > 0) {
                      carregarMedicoParaEdicao(formMedico.sugestoes[0]);
                      return;
                    }
                    const term = (formMedico.search || "").toLowerCase().trim();
                    const encontrado = auxData.medicos?.find(
                      (m) => m.nome.toLowerCase().includes(term) || m.crm.includes(term)
                    );
                    if (encontrado) carregarMedicoParaEdicao(encontrado);
                    else alert("Médico não encontrado.");
                  }
                }}
                placeholder="Digite o CRM ou Nome do médico..."
              />

              {formMedico.showSugestoes && formMedico.sugestoes && formMedico.sugestoes.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {formMedico.sugestoes.map((m) => (
                    <li key={m.id} onClick={() => carregarMedicoParaEdicao(m)}>
                      <strong>{m.nome}</strong> — CRM: {m.crm}/{m.ufCrm}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
              title="Buscar Médico"
              onClick={() => {
                if (formMedico.sugestoes && formMedico.sugestoes.length > 0) {
                  carregarMedicoParaEdicao(formMedico.sugestoes[0]);
                  return;
                }
                const term = (formMedico.search || "").toLowerCase().trim();
                const encontrado = auxData.medicos?.find(
                  (m) => m.nome.toLowerCase().includes(term) || m.crm.includes(term)
                );
                if (encontrado) carregarMedicoParaEdicao(encontrado);
                else alert("Médico não encontrado.");
              }}
            >
              <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
            </button>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
              title="Adicionar Novo Médico"
              onClick={() => {
                resetFormMedico();
                setFormMedico((prev) => ({ ...prev, isFormActive: true }));
              }}
            >
              <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
            </button>

            {formMedico.isEditing && (
              <button
                type="button"
                className={`${styles.iconSquareBtn} ${styles.btnRed}`}
                title="Excluir Médico"
                onClick={() =>
                  setDeleteConfig({
                    tipo: "MEDICO",
                    nome: formMedico.nome,
                    detalhe: `CRM: ${formMedico.crm}`,
                    onConfirm: async () => {
                      const res = await deleteMedico(formMedico.id);
                      if (res.success) {
                        alert("Médico removido com sucesso!");
                        reloadData();
                        resetFormMedico();
                      } else alert("Erro ao excluir: " + res.error);
                    },
                  })
                }
              >
                <img src="/img/icon/excluir.png" alt="Excluir" className={styles.iconImg} />
              </button>
            )}

            {(formMedico.isFormActive || formMedico.isEditing) && (
              <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormMedico}>
                <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
              </button>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (formMedico.isEditing) {
            const res = await updateMedico(formMedico.id, formMedico);
            if (res.success) {
              alert("Dados do médico atualizados com sucesso!");
              reloadData();
            } else alert("Erro ao atualizar: " + res.error);
          } else {
            const res = await createMedico(formMedico);
            if (res.success) {
              alert("Médico cadastrado com sucesso!");
              reloadData();
            } else alert("Erro ao salvar: " + res.error);
          }
          resetFormMedico();
        }}
        className={styles.patientFormContainer}
      >
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>Dados Profissionais</h4>
          </div>
          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Nome do Médico *</label>
              <input
                type="text"
                value={formMedico.nome}
                onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
                disabled={!formMedico.isFormActive}
                required
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colCrm}`}>
              <label>CRM *</label>
              <input
                type="text"
                value={formMedico.crm}
                onChange={(e) => setFormMedico({ ...formMedico, crm: e.target.value })}
                disabled={!formMedico.isFormActive}
                required
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colUfCrm}`}>
              <label>UF CRM *</label>
              <input
                type="text"
                value={formMedico.ufCrm}
                onChange={(e) => setFormMedico({ ...formMedico, ufCrm: e.target.value })}
                maxLength={2}
                disabled={!formMedico.isFormActive}
                required
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colEspecialidade}`}>
              <label>Especialidade</label>
              <input
                type="text"
                value={formMedico.especialidade}
                onChange={(e) => setFormMedico({ ...formMedico, especialidade: e.target.value })}
                disabled={!formMedico.isFormActive}
              />
            </div>
          </div>
        </div>

        {formMedico.isFormActive && (
          <div className={styles.formActions}>
            <button type="submit" className={formMedico.isEditing ? styles.updateBtn : styles.primaryBtn}>
              {formMedico.isEditing ? "Atualizar Médico" : "Salvar Médico"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}