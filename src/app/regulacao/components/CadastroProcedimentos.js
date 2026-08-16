"use client";

import { useState } from "react";
import styles from "./CadastroProcedimentos.module.css";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";
import { createProcedimento, updateProcedimento } from "../actions";

export default function TabCadastroProcedimentos({
  formProcedimento,
  setFormProcedimento,
  auxData = { procedimentos: [], tiposExame: [] },
  reloadData = () => {},
}) {
  const resetFormProcedimento = () => {
    setFormProcedimento({
      id: null,
      tipoExameId: "",
      nome: "",
      valor: "",
      search: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.searchSectionContainer}>
        <div className={styles.fieldGroup}>
          <label>Buscar Procedimento no Banco (Nome)</label>
          <div className={styles.searchActionRow}>
            <div className={styles.autocompleteWrapper}>
              <input
                type="text"
                value={formProcedimento.search || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const termLower = val.toLowerCase().trim();
                  let sugestoes = [];
                  if (termLower.length >= 2) {
                    sugestoes = (auxData.procedimentos || []).filter((p) =>
                      p.nome.toLowerCase().includes(termLower)
                    );
                  }
                  setFormProcedimento((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (formProcedimento.sugestoes && formProcedimento.sugestoes.length > 0) {
                      const p = formProcedimento.sugestoes[0];
                      setFormProcedimento({
                        id: p.id,
                        tipoExameId: p.tipoExameId,
                        nome: p.nome,
                        valor: p.valor,
                        search: p.nome,
                        sugestoes: [],
                        showSugestoes: false,
                        isEditing: true,
                        isFormActive: true,
                      });
                      return;
                    }
                    const term = (formProcedimento.search || "").toLowerCase().trim();
                    const encontrado = auxData.procedimentos?.find((p) => p.nome.toLowerCase().includes(term));
                    if (encontrado) {
                      setFormProcedimento({
                        id: encontrado.id,
                        tipoExameId: encontrado.tipoExameId,
                        nome: encontrado.nome,
                        valor: encontrado.valor,
                        search: encontrado.nome,
                        sugestoes: [],
                        showSugestoes: false,
                        isEditing: true,
                        isFormActive: true,
                      });
                    } else alert("Procedimento não encontrado.");
                  }
                }}
                placeholder="Digite o Nome do procedimento..."
              />

              {formProcedimento.showSugestoes && formProcedimento.sugestoes && formProcedimento.sugestoes.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {formProcedimento.sugestoes.map((p) => (
                    <li
                      key={p.id}
                      onClick={() =>
                        setFormProcedimento({
                          id: p.id,
                          tipoExameId: p.tipoExameId,
                          nome: p.nome,
                          valor: p.valor,
                          search: p.nome,
                          sugestoes: [],
                          showSugestoes: false,
                          isEditing: true,
                          isFormActive: true,
                        })
                      }
                    >
                      <strong>{p.nome}</strong> — R$ {Number(p.valor).toFixed(2)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
              title="Buscar Procedimento"
              onClick={() => {
                if (formProcedimento.sugestoes && formProcedimento.sugestoes.length > 0) {
                  const p = formProcedimento.sugestoes[0];
                  setFormProcedimento({
                    id: p.id,
                    tipoExameId: p.tipoExameId,
                    nome: p.nome,
                    valor: p.valor,
                    search: p.nome,
                    sugestoes: [],
                    showSugestoes: false,
                    isEditing: true,
                    isFormActive: true,
                  });
                  return;
                }
                const term = (formProcedimento.search || "").toLowerCase().trim();
                const encontrado = auxData.procedimentos?.find((p) => p.nome.toLowerCase().includes(term));
                if (encontrado) {
                  setFormProcedimento({
                    id: encontrado.id,
                    tipoExameId: encontrado.tipoExameId,
                    nome: encontrado.nome,
                    valor: encontrado.valor,
                    search: encontrado.nome,
                    sugestoes: [],
                    showSugestoes: false,
                    isEditing: true,
                    isFormActive: true,
                  });
                } else alert("Procedimento não encontrado.");
              }}
            >
              <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
            </button>

            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
              title="Adicionar Novo Procedimento"
              onClick={() => {
                resetFormProcedimento();
                setFormProcedimento((prev) => ({ ...prev, isFormActive: true }));
              }}
            >
              <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
            </button>

            {(formProcedimento.isFormActive || formProcedimento.isEditing) && (
              <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormProcedimento}>
                <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
              </button>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (formProcedimento.isEditing) {
            const res = await updateProcedimento(formProcedimento.id, formProcedimento);
            if (res.success) {
              alert("Procedimento atualizado com sucesso!");
              reloadData();
            } else alert("Erro ao atualizar: " + res.error);
          } else {
            const res = await createProcedimento(formProcedimento);
            if (res.success) {
              alert("Procedimento cadastrado com sucesso!");
              reloadData();
            } else alert("Erro ao salvar: " + res.error);
          }
          resetFormProcedimento();
        }}
        className={styles.patientFormContainer}
      >
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>Informações do Procedimento</h4>
          </div>
          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colTipoExame}`}>
              <label>Tipo de Exame *</label>
              <select
                value={formProcedimento.tipoExameId}
                onChange={(e) => setFormProcedimento({ ...formProcedimento, tipoExameId: e.target.value })}
                disabled={!formProcedimento.isFormActive}
                required
              >
                <option value="">-- Selecione o Tipo de Exame --</option>
                {auxData.tiposExame?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.fieldGroup} ${styles.colProcName}`}>
              <label>Nome do Procedimento *</label>
              <input
                type="text"
                value={formProcedimento.nome}
                onChange={(e) => setFormProcedimento({ ...formProcedimento, nome: e.target.value })}
                disabled={!formProcedimento.isFormActive}
                required
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colValor}`}>
              <label>Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formProcedimento.valor}
                onChange={(e) => setFormProcedimento({ ...formProcedimento, valor: e.target.value })}
                disabled={!formProcedimento.isFormActive}
                required
              />
            </div>
          </div>
        </div>

        {formProcedimento.isFormActive && (
          <div className={styles.formActions}>
            <button type="submit" className={formProcedimento.isEditing ? styles.updateBtn : styles.primaryBtn}>
              {formProcedimento.isEditing ? "Atualizar Procedimento" : "Salvar Procedimento"}
            </button>
          </div>
        )}
      </form>

      <div className={styles.tableFilterContainer}>
        <div className={styles.tableHeaderFilterRow}>
          <h4 className={styles.tableSectionTitle}>Procedimentos Cadastrados</h4>
          <div className={styles.filterGroup}>
            <label>Filtrar por Tipo de Exame:</label>
            <select
              value={formProcedimento.filterTipoExameId || ""}
              onChange={(e) =>
                setFormProcedimento((prev) => ({
                  ...prev,
                  filterTipoExameId: e.target.value,
                }))
              }
              className={styles.filterSelect}
            >
              <option value="">-- Todos os Tipos de Exames --</option>
              {auxData.tiposExame?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Procedimento</th>
                <th>Tipo de Exame</th>
                <th className={styles.alignRight}>Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {auxData.procedimentos
                ?.filter((p) =>
                  formProcedimento.filterTipoExameId
                    ? String(p.tipoExameId) === String(formProcedimento.filterTipoExameId)
                    : true
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nome}</strong>
                    </td>
                    <td>{p.tipoExameNome}</td>
                    <td className={styles.alignRight}>R$ {Number(p.valor).toFixed(2)}</td>
                  </tr>
                ))}

              {auxData.procedimentos?.filter((p) =>
                formProcedimento.filterTipoExameId
                  ? String(p.tipoExameId) === String(formProcedimento.filterTipoExameId)
                  : true
              ).length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyTableTd}>
                    Nenhum procedimento encontrado para o tipo selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}