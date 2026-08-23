"use client";

import React, { useState, useEffect } from "react";
import styles from "./Esporotricose.module.css";
import { salvarEsporotricoseAction } from "../actions";

const initialFormState = {
  animal_id: "",
  numero_protocolo: "",
  data_visita: new Date().toISOString().split("T")[0],
  fiscal_responsavel: "",
  apresenta_lesoes: "Sim",
  descricao_lesoes: "",
  em_tratamento_continuo: "Sim",
  profissional_servico_ref: "",
  medicamentos_prescritos: "",
  interrupcao_tratamento: "Não",
  retorno_veterinario: "Sim",
  isolamento_domiciliar: "Sim",
  observacoes_isolamento: "",
  acesso_rua: "Não",
  uso_epi: "Sim",
  quais_epis: "",
  higienizacao_ambiente: "",
  outros_animais_residencia: "Não",
  outros_animais_descricao: "",
  pessoas_com_lesoes: "Não",
  pessoas_lesoes_descricao: "",
  conclusao_tecnica: "",
  enc_acompanhamento_ccz: false,
  enc_notificacao_tutor: false,
  enc_ministerio_publico: false,
  enc_outras_medidas: false,
  outras_medidas_descricao: "",
};

export default function TabEsporotricose({
  animais = [],
  registroEdicao = null,
  onCancel,
  onSaveSuccess,
  reloadData,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (registroEdicao) {
      const dataFormatada = registroEdicao.data_visita
        ? new Date(registroEdicao.data_visita).toISOString().split("T")[0]
        : initialFormState.data_visita;

      setFormData({
        ...initialFormState,
        ...registroEdicao,
        data_visita: dataFormatada,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [registroEdicao]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await salvarEsporotricoseAction(
        formData,
        registroEdicao?.id || null,
      );

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.error || "Não foi possível salvar o registro.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: registroEdicao
          ? "Registro atualizado com sucesso."
          : "Registro salvo com sucesso.",
      });
      setFormData(initialFormState);
      reloadData?.();
      onSaveSuccess?.(result);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Não foi possível salvar o registro.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          {registroEdicao
            ? "Editar Caso de Esporotricose"
            : "Ficha de Notificação e Vistoria - Esporotricose"}
        </h2>
        <p>
          Acompanhamento sanitário, condições de isolamento e encaminhamentos
          técnicos
        </p>
      </div>

      {message && (
        <p
          className={
            message.type === "error"
              ? styles.errorMessage
              : styles.successMessage
          }
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Dados da Vistoria */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>1. Identificação e Visita</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col6}`}>
              <label>Animal Relacionado</label>
              <select
                name="animal_id"
                value={formData.animal_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o animal...</option>
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome || "Sem nome"} (ID: {a.id})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.col3}`}>
              <label>Número do Protocolo</label>
              <input
                type="text"
                name="numero_protocolo"
                value={formData.numero_protocolo}
                onChange={handleChange}
                placeholder="Ex: PROT-2026/01"
              />
            </div>

            <div className={`${styles.field} ${styles.col3}`}>
              <label>Data da Visita</label>
              <input
                type="date"
                name="data_visita"
                value={formData.data_visita}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Fiscal / Agente Responsável</label>
              <input
                type="text"
                name="fiscal_responsavel"
                value={formData.fiscal_responsavel}
                onChange={handleChange}
                placeholder="Nome do fiscal que realizou a visita"
              />
            </div>
          </div>
        </div>

        {/* Quadro Clínico e Tratamento */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>2. Quadro Clínico e Tratamento</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col4}`}>
              <label>Apresenta Lesões Ativas?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="apresenta_lesoes"
                    value="Sim"
                    checked={formData.apresenta_lesoes === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="apresenta_lesoes"
                    value="Não"
                    checked={formData.apresenta_lesoes === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col4}`}>
              <label>Tratamento Contínuo?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="em_tratamento_continuo"
                    value="Sim"
                    checked={formData.em_tratamento_continuo === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="em_tratamento_continuo"
                    value="Não"
                    checked={formData.em_tratamento_continuo === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col4}`}>
              <label>Houve Interrupção?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="interrupcao_tratamento"
                    value="Sim"
                    checked={formData.interrupcao_tratamento === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="interrupcao_tratamento"
                    value="Não"
                    checked={formData.interrupcao_tratamento === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Descrição das Lesões</label>
              <textarea
                name="descricao_lesoes"
                value={formData.descricao_lesoes}
                onChange={handleChange}
                placeholder="Localização anatômica, quantidade de feridas, aspecto ulcerativo..."
              />
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Profissional / Serviço de Referência</label>
              <input
                type="text"
                name="profissional_servico_ref"
                value={formData.profissional_servico_ref}
                onChange={handleChange}
                placeholder="Clínica / Veterinário particular ou CCZ"
              />
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Retorno Veterinário Agendado?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="retorno_veterinario"
                    value="Sim"
                    checked={formData.retorno_veterinario === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="retorno_veterinario"
                    value="Não"
                    checked={formData.retorno_veterinario === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Medicamentos Prescritos</label>
              <input
                type="text"
                name="medicamentos_prescritos"
                value={formData.medicamentos_prescritos}
                onChange={handleChange}
                placeholder="Ex: Itraconazol 100mg, Pomadas, Antibióticos..."
              />
            </div>
          </div>
        </div>

        {/* Manejo, Isolamento e Biossegurança */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>3. Manejo, Isolamento e Biossegurança</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col4}`}>
              <label>Isolamento Domiciliar?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="isolamento_domiciliar"
                    value="Sim"
                    checked={formData.isolamento_domiciliar === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="isolamento_domiciliar"
                    value="Não"
                    checked={formData.isolamento_domiciliar === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col4}`}>
              <label>Acesso à Rua?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="acesso_rua"
                    value="Sim"
                    checked={formData.acesso_rua === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="acesso_rua"
                    value="Não"
                    checked={formData.acesso_rua === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col4}`}>
              <label>Tutor Utiliza EPI?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="uso_epi"
                    value="Sim"
                    checked={formData.uso_epi === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="uso_epi"
                    value="Não"
                    checked={formData.uso_epi === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Quais EPIs são utilizados?</label>
              <input
                type="text"
                name="quais_epis"
                value={formData.quais_epis}
                onChange={handleChange}
                placeholder="Ex: Luvas de procedimento, máscara..."
              />
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Observações do Isolamento</label>
              <input
                type="text"
                name="observacoes_isolamento"
                value={formData.observacoes_isolamento}
                onChange={handleChange}
                placeholder="Cômodo fechado, caixa de transporte, sem telas..."
              />
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Higienização do Ambiente</label>
              <input
                type="text"
                name="higienizacao_ambiente"
                value={formData.higienizacao_ambiente}
                onChange={handleChange}
                placeholder="Produtos utilizados (ex: hipoclorito de sódio), frequência..."
              />
            </div>
          </div>
        </div>

        {/* Avaliação de Contactantes */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>4. Outros Contactantes (Animais e Pessoas)</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col4}`}>
              <label>Outros Animais no Local?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="outros_animais_residencia"
                    value="Sim"
                    checked={formData.outros_animais_residencia === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="outros_animais_residencia"
                    value="Não"
                    checked={formData.outros_animais_residencia === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div
              className={`${styles.field} ${styles.col12} ${styles.descriptionField}`}
            >
              <label>Descrição dos Animais Contactantes</label>
              <textarea
                name="outros_animais_descricao"
                value={formData.outros_animais_descricao}
                onChange={handleChange}
                placeholder="Espécies, quantidade, se algum apresenta sintomas..."
              />
            </div>

            <div className={`${styles.field} ${styles.col4}`}>
              <label>Pessoas com Lesões?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="pessoas_com_lesoes"
                    value="Sim"
                    checked={formData.pessoas_com_lesoes === "Sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="pessoas_com_lesoes"
                    value="Não"
                    checked={formData.pessoas_com_lesoes === "Não"}
                    onChange={handleChange}
                  />
                  Não
                </label>
              </div>
            </div>

            <div
              className={`${styles.field} ${styles.col12} ${styles.descriptionField}`}
            >
              <label>Descrição das Pessoas / Sintomas</label>
              <textarea
                name="pessoas_lesoes_descricao"
                value={formData.pessoas_lesoes_descricao}
                onChange={handleChange}
                placeholder="Parentesco, orientação para UBS/Dermatologia..."
              />
            </div>
          </div>
        </div>

        {/* Conclusão Técnica e Encaminhamentos */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>5. Conclusão Técnica e Encaminhamentos</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col12}`}>
              <label>Conclusão Técnica / Parecer do Fiscal</label>
              <textarea
                name="conclusao_tecnica"
                rows={3}
                value={formData.conclusao_tecnica}
                onChange={handleChange}
                placeholder="Parecer final da vistoria técnica sanitária..."
              />
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Medidas Adotadas / Encaminhamentos</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="enc_acompanhamento_ccz"
                    checked={formData.enc_acompanhamento_ccz}
                    onChange={handleChange}
                  />
                  Acompanhamento Periódico CCZ
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="enc_notificacao_tutor"
                    checked={formData.enc_notificacao_tutor}
                    onChange={handleChange}
                  />
                  Notificação Formal do Tutor
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="enc_ministerio_publico"
                    checked={formData.enc_ministerio_publico}
                    onChange={handleChange}
                  />
                  Encaminhamento Ministério Público
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="enc_outras_medidas"
                    checked={formData.enc_outras_medidas}
                    onChange={handleChange}
                  />
                  Outras Medidas
                </label>
              </div>
            </div>

            {formData.enc_outras_medidas && (
              <div className={`${styles.field} ${styles.col12}`}>
                <label>Descrição das Outras Medidas</label>
                <input
                  type="text"
                  name="outras_medidas_descricao"
                  value={formData.outras_medidas_descricao}
                  onChange={handleChange}
                  placeholder="Especifique as outras medidas adotadas..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className={styles.formActions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.secondaryBtn}
            >
              Cancelar
            </button>
          )}
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving
              ? "Salvando..."
              : registroEdicao
                ? "Salvar Alterações"
                : "Registrar Notificação"}
          </button>
        </div>
      </form>
    </div>
  );
}
