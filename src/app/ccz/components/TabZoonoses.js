"use client";

import React, { useState } from "react";
import styles from "./TabZoonoses.module.css";

export default function TabZoonoses() {
  const [formData, setFormData] = useState({
    animalRelacionado: "",
    nomeDoenca: "",
    dataIdentificacao: "",
    grauRisco: "",
    riscoVida: "nao",
    formasContaminacao: "",
    periodoMonitoramento: "",
    responsavelMonitoramento: "",
    observacoes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar os dados do formulário para o backend ou processá-los conforme necessário.
    console.log("Dados do formulário enviados:", formData);
    // Resetar o formulário após o envio, se desejado
    setFormData({
      animalRelacionado: "",
      nomeDoenca: "",
      dataIdentificacao: "",
      grauRisco: "",
      riscoVida: "nao",
      formasContaminacao: "",
      periodoMonitoramento: "",
      responsavelMonitoramento: "",
      observacoes: "",
    });
  };
  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2>Cadastro de Zoonose</h2>
        <p>Registre casos de zoonoses para controle e monitoramento</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Seção: Dados do Caso */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>Dados do Caso</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col12}`}>
              <label>Animal Relacionado</label>
              <select
                name="animalRelacionado"
                value={formData.animalRelacionado}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o animal...</option>
                <option value="animal_1">Animal #001 - Sem tutor</option>
                <option value="animal_2">Animal #002 - Sem tutor</option>
                <option value="animal_3">Animal #003 - Sem tutor</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Nome da Doença / Zoonose</label>
              <input
                type="text"
                name="nomeDoenca"
                value={formData.nomeDoenca}
                onChange={handleChange}
                placeholder="Ex: Leishmaniose, Raiva..."
                required
              />
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Data da Identificação</label>
              <input
                type="date"
                name="dataIdentificacao"
                value={formData.dataIdentificacao}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Seção: Avaliação de Risco */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>Avaliação de Risco</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col6}`}>
              <label>Grau de Risco de Contaminação</label>
              <select
                name="grauRisco"
                value={formData.grauRisco}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="baixo">Baixo</option>
                <option value="moderado">Moderado</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Risco de Vida para Tutor/Pessoas?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="riscoVida"
                    value="nao"
                    checked={formData.riscoVida === "nao"}
                    onChange={handleChange}
                  />
                  Não
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="riscoVida"
                    value="sim"
                    checked={formData.riscoVida === "sim"}
                    onChange={handleChange}
                  />
                  Sim
                </label>
              </div>
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Formas de Contaminação da Doença</label>
              <input
                type="text"
                name="formasContaminacao"
                value={formData.formasContaminacao}
                onChange={handleChange}
                placeholder="Ex: Contato direto, secreções, vetor..."
              />
            </div>
          </div>
        </div>

        {/* Seção: Monitoramento */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4>Monitoramento</h4>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.col6}`}>
              <label>Solicitação de Acompanhamento</label>
              <select
                name="periodoMonitoramento"
                value={formData.periodoMonitoramento}
                onChange={handleChange}
              >
                <option value="">Selecione o período...</option>
                <option value="7_dias">7 dias</option>
                <option value="14_dias">14 dias</option>
                <option value="21_dias">21 dias</option>
                <option value="30_dias">30 dias</option>
                <option value="apos_alta">Após alta médica</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.col6}`}>
              <label>Responsável pelo Monitoramento</label>
              <input
                type="text"
                name="responsavelMonitoramento"
                value={formData.responsavelMonitoramento}
                onChange={handleChange}
                placeholder="Nome do agente/veterinário"
              />
            </div>

            <div className={`${styles.field} ${styles.col12}`}>
              <label>Observações</label>
              <textarea
                name="observacoes"
                rows={3}
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Histórico clínico, orientações passadas..."
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.primaryBtn}>
            Salvar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
