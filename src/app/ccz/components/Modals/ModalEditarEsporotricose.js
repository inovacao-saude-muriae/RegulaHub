"use client";

import { useState } from "react";
import styles from "./ModalEditarZoonose.module.css";

function toDateInput(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 10);
  }

  const dateString = String(value);
  const isoDate = dateString.match(/^\d{4}-\d{2}-\d{2}/);
  return isoDate ? isoDate[0] : "";
}

export default function ModalEditarEsporotricose({
  esporotricose,
  animais = [],
  onSave,
  onCancel,
  saving = false,
}) {
  const [formData, setFormData] = useState({
    animal_id: String(esporotricose?.animal_id || ""),
    numero_protocolo: esporotricose?.numero_protocolo || "",
    data_visita: toDateInput(esporotricose?.data_visita),
    fiscal_responsavel: esporotricose?.fiscal_responsavel || "",
    apresenta_lesoes: esporotricose?.apresenta_lesoes === "Não" ? "Não" : "Sim",
    descricao_lesoes: esporotricose?.descricao_lesoes || "",
    em_tratamento_continuo:
      esporotricose?.em_tratamento_continuo === "Não" ? "Não" : "Sim",
    profissional_servico_ref: esporotricose?.profissional_servico_ref || "",
    medicamentos_prescritos: esporotricose?.medicamentos_prescritos || "",
    interrupcao_tratamento:
      esporotricose?.interrupcao_tratamento === "Sim" ? "Sim" : "Não",
    retorno_veterinario:
      esporotricose?.retorno_veterinario === "Não" ? "Não" : "Sim",
    isolamento_domiciliar:
      esporotricose?.isolamento_domiciliar === "Não" ? "Não" : "Sim",
    observacoes_isolamento: esporotricose?.observacoes_isolamento || "",
    acesso_rua: esporotricose?.acesso_rua === "Sim" ? "Sim" : "Não",
    uso_epi: esporotricose?.uso_epi === "Não" ? "Não" : "Sim",
    quais_epis: esporotricose?.quais_epis || "",
    higienizacao_ambiente: esporotricose?.higienizacao_ambiente || "",
    outros_animais_residencia:
      esporotricose?.outros_animais_residencia === "Sim" ? "Sim" : "Não",
    outros_animais_descricao: esporotricose?.outros_animais_descricao || "",
    pessoas_com_lesoes:
      esporotricose?.pessoas_com_lesoes === "Sim" ? "Sim" : "Não",
    pessoas_lesoes_descricao: esporotricose?.pessoas_lesoes_descricao || "",
    conclusao_tecnica: esporotricose?.conclusao_tecnica || "",
    enc_acompanhamento_ccz: Boolean(esporotricose?.enc_acompanhamento_ccz),
    enc_notificacao_tutor: Boolean(esporotricose?.enc_notificacao_tutor),
    enc_ministerio_publico: Boolean(esporotricose?.enc_ministerio_publico),
    enc_outras_medidas: Boolean(esporotricose?.enc_outras_medidas),
    outras_medidas_descricao: esporotricose?.outras_medidas_descricao || "",
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
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
            <h2>Editar Vistoria de Esporotricose</h2>
            <p>Atualize os dados e parecer técnico do registro.</p>
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
          {/* Identificação */}
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
            Número do protocolo
            <input
              name="numero_protocolo"
              value={formData.numero_protocolo}
              onChange={handleChange}
            />
          </label>

          <label>
            Data da visita
            <input
              type="date"
              name="data_visita"
              value={formData.data_visita}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Fiscal responsável
            <input
              name="fiscal_responsavel"
              value={formData.fiscal_responsavel}
              onChange={handleChange}
            />
          </label>

          {/* Quadro Clínico */}
          <label>
            Apresenta lesões?
            <select
              name="apresenta_lesoes"
              value={formData.apresenta_lesoes}
              onChange={handleChange}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </label>

          <label>
            Tratamento contínuo?
            <select
              name="em_tratamento_continuo"
              value={formData.em_tratamento_continuo}
              onChange={handleChange}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </label>

          <label className={styles.fullWidth}>
            Descrição das lesões
            <textarea
              name="descricao_lesoes"
              rows={2}
              value={formData.descricao_lesoes}
              onChange={handleChange}
            />
          </label>

          <label>
            Profissional / Serviço de ref.
            <input
              name="profissional_servico_ref"
              value={formData.profissional_servico_ref}
              onChange={handleChange}
            />
          </label>

          <label>
            Medicamentos prescritos
            <input
              name="medicamentos_prescritos"
              value={formData.medicamentos_prescritos}
              onChange={handleChange}
            />
          </label>

          <label>
            Interrupção do tratamento?
            <select
              name="interrupcao_tratamento"
              value={formData.interrupcao_tratamento}
              onChange={handleChange}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>

          <label>
            Retorno veterinário?
            <select
              name="retorno_veterinario"
              value={formData.retorno_veterinario}
              onChange={handleChange}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </label>

          {/* Manejo e Biossegurança */}
          <label>
            Isolamento domiciliar?
            <select
              name="isolamento_domiciliar"
              value={formData.isolamento_domiciliar}
              onChange={handleChange}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </label>

          <label>
            Acesso à rua?
            <select
              name="acesso_rua"
              value={formData.acesso_rua}
              onChange={handleChange}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>

          <label>
            Uso de EPI?
            <select
              name="uso_epi"
              value={formData.uso_epi}
              onChange={handleChange}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </label>

          <label>
            Quais EPIs?
            <input
              name="quais_epis"
              value={formData.quais_epis}
              onChange={handleChange}
            />
          </label>

          <label className={styles.fullWidth}>
            Higienização do ambiente
            <input
              name="higienizacao_ambiente"
              value={formData.higienizacao_ambiente}
              onChange={handleChange}
            />
          </label>

          {/* Contactantes */}
          <label>
            Outros animais no local?
            <select
              name="outros_animais_residencia"
              value={formData.outros_animais_residencia}
              onChange={handleChange}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>

          <label>
            Pessoas com lesões?
            <select
              name="pessoas_com_lesoes"
              value={formData.pessoas_com_lesoes}
              onChange={handleChange}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>

          <label className={styles.fullWidth}>
            Descrição dos contactantes humanos/animais
            <input
              name="pessoas_lesoes_descricao"
              value={formData.pessoas_lesoes_descricao}
              onChange={handleChange}
              placeholder="Descreva sintomas em pessoas ou outros animais..."
            />
          </label>

          {/* Parecer Técnico */}
          <label className={styles.fullWidth}>
            Conclusão técnica
            <textarea
              name="conclusao_tecnica"
              rows={2}
              value={formData.conclusao_tecnica}
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
