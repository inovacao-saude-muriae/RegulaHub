"use client";

import { useState } from "react";
import styles from "./ModalEditarZoonose.module.css";

function toDateInput(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

export default function ModalEditarZoonose({
  zoonose,
  animais,
  onSave,
  onCancel,
  saving,
}) {
  const [formData, setFormData] = useState({
    animal_id: String(zoonose.animal_id || ""),
    doenca: zoonose.doenca || "",
    data_identificacao: toDateInput(zoonose.data_identificacao),
    grau_risco: zoonose.grau_risco || "",
    risco_vida: zoonose.risco_vida === "Sim" ? "Sim" : "Não",
    formas_contaminacao: zoonose.formas_contaminacao || "",
    periodo_monitoramento: zoonose.periodo_monitoramento || "",
    responsavel_monitoramento: zoonose.responsavel_monitoramento || "",
    observacao: zoonose.observacao || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <div>
            <h2>Editar zoonose</h2>
            <p>Atualize os dados do registro selecionado.</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className={styles.grid}>
          <label>
            Animal relacionado
            <select
              name="animal_id"
              value={formData.animal_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o animal...</option>
              {animais.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.nome || "Sem nome"} ({animal.id})
                </option>
              ))}
            </select>
          </label>
          <label>
            Doença / zoonose
            <input
              name="doenca"
              value={formData.doenca}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Data da identificação
            <input
              type="date"
              name="data_identificacao"
              value={formData.data_identificacao}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Grau de risco
            <select
              name="grau_risco"
              value={formData.grau_risco}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="baixo">Baixo</option>
              <option value="moderado">Moderado</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </label>
          <label>
            Risco de vida
            <select
              name="risco_vida"
              value={formData.risco_vida}
              onChange={handleChange}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>
          <label>
            Período de monitoramento
            <select
              name="periodo_monitoramento"
              value={formData.periodo_monitoramento}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="7_dias">7 dias</option>
              <option value="14_dias">14 dias</option>
              <option value="21_dias">21 dias</option>
              <option value="30_dias">30 dias</option>
              <option value="apos_alta">Após alta médica</option>
            </select>
          </label>
          <label>
            Formas de contaminação
            <input
              name="formas_contaminacao"
              value={formData.formas_contaminacao}
              onChange={handleChange}
            />
          </label>
          <label>
            Responsável pelo monitoramento
            <input
              name="responsavel_monitoramento"
              value={formData.responsavel_monitoramento}
              onChange={handleChange}
            />
          </label>
          <label className={styles.fullWidth}>
            Observações
            <textarea
              name="observacao"
              rows={3}
              value={formData.observacao}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
