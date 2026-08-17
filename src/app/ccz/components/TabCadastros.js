"use client";

import { useState } from "react";
import s from "./shared.module.css";
import ModalConfirmacaoCCZ from "./Modals/ModalConfirmacaoCCZ";
import {
  createTutor,
  updateTutor,
  deleteTutor,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../actions";

// ── Máscaras ──────────────────────────────────────────────────────────────
function maskCpf(v) {
  if (!v) return "";
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskTel(v) {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}
function maskCep(v) {
  if (!v) return "";
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}
function onlyDigits(v) {
  return v ? v.replace(/\D/g, "") : "";
}
function formatDate(d) {
  if (!d) return "-";
  const str = d instanceof Date ? d.toISOString() : String(d);
  const parts = str.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str;
}

// ── Forms vazios ──────────────────────────────────────────────────────────
const EMPTY_TUTOR = {
  cpf: "",
  nomeCompleto: "",
  telefone: "",
  email: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "Muriaé",
  uf: "MG",
  cep: "",
};
const EMPTY_ANIMAL = {
  tutorId: "",
  nome: "",
  especie: "",
  raca: "",
  sexo: "",
  cor: "",
  dataNascimento: "",
  observacao: "",
};

const ESPECIES = ["Cão", "Gato"];
const SEXOS = ["Macho", "Fêmea"];

// ─────────────────────────────────────────────────────────────────────────
export default function TabCadastros({
  tutores = [],
  animais = [],
  reloadData,
}) {
  const [subTab, setSubTab] = useState("TUTORES");

  // ── Tutores ───────────────────────────────────────────────────────────
  const [tutorForm, setTutorForm] = useState(EMPTY_TUTOR);
  const [editingTutorId, setEditingTutorId] = useState(null);

  // ── Animais ───────────────────────────────────────────────────────────
  const [animalForm, setAnimalForm] = useState(EMPTY_ANIMAL);
  const [editingAnimalId, setEditingAnimalId] = useState(null);

  // ── Modal exclusão ────────────────────────────────────────────────────
  const [deleteConfig, setDeleteConfig] = useState(null);

  // ── TUTOR: handlers ───────────────────────────────────────────────────
  const handleEditTutor = (t) => {
    setEditingTutorId(t.id);
    setTutorForm({
      cpf: t.cpf ? maskCpf(t.cpf) : "",
      nomeCompleto: t.nomeCompleto || "",
      telefone: t.telefone ? maskTel(t.telefone) : "",
      email: t.email || "",
      logradouro: t.logradouro || "",
      numero: t.numero || "",
      complemento: t.complemento || "",
      bairro: t.bairro || "",
      cidade: t.cidade || "Muriaé",
      uf: t.uf || "MG",
      cep: t.cep ? maskCep(t.cep) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitTutor = async (e) => {
    e.preventDefault();
    if (!tutorForm.nomeCompleto) return alert("Preencha o Nome Completo.");
    const payload = {
      ...tutorForm,
      cpf: onlyDigits(tutorForm.cpf) || null,
      telefone: onlyDigits(tutorForm.telefone) || null,
      cep: onlyDigits(tutorForm.cep) || null,
    };
    const res = editingTutorId
      ? await updateTutor(editingTutorId, payload)
      : await createTutor(payload);
    if (res.success) {
      alert(editingTutorId ? "Tutor atualizado!" : "Tutor cadastrado!");
      setTutorForm(EMPTY_TUTOR);
      setEditingTutorId(null);
      reloadData();
    } else {
      alert("Erro: " + res.error);
    }
  };

  // ── ANIMAL: handlers ──────────────────────────────────────────────────
  const handleEditAnimal = (a) => {
    setEditingAnimalId(a.id);
    const dateStr = a.dataNascimento
      ? (a.dataNascimento instanceof Date
          ? a.dataNascimento
          : new Date(a.dataNascimento)
        )
          .toISOString()
          .split("T")[0]
      : "";
    setAnimalForm({
      tutorId: String(a.tutorId),
      nome: a.nome || "",
      especie: a.especie || "",
      raca: a.raca || "",
      sexo: a.sexo || "",
      cor: a.cor || "",
      dataNascimento: dateStr,
      observacao: a.observacao || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitAnimal = async (e) => {
    e.preventDefault();
    if (!animalForm.tutorId || !animalForm.especie)
      return alert("Selecione o Tutor e a Espécie.");
    const res = editingAnimalId
      ? await updateAnimal(editingAnimalId, animalForm)
      : await createAnimal(animalForm);
    if (res.success) {
      alert(editingAnimalId ? "Animal atualizado!" : "Animal cadastrado!");
      setAnimalForm(EMPTY_ANIMAL);
      setEditingAnimalId(null);
      reloadData();
    } else {
      alert("Erro: " + res.error);
    }
  };

  return (
    <div className={s.card}>
      <ModalConfirmacaoCCZ
        config={deleteConfig}
        onConfirm={() => {
          if (deleteConfig?.onConfirm) deleteConfig.onConfirm();
          setDeleteConfig(null);
        }}
        onCancel={() => setDeleteConfig(null)}
      />

      {/* Sub-nav */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "1.5rem",
          paddingBottom: "0.5rem",
        }}
      >
        {[
          {
            key: "TUTORES",
            label: `👤 Tutores / Responsáveis (${tutores.length})`,
          },
          { key: "ANIMAIS", label: `🐾 Animais (${animais.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSubTab(tab.key)}
            style={{
              background: subTab === tab.key ? "#eff6ff" : "transparent",
              color: subTab === tab.key ? "#2563eb" : "#64748b",
              border: "none",
              padding: "0.55rem 1.1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ABA TUTORES ───────────────────────────────────────────────── */}
      {subTab === "TUTORES" && (
        <>
          <h3>
            {editingTutorId
              ? "✏️ Editar Tutor / Responsável"
              : "➕ Cadastrar Novo Tutor / Responsável"}
          </h3>
          <form onSubmit={handleSubmitTutor} className={s.formGrid}>
            <div className={s.fieldGroup}>
              <label>Nome Completo *</label>
              <input
                type="text"
                value={tutorForm.nomeCompleto}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, nomeCompleto: e.target.value })
                }
                placeholder="Ex: João da Silva"
                required
              />
            </div>
            <div className={s.fieldGroup}>
              <label>CPF</label>
              <input
                type="text"
                value={tutorForm.cpf}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, cpf: maskCpf(e.target.value) })
                }
                placeholder="000.000.000-00"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Telefone / WhatsApp</label>
              <input
                type="text"
                value={tutorForm.telefone}
                onChange={(e) =>
                  setTutorForm({
                    ...tutorForm,
                    telefone: maskTel(e.target.value),
                  })
                }
                placeholder="(32) 99999-0000"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>E-mail</label>
              <input
                type="email"
                value={tutorForm.email}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, email: e.target.value })
                }
                placeholder="Ex: joao@email.com"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Bairro</label>
              <input
                type="text"
                value={tutorForm.bairro}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, bairro: e.target.value })
                }
                placeholder="Ex: Centro"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Logradouro</label>
              <input
                type="text"
                value={tutorForm.logradouro}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, logradouro: e.target.value })
                }
                placeholder="Ex: Rua das Flores"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Número</label>
              <input
                type="text"
                value={tutorForm.numero}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, numero: e.target.value })
                }
                placeholder="Ex: 100"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Complemento</label>
              <input
                type="text"
                value={tutorForm.complemento}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, complemento: e.target.value })
                }
                placeholder="Ex: Apto 2"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>CEP</label>
              <input
                type="text"
                value={tutorForm.cep}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, cep: maskCep(e.target.value) })
                }
                placeholder="00000-000"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Cidade</label>
              <input
                type="text"
                value={tutorForm.cidade}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, cidade: e.target.value })
                }
              />
            </div>
            <div className={s.fieldGroup}>
              <label>UF</label>
              <input
                type="text"
                value={tutorForm.uf}
                onChange={(e) =>
                  setTutorForm({ ...tutorForm, uf: e.target.value })
                }
                maxLength={2}
                placeholder="MG"
              />
            </div>
            <div className={s.formActions}>
              {editingTutorId && (
                <button
                  type="button"
                  className={s.secondaryBtn}
                  onClick={() => {
                    setTutorForm(EMPTY_TUTOR);
                    setEditingTutorId(null);
                  }}
                >
                  Cancelar
                </button>
              )}
              <button type="submit" className={s.primaryBtn}>
                {editingTutorId ? "💾 Atualizar Tutor" : "➕ Salvar Tutor"}
              </button>
            </div>
          </form>

          <h4 className={s.sectionHeader}>Tutores Cadastrados</h4>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Bairro</th>
                  <th>Animais</th>
                  <th className={s.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tutores.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "2rem",
                      }}
                    >
                      Nenhum tutor cadastrado.
                    </td>
                  </tr>
                )}
                {tutores.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.nomeCompleto}</strong>
                    </td>
                    <td>
                      {t.cpf ? (
                        maskCpf(t.cpf)
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </td>
                    <td>
                      {t.telefone ? (
                        maskTel(t.telefone)
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </td>
                    <td>
                      {t.bairro || <span style={{ color: "#94a3b8" }}>-</span>}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          borderRadius: "6px",
                          padding: "0.15rem 0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {animais.filter((a) => a.tutorId === t.id).length}
                      </span>
                    </td>
                    <td className={s.actionsCell}>
                      <button
                        className={s.editBtn}
                        onClick={() => handleEditTutor(t)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={s.deleteBtn}
                        onClick={() =>
                          setDeleteConfig({
                            nome: t.nomeCompleto,
                            detalhe: t.cpf
                              ? `CPF: ${maskCpf(t.cpf)}`
                              : "Sem CPF cadastrado",
                            onConfirm: async () => {
                              const res = await deleteTutor(t.id);
                              if (res.success) {
                                alert("Tutor removido!");
                                reloadData();
                              } else alert("Erro: " + res.error);
                            },
                          })
                        }
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ABA ANIMAIS ───────────────────────────────────────────────── */}
      {subTab === "ANIMAIS" && (
        <>
          <h3>
            {editingAnimalId ? "✏️ Editar Animal" : "➕ Cadastrar Novo Animal"}
          </h3>
          <form onSubmit={handleSubmitAnimal} className={s.formGrid}>
            <div className={s.fieldGroup}>
              <label>Tutor / Responsável *</label>
              <select
                value={animalForm.tutorId}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, tutorId: e.target.value })
                }
                required
              >
                <option value="">-- Selecione o Tutor --</option>
                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.fieldGroup}>
              <label>Nome do Animal</label>
              <input
                type="text"
                value={animalForm.nome}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, nome: e.target.value })
                }
                placeholder="Ex: Rex"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Espécie *</label>
              <select
                value={animalForm.especie}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, especie: e.target.value })
                }
                required
              >
                <option value="">-- Selecione --</option>
                {ESPECIES.map((e2) => (
                  <option key={e2} value={e2}>
                    {e2}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.fieldGroup}>
              <label>Raça</label>
              <input
                type="text"
                value={animalForm.raca}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, raca: e.target.value })
                }
                placeholder="Ex: Labrador"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Sexo</label>
              <select
                value={animalForm.sexo}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, sexo: e.target.value })
                }
              >
                <option value="">-- Selecione --</option>
                {SEXOS.map((sx) => (
                  <option key={sx} value={sx}>
                    {sx}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.fieldGroup}>
              <label>Cor / Pelagem</label>
              <input
                type="text"
                value={animalForm.cor}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, cor: e.target.value })
                }
                placeholder="Ex: Caramelo"
              />
            </div>
            <div className={s.fieldGroup}>
              <label>Data de Nascimento</label>
              <input
                type="date"
                value={animalForm.dataNascimento}
                onChange={(e) =>
                  setAnimalForm({
                    ...animalForm,
                    dataNascimento: e.target.value,
                  })
                }
              />
            </div>
            <div className={`${s.fieldGroup} ${s.fullWidth}`}>
              <label>Observação</label>
              <textarea
                rows={2}
                value={animalForm.observacao}
                onChange={(e) =>
                  setAnimalForm({ ...animalForm, observacao: e.target.value })
                }
                placeholder="Histórico de saúde, comportamento, etc."
              />
            </div>
            <div className={s.formActions}>
              {editingAnimalId && (
                <button
                  type="button"
                  className={s.secondaryBtn}
                  onClick={() => {
                    setAnimalForm(EMPTY_ANIMAL);
                    setEditingAnimalId(null);
                  }}
                >
                  Cancelar
                </button>
              )}
              <button type="submit" className={s.primaryBtn}>
                {editingAnimalId ? "💾 Atualizar Animal" : "➕ Salvar Animal"}
              </button>
            </div>
          </form>

          <h4 className={s.sectionHeader}>Animais Cadastrados</h4>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Espécie / Raça</th>
                  <th>Sexo</th>
                  <th>Tutor</th>
                  <th>Nasc.</th>
                  <th className={s.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {animais.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "2rem",
                      }}
                    >
                      Nenhum animal cadastrado.
                    </td>
                  </tr>
                )}
                {animais.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>
                        {a.nome || (
                          <span style={{ color: "#94a3b8" }}>Sem nome</span>
                        )}
                      </strong>
                      {a.cor && (
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {a.cor}
                        </div>
                      )}
                    </td>
                    <td>
                      {a.especie}
                      {a.raca && (
                        <span style={{ color: "#64748b" }}> / {a.raca}</span>
                      )}
                    </td>
                    <td>
                      {a.sexo || <span style={{ color: "#94a3b8" }}>-</span>}
                    </td>
                    <td>{a.tutor?.nomeCompleto || "-"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {formatDate(a.dataNascimento)}
                    </td>
                    <td className={s.actionsCell}>
                      <button
                        className={s.editBtn}
                        onClick={() => handleEditAnimal(a)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={s.deleteBtn}
                        onClick={() =>
                          setDeleteConfig({
                            nome:
                              a.nome ||
                              `${a.especie} de ${a.tutor?.nomeCompleto}`,
                            detalhe: `Tutor: ${a.tutor?.nomeCompleto || "-"} • Espécie: ${a.especie}`,
                            onConfirm: async () => {
                              const res = await deleteAnimal(a.id);
                              if (res.success) {
                                alert("Animal removido!");
                                reloadData();
                              } else alert("Erro: " + res.error);
                            },
                          })
                        }
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
