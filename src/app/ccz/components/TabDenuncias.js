"use client";

import { useState } from "react";
import s from "./shared.module.css";
import ModalConfirmacaoCCZ from "./Modals/ModalConfirmacaoCCZ";
import { createDenuncia, updateDenuncia, deleteDenuncia } from "../actions";

const TIPOS = [
  "Foco de Dengue",
  "Escorpião",
  "Infestação de Roedores",
  "Animal Abandonado",
  "Animal Agressor",
  "Maus-tratos Animal",
  "Outros",
];
const PRIORIDADES = ["Alta", "Média", "Normal"];
const STATUS_LIST = ["Pendente", "Em Andamento", "Concluída", "Arquivada"];

const EMPTY_FORM = {
  tipo: "",
  descricao: "",
  bairro: "",
  logradouro: "",
  numero: "",
  denuncianteNome: "",
  denuncianteTelefone: "",
  status: "Pendente",
  prioridade: "Normal",
  observacao: "",
};

function maskTel(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function statusBadgeClass(status) {
  if (status === "Pendente") return s.badgePendente;
  if (status === "Em Andamento") return s.badgeEmAndamento;
  if (status === "Concluída") return s.badgeConcluido;
  return s.badgeNormal;
}

function prioridadeBadgeClass(p) {
  if (p === "Alta") return s.badgeAlta;
  if (p === "Média") return s.badgeMedia;
  return s.badgeNormal;
}

function formatDate(d) {
  if (!d) return "-";
  const str = d instanceof Date ? d.toISOString() : String(d);
  const parts = str.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str;
}

export default function TabDenuncias({ denuncias = [], reloadData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState(null);

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setForm({
      tipo: d.tipo || "",
      descricao: d.descricao || "",
      bairro: d.bairro || "",
      logradouro: d.logradouro || "",
      numero: d.numero || "",
      denuncianteNome: d.denuncianteNome || "",
      denuncianteTelefone: d.denuncianteTelefone ? maskTel(d.denuncianteTelefone) : "",
      status: d.status || "Pendente",
      prioridade: d.prioridade || "Normal",
      observacao: d.observacao || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tipo || !form.descricao || !form.bairro)
      return alert("Preencha Tipo, Descrição e Bairro.");

    const res = editingId
      ? await updateDenuncia(editingId, form)
      : await createDenuncia(form);

    if (res.success) {
      alert(editingId ? "Denúncia atualizada!" : "Denúncia registrada!");
      resetForm();
      reloadData();
    } else {
      alert("Erro: " + res.error);
    }
  };

  return (
    <div className={s.card}>
      <ModalConfirmacaoCCZ
        config={deleteConfig}
        onConfirm={() => { if (deleteConfig?.onConfirm) deleteConfig.onConfirm(); setDeleteConfig(null); }}
        onCancel={() => setDeleteConfig(null)}
      />

      <h3>{editingId ? "✏️ Editar Denúncia" : "➕ Registrar Nova Denúncia"}</h3>

      <form onSubmit={handleSubmit} className={s.formGrid}>
        <div className={s.fieldGroup}>
          <label>Tipo de Denúncia *</label>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} required>
            <option value="">-- Selecione --</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className={s.fieldGroup}>
          <label>Bairro *</label>
          <input type="text" value={form.bairro}
            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            placeholder="Ex: Centro" required />
        </div>

        <div className={s.fieldGroup}>
          <label>Logradouro</label>
          <input type="text" value={form.logradouro}
            onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
            placeholder="Ex: Rua das Palmeiras" />
        </div>

        <div className={s.fieldGroup}>
          <label>Número</label>
          <input type="text" value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            placeholder="Ex: 55" />
        </div>

        <div className={s.fieldGroup}>
          <label>Prioridade</label>
          <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className={s.fieldGroup}>
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_LIST.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        <div className={s.fieldGroup}>
          <label>Nome do Denunciante</label>
          <input type="text" value={form.denuncianteNome}
            onChange={(e) => setForm({ ...form, denuncianteNome: e.target.value })}
            placeholder="Opcional / Anônimo" />
        </div>

        <div className={s.fieldGroup}>
          <label>Telefone do Denunciante</label>
          <input type="text" value={form.denuncianteTelefone}
            onChange={(e) => setForm({ ...form, denuncianteTelefone: maskTel(e.target.value) })}
            placeholder="(32) 99999-0000" />
        </div>

        <div className={`${s.fieldGroup} ${s.fullWidth}`}>
          <label>Descrição *</label>
          <textarea rows={3} value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Descreva a ocorrência com o máximo de detalhes..." required />
        </div>

        <div className={`${s.fieldGroup} ${s.fullWidth}`}>
          <label>Observação Interna</label>
          <textarea rows={2} value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            placeholder="Anotações internas, desdobramentos, etc." />
        </div>

        <div className={s.formActions}>
          {editingId && (
            <button type="button" className={s.secondaryBtn} onClick={resetForm}>Cancelar</button>
          )}
          <button type="submit" className={s.primaryBtn}>
            {editingId ? "💾 Atualizar Denúncia" : "➕ Salvar Denúncia"}
          </button>
        </div>
      </form>

      <h4 className={s.sectionHeader}>Denúncias Registradas</h4>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Bairro</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Data</th>
              <th>Denunciante</th>
              <th className={s.actionsColumn}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {denuncias.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Nenhuma denúncia registrada.</td></tr>
            )}
            {denuncias.map((d) => (
              <tr key={d.id}>
                <td style={{ color: "#94a3b8" }}>#{d.id}</td>
                <td><strong>{d.tipo}</strong></td>
                <td>{d.bairro}</td>
                <td><span className={`${s.badge} ${prioridadeBadgeClass(d.prioridade)}`}>{d.prioridade}</span></td>
                <td><span className={`${s.badge} ${statusBadgeClass(d.status)}`}>{d.status}</span></td>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(d.dataDenuncia)}</td>
                <td>{d.denuncianteNome || <span style={{ color: "#94a3b8" }}>Anônimo</span>}</td>
                <td className={s.actionsCell}>
                  <button className={s.editBtn} onClick={() => handleEdit(d)}>✏️ Editar</button>
                  <button className={s.deleteBtn} onClick={() =>
                    setDeleteConfig({
                      nome: `${d.tipo} — ${d.bairro}`,
                      detalhe: `Registrada em ${formatDate(d.dataDenuncia)}`,
                      onConfirm: async () => {
                        const res = await deleteDenuncia(d.id);
                        if (res.success) { alert("Denúncia excluída!"); reloadData(); }
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
