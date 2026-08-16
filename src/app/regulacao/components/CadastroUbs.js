"use client";

import { useState } from "react";
import styles from "./CadastroUbs.module.css";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";
import { createUbs, updateUbs, deleteUbs } from "../actions";

export default function TabCadastroUbs({
  formUbs,
  setFormUbs,
  auxData = { ubsList: [] },
  reloadData = () => {},
}) {
  const [deleteConfig, setDeleteConfig] = useState(null);

  const resetFormUbs = () => {
    setFormUbs({
      id: null,
      nome: "",
      cnes: "",
      search: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

  const carregarUbsParaEdicao = (u) => {
    setFormUbs({
      id: u.id,
      nome: u.nome,
      cnes: u.cnes,
      search: `${u.nome} (CNES: ${u.cnes})`,
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
          <label>Buscar Unidade no Banco (CNES ou Nome)</label>
          <div className={styles.searchActionRow}>
            <div className={styles.autocompleteWrapper}>
              <input
                type="text"
                value={formUbs.search || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const termLower = val.toLowerCase().trim();
                  let sugestoes = [];
                  if (termLower.length >= 2) {
                    sugestoes = (auxData.ubsList || []).filter(
                      (u) => u.nome.toLowerCase().includes(termLower) || u.cnes.includes(termLower)
                    );
                  }
                  setFormUbs((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (formUbs.sugestoes && formUbs.sugestoes.length > 0) {
                      carregarUbsParaEdicao(formUbs.sugestoes[0]);
                      return;
                    }
                    const term = (formUbs.search || "").toLowerCase().trim();
                    const encontrado = auxData.ubsList?.find(
                      (u) => u.nome.toLowerCase().includes(term) || u.cnes.includes(term)
                    );
                    if (encontrado) carregarUbsParaEdicao(encontrado);
                    else alert("Unidade de saúde não encontrada.");
                  }
                }}
                placeholder="Digite o CNES ou Nome da UBS..."
              />

              {formUbs.showSugestoes && formUbs.sugestoes && formUbs.sugestoes.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {formUbs.sugestoes.map((u) => (
                    <li key={u.id} onClick={() => carregarUbsParaEdicao(u)}>
                      <strong>{u.nome}</strong> — CNES: {u.cnes}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
              title="Buscar UBS"
              onClick={() => {
                if (formUbs.sugestoes && formUbs.sugestoes.length > 0) {
                  carregarUbsParaEdicao(formUbs.sugestoes[0]);
                  return;
                }
                const term = (formUbs.search || "").toLowerCase().trim();
                const encontrado = auxData.ubsList?.find(
                  (u) => u.nome.toLowerCase().includes(term) || u.cnes.includes(term)
                );
                if (encontrado) carregarUbsParaEdicao(encontrado);
                else alert("Unidade de saúde não encontrada.");
              }}
            >
              <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
            </button>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
              title="Adicionar Nova UBS"
              onClick={() => {
                resetFormUbs();
                setFormUbs((prev) => ({ ...prev, isFormActive: true }));
              }}
            >
              <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
            </button>

            {formUbs.isEditing && (
              <button
                type="button"
                className={`${styles.iconSquareBtn} ${styles.btnRed}`}
                title="Excluir UBS"
                onClick={() =>
                  setDeleteConfig({
                    tipo: "UBS",
                    nome: formUbs.nome,
                    detalhe: `CNES: ${formUbs.cnes}`,
                    onConfirm: async () => {
                      const res = await deleteUbs(formUbs.id);
                      if (res.success) {
                        alert("UBS removida com sucesso!");
                        reloadData();
                        resetFormUbs();
                      } else alert("Erro ao excluir: " + res.error);
                    },
                  })
                }
              >
                <img src="/img/icon/excluir.png" alt="Excluir" className={styles.iconImg} />
              </button>
            )}

            {(formUbs.isFormActive || formUbs.isEditing) && (
              <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormUbs}>
                <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
              </button>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (formUbs.isEditing) {
            const res = await updateUbs(formUbs.id, formUbs);
            if (res.success) {
              alert("Dados da UBS atualizados com sucesso!");
              reloadData();
            } else alert("Erro ao atualizar: " + res.error);
          } else {
            const res = await createUbs(formUbs);
            if (res.success) {
              alert("UBS cadastrada com sucesso!");
              reloadData();
            } else alert("Erro ao salvar: " + res.error);
          }
          resetFormUbs();
        }}
        className={styles.patientFormContainer}
      >
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>Dados da Unidade</h4>
          </div>
          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colUbsName}`}>
              <label>Nome da Unidade / UBS *</label>
              <input
                type="text"
                value={formUbs.nome}
                onChange={(e) => setFormUbs({ ...formUbs, nome: e.target.value })}
                disabled={!formUbs.isFormActive}
                required
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colCnes}`}>
              <label>Código CNES *</label>
              <input
                type="text"
                value={formUbs.cnes}
                onChange={(e) => setFormUbs({ ...formUbs, cnes: e.target.value })}
                disabled={!formUbs.isFormActive}
                required
              />
            </div>
          </div>
        </div>

        {formUbs.isFormActive && (
          <div className={styles.formActions}>
            <button type="submit" className={formUbs.isEditing ? styles.updateBtn : styles.primaryBtn}>
              {formUbs.isEditing ? "Atualizar UBS" : "Salvar UBS"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}