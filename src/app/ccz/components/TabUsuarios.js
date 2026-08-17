"use client";

import { useState } from "react";
import s from "./shared.module.css";
import ts from "./TabUsuarios.module.css";
import ModalConfirmacaoCCZ from "./Modals/ModalConfirmacaoCCZ";
import { createTutor, updateTutor, deleteTutor } from "../actions";

// ── Máscaras ─────────────────────────────────────────────────────────────
function maskCpf(v) {
  if (!v) return "";
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskTel(v) {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}
function maskCep(v) {
  if (!v) return "";
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}
function onlyDigits(v) { return v ? v.replace(/\D/g, "") : ""; }

const EMPTY_FORM = {
  nomeCompleto: "", cpf: "", telefone: "", email: "",
  logradouro: "", numero: "", complemento: "", bairro: "",
  cidade: "Muriaé", uf: "MG", cep: "",
  search: "", sugestoes: [], showSugestoes: false,
  isEditing: false, isFormActive: false,
};

export default function TabUsuarios({ tutores = [], animais = [], reloadData }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [deleteConfig, setDeleteConfig] = useState(null);

  const resetForm = () => setForm(EMPTY_FORM);

  const carregarTutorParaEdicao = (t) => {
    setForm({
      nomeCompleto: t.nomeCompleto || "",
      cpf:          t.cpf ? maskCpf(t.cpf) : "",
      telefone:     t.telefone ? maskTel(t.telefone) : "",
      email:        t.email || "",
      logradouro:   t.logradouro || "",
      numero:       t.numero || "",
      complemento:  t.complemento || "",
      bairro:       t.bairro || "",
      cidade:       t.cidade || "Muriaé",
      uf:           t.uf || "MG",
      cep:          t.cep ? maskCep(t.cep) : "",
      // controle interno
      _id:          t.id,
      search:       `${t.nomeCompleto}${t.cpf ? ` (${maskCpf(t.cpf)})` : ""}`,
      sugestoes: [], showSugestoes: false,
      isEditing: true, isFormActive: true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (val) => {
    const low     = val.toLowerCase().trim();
    const digits  = onlyDigits(val);
    const sugestoes = low.length < 2 ? [] : tutores.filter((t) => {
      const nomeLow = (t.nomeCompleto || "").toLowerCase();
      const cpfDig  = onlyDigits(t.cpf || "");
      return nomeLow.includes(low) || (digits && cpfDig.includes(digits));
    });
    setForm((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
  };

  const handleSearchConfirm = () => {
    if (form.sugestoes.length > 0) { carregarTutorParaEdicao(form.sugestoes[0]); return; }
    const low    = (form.search || "").toLowerCase().trim();
    const digits = onlyDigits(form.search);
    const found  = tutores.find((t) => {
      const nomeLow = (t.nomeCompleto || "").toLowerCase();
      const cpfDig  = onlyDigits(t.cpf || "");
      return nomeLow === low || (digits && cpfDig === digits);
    });
    if (found) carregarTutorParaEdicao(found);
    else alert("Tutor não encontrado.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nomeCompleto) return alert("Preencha o Nome Completo.");
    const payload = {
      ...form,
      cpf:      onlyDigits(form.cpf) || null,
      telefone: onlyDigits(form.telefone) || null,
      cep:      onlyDigits(form.cep) || null,
    };
    const res = form.isEditing
      ? await updateTutor(form._id, payload)
      : await createTutor(payload);
    if (res.success) {
      alert(form.isEditing ? "Tutor atualizado!" : "Tutor cadastrado!");
      resetForm();
      reloadData();
    } else {
      alert("Erro: " + res.error);
    }
  };

  const qtdAnimaisDe = (tutorId) => animais.filter((a) => a.tutorId === tutorId).length;

  return (
    <div className={s.card}>
      <ModalConfirmacaoCCZ
        config={deleteConfig}
        onConfirm={() => { if (deleteConfig?.onConfirm) deleteConfig.onConfirm(); setDeleteConfig(null); }}
        onCancel={() => setDeleteConfig(null)}
      />

      {/* ── Barra de busca ─────────────────────────────────────────────── */}
      <div className={ts.searchBox}>
        <div className={ts.fieldGroup}>
          <label>Buscar Tutor / Responsável (Nome ou CPF)</label>
          <div className={ts.searchRow}>
            <div className={ts.autocompleteWrap}>
              <input
                type="text"
                value={form.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchConfirm(); } }}
                placeholder="Digite o nome ou CPF..."
                className={ts.searchInput}
              />
              {form.showSugestoes && form.sugestoes.length > 0 && (
                <ul className={ts.dropdown}>
                  {form.sugestoes.map((t) => (
                    <li key={t.id} onClick={() => carregarTutorParaEdicao(t)}>
                      <strong>{t.nomeCompleto}</strong>
                      {t.cpf && <span> — CPF: {maskCpf(t.cpf)}</span>}
                      {t.bairro && <span className={ts.dropdownMeta}> • {t.bairro}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Buscar */}
            <button type="button" className={`${ts.iconBtn} ${ts.btnBlue}`} title="Buscar" onClick={handleSearchConfirm}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Novo tutor */}
            <button type="button" className={`${ts.iconBtn} ${ts.btnGreen}`} title="Novo Tutor"
              onClick={() => { resetForm(); setForm((p) => ({ ...p, isFormActive: true })); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            {/* Excluir (só no modo edição) */}
            {form.isEditing && (
              <button type="button" className={`${ts.iconBtn} ${ts.btnRed}`} title="Excluir Tutor"
                onClick={() => setDeleteConfig({
                  nome: form.nomeCompleto,
                  detalhe: form.cpf ? `CPF: ${form.cpf}` : "Sem CPF cadastrado",
                  onConfirm: async () => {
                    const res = await deleteTutor(form._id);
                    if (res.success) { alert("Tutor removido!"); resetForm(); reloadData(); }
                    else alert("Erro: " + res.error);
                  },
                })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}

            {/* Cancelar */}
            {(form.isFormActive || form.isEditing) && (
              <button type="button" className={`${ts.iconBtn} ${ts.btnGray}`} title="Cancelar" onClick={resetForm}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Formulário ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className={ts.formContainer}>
        {/* Dados pessoais */}
        <div className={ts.formSection}>
          <div className={ts.sectionHeader}><h4>Dados Pessoais e Contato</h4></div>
          <div className={ts.formGrid}>
            <div className={`${ts.field} ${ts.colName}`}>
              <label>Nome Completo *</label>
              <input type="text" value={form.nomeCompleto}
                onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                disabled={!form.isFormActive} required />
            </div>
            <div className={`${ts.field} ${ts.colCpf}`}>
              <label>CPF</label>
              <input type="text" value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: maskCpf(e.target.value) })}
                placeholder="000.000.000-00"
                disabled={!form.isFormActive || form.isEditing} />
            </div>
            <div className={`${ts.field} ${ts.colTel}`}>
              <label>Telefone / WhatsApp</label>
              <input type="text" value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: maskTel(e.target.value) })}
                placeholder="(32) 99999-0000"
                disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colEmail}`}>
              <label>E-mail</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ex: joao@email.com"
                disabled={!form.isFormActive} />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className={ts.formSection}>
          <div className={ts.sectionHeader}><h4>Endereço</h4></div>
          <div className={ts.formGrid}>
            <div className={`${ts.field} ${ts.colCep}`}>
              <label>CEP</label>
              <input type="text" value={form.cep}
                onChange={(e) => setForm({ ...form, cep: maskCep(e.target.value) })}
                placeholder="00000-000" disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colStreet}`}>
              <label>Logradouro</label>
              <input type="text" value={form.logradouro}
                onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                placeholder="Ex: Rua das Flores" disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colNum}`}>
              <label>Número</label>
              <input type="text" value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="100" disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colComp}`}>
              <label>Complemento</label>
              <input type="text" value={form.complemento}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                placeholder="Apto 2" disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colDistrict}`}>
              <label>Bairro</label>
              <input type="text" value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                placeholder="Ex: Centro" disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colCity}`}>
              <label>Cidade</label>
              <input type="text" value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                disabled={!form.isFormActive} />
            </div>
            <div className={`${ts.field} ${ts.colUf}`}>
              <label>UF</label>
              <input type="text" value={form.uf}
                onChange={(e) => setForm({ ...form, uf: e.target.value })}
                maxLength={2} disabled={!form.isFormActive} />
            </div>
          </div>
        </div>

        {form.isFormActive && (
          <div className={ts.formActions}>
            <button type="submit" className={form.isEditing ? ts.updateBtn : ts.primaryBtn}>
              {form.isEditing ? "💾 Atualizar Tutor" : "➕ Salvar Tutor"}
            </button>
          </div>
        )}
      </form>

      {/* ── Tabela de tutores ──────────────────────────────────────────── */}
      <h4 className={s.sectionHeader}>Tutores Cadastrados — {tutores.length} registros</h4>
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
                <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                  Nenhum tutor cadastrado.
                </td>
              </tr>
            )}
            {tutores.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.nomeCompleto}</strong></td>
                <td>{t.cpf ? maskCpf(t.cpf) : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                <td>{t.telefone ? maskTel(t.telefone) : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                <td>{t.bairro || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                <td>
                  <span style={{
                    background: "#eff6ff", color: "#2563eb",
                    borderRadius: "6px", padding: "0.15rem 0.55rem",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {qtdAnimaisDe(t.id)} {qtdAnimaisDe(t.id) === 1 ? "animal" : "animais"}
                  </span>
                </td>
                <td className={s.actionsCell}>
                  <button className={s.editBtn} onClick={() => carregarTutorParaEdicao(t)}>✏️ Editar</button>
                  <button className={s.deleteBtn} onClick={() =>
                    setDeleteConfig({
                      nome: t.nomeCompleto,
                      detalhe: t.cpf ? `CPF: ${maskCpf(t.cpf)}` : "Sem CPF",
                      onConfirm: async () => {
                        const res = await deleteTutor(t.id);
                        if (res.success) { alert("Tutor removido!"); reloadData(); }
                        else alert("Erro: " + res.error);
                      },
                    })
                  }>🗑️ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
