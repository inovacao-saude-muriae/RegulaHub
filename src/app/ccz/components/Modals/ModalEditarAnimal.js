"use client";

import { useState } from "react";
import styles from "./ModalEditarAnimal.module.css";

const ESPECIES = ["Cão", "Gato"];
const SEXOS = [
  { label: "Macho", value: "M" },
  { label: "Fêmea", value: "F" },
  { label: "Não identificado", value: "I" },
];
const PORTES = ["Pequeno", "Médio", "Grande", "Gigante"];
const SIM_NAO = ["Sim", "Não"];

function getInitialForm(animal) {
  return {
    id: animal.id || "",
    possui_responsavel:
      animal.possui_responsavel ||
      (animal.tutorCpf || animal.pessoa_cpf ? "Sim" : "Não"),
    tutorCpf: animal.tutorCpf || animal.pessoa_cpf || "",
    nome: animal.nome || "",
    fotoUrl: animal.fotoUrl || "",
    especie: animal.especie || "",
    sexo: (animal.sexo || "M").charAt(0).toUpperCase(),
    porte: animal.porte || "Médio",
    idade: animal.idade || "",
    castrado: animal.castrado || "Não",
    doenca_cronica: animal.doenca_cronica || "Não",
    sintomas_vomito_diarreia: animal.sintomas_vomito_diarreia || "Não",
    apetite_normal: animal.apetite_normal || "Sim",
    em_tratamento: animal.em_tratamento || "Não",
    qual_tratamento: animal.qual_tratamento || "",
    observacoes: animal.observacoes || "",
    endereco_recolhimento: animal.endereco_recolhimento || "",
  };
}

export default function ModalEditarAnimal({
  animal,
  tutores,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => getInitialForm(animal));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Selecione uma imagem de até 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateField("fotoUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    if (!form.possui_responsavel || !form.especie) {
      setError("Informe se o animal possui responsável e selecione a espécie.");
      return;
    }
    if (form.possui_responsavel === "Sim" && !form.tutorCpf) {
      setError("Selecione o tutor responsável pelo animal.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await onSave({
        ...form,
        tutorCpf: form.possui_responsavel === "Sim" ? form.tutorCpf : "",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onCancel();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-animal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="edit-animal-title">Editar animal</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Fechar"
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>ID do animal</label>
            <input value={form.id} disabled />
          </div>
          <div className={styles.field}>
            <label>Possui responsável?</label>
            <select
              value={form.possui_responsavel}
              onChange={(e) =>
                updateField("possui_responsavel", e.target.value)
              }
              required
            >
              <option value="">-- Selecione --</option>
              {SIM_NAO.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          {form.possui_responsavel === "Sim" && (
            <div className={styles.field}>
              <label>Tutor / Responsável</label>
              <select
                value={form.tutorCpf}
                onChange={(e) => updateField("tutorCpf", e.target.value)}
                required
              >
                <option value="">-- Selecione --</option>
                {tutores.map((tutor) => (
                  <option key={tutor.cpf} value={tutor.cpf}>
                    {tutor.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.field}>
            <label>Nome do animal</label>
            <input
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Espécie</label>
            <select
              value={form.especie}
              onChange={(e) => updateField("especie", e.target.value)}
              required
            >
              <option value="">-- Selecione --</option>
              {ESPECIES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Sexo</label>
            <select
              value={form.sexo}
              onChange={(e) => updateField("sexo", e.target.value)}
            >
              {SEXOS.map((sex) => (
                <option key={sex.value} value={sex.value}>
                  {sex.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Porte</label>
            <select
              value={form.porte}
              onChange={(e) => updateField("porte", e.target.value)}
            >
              {PORTES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Idade estimada</label>
            <input
              value={form.idade}
              onChange={(e) => updateField("idade", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Foto do animal</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {form.fotoUrl && (
              <img
                src={form.fotoUrl}
                alt="Pré-visualização do animal"
                className={styles.preview}
              />
            )}
          </div>
          {[
            ["castrado", "Castrado(a)?"],
            ["doenca_cronica", "Doença crônica?"],
            ["sintomas_vomito_diarreia", "Sintomas de vômito/diarreia?"],
            ["apetite_normal", "Apetite normal?"],
            ["em_tratamento", "Em tratamento?"],
          ].map(([field, label]) => (
            <div className={styles.field} key={field}>
              <label>{label}</label>
              <select
                value={form[field]}
                onChange={(e) => updateField(field, e.target.value)}
              >
                {SIM_NAO.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          ))}
          {form.em_tratamento === "Sim" && (
            <div className={styles.field}>
              <label>Qual tratamento?</label>
              <input
                value={form.qual_tratamento}
                onChange={(e) => updateField("qual_tratamento", e.target.value)}
              />
            </div>
          )}
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label>Endereço de recolhimento / localização</label>
            <input
              value={form.endereco_recolhimento}
              onChange={(e) =>
                updateField("endereco_recolhimento", e.target.value)
              }
            />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label>Observações</label>
            <textarea
              rows={3}
              value={form.observacoes}
              onChange={(e) => updateField("observacoes", e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
