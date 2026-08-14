"use client";

import { useState } from "react";
import styles from "./TabCadastros.module.css";
import ModalEdicaoCadastro from "./Modals/ModalEdicaoCadastro";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";

// ── Funções de máscara ──────────────────────────────────────────────────────
function maskCpf(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTelefone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function maskCep(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

function normalizeDateForInput(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
    if (isoMatch) return value;

    const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return `${year}-${month}-${day}`;
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

// Retira a máscara para salvar só dígitos
function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export default function TabCadastros({
  cadSubTab,
  setCadSubTab,
  formPessoa,
  setFormPessoa,
  handleSavePessoa,
  handleUpdatePessoa,
  handleDeletePessoa,
  formMedico,
  setFormMedico,
  handleSaveMedico,
  handleUpdateMedico,
  handleDeleteMedico,
  formUbs,
  setFormUbs,
  handleSaveUbs,
  handleUpdateUbs,
  handleDeleteUbs,
  formProcedimento,
  setFormProcedimento,
  handleSaveProcedimento,
  handleUpdateProcedimento,
  auxData,
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState(null);

  const confirmarExclusao = ({ tipo, nome, detalhe, onConfirm }) => {
    setDeleteConfig({ tipo, nome, detalhe, onConfirm });
  };

  const handleConfirmDelete = () => {
    if (deleteConfig?.onConfirm) deleteConfig.onConfirm();
    setDeleteConfig(null);
  };

  // ── Abrir modal de edição ────────────────────────────────────────────────
  const handleEditPessoa = (pessoa) => {
    setEditingItem(pessoa);
    setEditingType("PESSOA");
  };

  const handleEditMedico = (medico) => {
    setEditingItem(medico);
    setEditingType("MEDICO");
  };

  const handleEditUbs = (ubs) => {
    setEditingItem(ubs);
    setEditingType("UBS");
  };

  const handleEditProcedimento = (proc) => {
    setEditingItem(proc);
    setEditingType("PROCEDIMENTO");
  };

  const closeModal = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  // ── Wrappers que fecham o modal após salvar ──────────────────────────────
  const handleSavePessoaModal = async (payload) => {
    const data = {
      ...(payload || formPessoa),
      telefone: onlyDigits((payload || formPessoa).telefone || ""),
      cep: onlyDigits((payload || formPessoa).cep || ""),
    };
    const cpf = data.cpf;
    closeModal();
    await handleUpdatePessoa(cpf, data);
  };

  const handleSaveMedicoModal = async (payload) => {
    const id = editingItem?.id;
    const data = payload || formMedico;
    closeModal();
    if (id) await handleUpdateMedico(id, data);
  };

  const handleSaveUbsModal = async (payload) => {
    const id = editingItem?.id;
    const data = payload || formUbs;
    closeModal();
    if (id) await handleUpdateUbs(id, data);
  };

  const handleSaveProcedimentoModal = async (payload) => {
    const id = editingItem?.id;
    const data = payload || formProcedimento;
    closeModal();
    if (id) await handleUpdateProcedimento(id, data);
  };

  // ── Helpers de máscara nos formulários de cadastro ───────────────────────
  const handleCpfChange = (raw) => {
    setFormPessoa({ ...formPessoa, cpf: maskCpf(raw) });
  };

  const handleTelefoneChange = (raw) => {
    setFormPessoa({ ...formPessoa, telefone: maskTelefone(raw) });
  };

  const handleCepChange = (raw) => {
    setFormPessoa({ ...formPessoa, cep: maskCep(raw) });
  };

  // Antes de submeter, limpa máscaras do CPF/telefone/CEP
  const handleSavePessoaForm = (e) => {
    e.preventDefault();
    const cleaned = {
      ...formPessoa,
      cpf: onlyDigits(formPessoa.cpf),
      telefone: onlyDigits(formPessoa.telefone),
      cep: onlyDigits(formPessoa.cep),
    };
    setFormPessoa(cleaned);
    // Pequeno timeout para o state atualizar antes do submit original
    setTimeout(() => handleSavePessoa(e), 0);
  };

  return (
    <div className={styles.card}>
      {/* Modal de confirmação de exclusão */}
      <ModalConfirmacaoExclusao
        config={deleteConfig}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfig(null)}
      />

      {/* Modal de edição */}
      <ModalEdicaoCadastro
        editingItem={editingItem}
        editingType={editingType}
        formPessoa={formPessoa}
        setFormPessoa={setFormPessoa}
        formMedico={formMedico}
        setFormMedico={setFormMedico}
        formUbs={formUbs}
        setFormUbs={setFormUbs}
        formProcedimento={formProcedimento}
        setFormProcedimento={setFormProcedimento}
        handleSavePessoa={handleSavePessoaModal}
        handleSaveMedico={handleSaveMedicoModal}
        handleSaveUbs={handleSaveUbsModal}
        handleSaveProcedimento={handleSaveProcedimentoModal}
        auxData={auxData}
        onClose={closeModal}
        maskTelefone={maskTelefone}
        maskCep={maskCep}
        onlyDigits={onlyDigits}
      />

      {/* ── Navegação sub-abas ─────────────────────────────────────────── */}
      <div className={styles.examQueueNav}>
        <button
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === "PACIENTES" ? styles.activeExamQueue : ""}`}
          onClick={() => setCadSubTab("PACIENTES")}
        >
          👤 Pacientes ({auxData.pessoas ? auxData.pessoas.length : 0})
        </button>
        <button
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === "MEDICOS" ? styles.activeExamQueue : ""}`}
          onClick={() => setCadSubTab("MEDICOS")}
        >
          👨‍⚕️ Médicos ({auxData.medicos.length})
        </button>
        <button
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === "UBS" ? styles.activeExamQueue : ""}`}
          onClick={() => setCadSubTab("UBS")}
        >
          🏥 Unidades de Saúde ({auxData.ubsList.length})
        </button>
        <button
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === "PROCEDIMENTOS" ? styles.activeExamQueue : ""}`}
          onClick={() => setCadSubTab("PROCEDIMENTOS")}
        >
          🔬 Procedimentos ({auxData.procedimentos.length})
        </button>
      </div>

      {/* ── SUB-ABA: PACIENTES ─────────────────────────────────────────── */}
      {cadSubTab === "PACIENTES" && (
        <div>
          <h3>➕ Cadastrar Novo Paciente</h3>
          <form onSubmit={handleSavePessoaForm} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>CPF *</label>
              <input
                type="text"
                value={formPessoa.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome Completo *</label>
              <input
                type="text"
                value={formPessoa.nomeCompleto}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, nomeCompleto: e.target.value })
                }
                placeholder="Ex: Maria das Dores"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Data de Nascimento *</label>
              <input
                type="date"
                value={formPessoa.dataNascimento}
                onChange={(e) =>
                  setFormPessoa({
                    ...formPessoa,
                    dataNascimento: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome da Mãe *</label>
              <input
                type="text"
                value={formPessoa.nomeMae}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, nomeMae: e.target.value })
                }
                placeholder="Ex: Ana Silva"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input
                type="text"
                value={formPessoa.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="(32) 99999-8888"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Logradouro / Rua</label>
              <input
                type="text"
                value={formPessoa.logradouro}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, logradouro: e.target.value })
                }
                placeholder="Ex: Rua Paschoal Bernardino"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Número</label>
              <input
                type="text"
                value={formPessoa.numero}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, numero: e.target.value })
                }
                placeholder="Ex: 100"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Complemento</label>
              <input
                type="text"
                value={formPessoa.complemento}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, complemento: e.target.value })
                }
                placeholder="Ex: Apto 201"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Bairro</label>
              <input
                type="text"
                value={formPessoa.bairro}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, bairro: e.target.value })
                }
                placeholder="Ex: Centro"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Cidade</label>
              <input
                type="text"
                value={formPessoa.cidade}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, cidade: e.target.value })
                }
                placeholder="Ex: Muriaé"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>UF</label>
              <input
                type="text"
                value={formPessoa.uf}
                onChange={(e) =>
                  setFormPessoa({ ...formPessoa, uf: e.target.value })
                }
                placeholder="MG"
                maxLength={2}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>CEP</label>
              <input
                type="text"
                value={formPessoa.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className={`${styles.formActions} ${styles.fullWidth}`}>
              <button type="submit" className={styles.primaryBtn}>
                ➕ Salvar Paciente
              </button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Pacientes Cadastrados</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>CPF</th>
                  <th>Nome Completo</th>
                  <th>Mãe</th>
                  <th>Data Nasc.</th>
                  <th>Telefone</th>
                  <th className={styles.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {auxData.pessoas &&
                  auxData.pessoas.map((p) => (
                    <tr key={p.cpf}>
                      <td>{maskCpf(p.cpf)}</td>
                      <td>
                        <strong>{p.nomeCompleto}</strong>
                      </td>
                      <td>{p.nomeMae}</td>
                      <td>{p.dataNascimento}</td>
                      <td>{p.telefone ? maskTelefone(p.telefone) : "-"}</td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditPessoa(p)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() =>
                            confirmarExclusao({
                              tipo: "PESSOA",
                              nome: p.nomeCompleto,
                              detalhe: `CPF: ${maskCpf(p.cpf)}`,
                              onConfirm: () =>
                                handleDeletePessoa(p.cpf, p.nomeCompleto),
                            })
                          }
                          title="Excluir"
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-ABA: MÉDICOS ───────────────────────────────────────────── */}
      {cadSubTab === "MEDICOS" && (
        <div>
          <h3>➕ Cadastrar Novo Médico</h3>
          <form onSubmit={handleSaveMedico} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Nome do Médico *</label>
              <input
                type="text"
                value={formMedico.nome}
                onChange={(e) =>
                  setFormMedico({ ...formMedico, nome: e.target.value })
                }
                placeholder="Ex: Dr. Roberto Silva"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>CRM *</label>
              <input
                type="text"
                value={formMedico.crm}
                onChange={(e) =>
                  setFormMedico({ ...formMedico, crm: e.target.value })
                }
                placeholder="Ex: 123456"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>UF do CRM</label>
              <input
                type="text"
                value={formMedico.ufCrm}
                onChange={(e) =>
                  setFormMedico({ ...formMedico, ufCrm: e.target.value })
                }
                maxLength={2}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Especialidade</label>
              <input
                type="text"
                value={formMedico.especialidade}
                onChange={(e) =>
                  setFormMedico({
                    ...formMedico,
                    especialidade: e.target.value,
                  })
                }
                placeholder="Ex: Cardiologia"
              />
            </div>
            <div className={`${styles.formActions} ${styles.fullWidth}`}>
              <button type="submit" className={styles.primaryBtn}>
                ➕ Salvar Médico
              </button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Médicos Cadastrados</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CRM</th>
                  <th>UF</th>
                  <th>Especialidade</th>
                  <th className={styles.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {auxData.medicos.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.nome}</strong>
                    </td>
                    <td>{m.crm}</td>
                    <td>{m.ufCrm}</td>
                    <td>{m.especialidade || "-"}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditMedico(m)}
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() =>
                          confirmarExclusao({
                            tipo: "MEDICO",
                            nome: m.nome,
                            detalhe: `CRM: ${m.crm}/${m.ufCrm}`,
                            onConfirm: () => handleDeleteMedico(m.id, m.nome),
                          })
                        }
                        title="Excluir"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-ABA: UBS ──────────────────────────────────────────────── */}
      {cadSubTab === "UBS" && (
        <div>
          <h3>➕ Cadastrar Nova Unidade de Saúde</h3>
          <form onSubmit={handleSaveUbs} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Nome da Unidade / UBS *</label>
              <input
                type="text"
                value={formUbs.nome}
                onChange={(e) =>
                  setFormUbs({ ...formUbs, nome: e.target.value })
                }
                placeholder="Ex: UBS Bairro Central"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Código CNES *</label>
              <input
                type="text"
                value={formUbs.cnes}
                onChange={(e) =>
                  setFormUbs({ ...formUbs, cnes: e.target.value })
                }
                placeholder="Ex: 7654321"
                required
              />
            </div>
            <div className={`${styles.formActions} ${styles.fullWidth}`}>
              <button type="submit" className={styles.primaryBtn}>
                ➕ Salvar UBS
              </button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Unidades Cadastradas</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome da UBS</th>
                  <th>CNES</th>
                  <th className={styles.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {auxData.ubsList.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.nome}</strong>
                    </td>
                    <td>{u.cnes}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditUbs(u)}
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() =>
                          confirmarExclusao({
                            tipo: "UBS",
                            nome: u.nome,
                            detalhe: `CNES: ${u.cnes}`,
                            onConfirm: () => handleDeleteUbs(u.id, u.nome),
                          })
                        }
                        title="Excluir"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-ABA: PROCEDIMENTOS ────────────────────────────────────── */}
      {cadSubTab === "PROCEDIMENTOS" && (
        <div>
          <h3>➕ Cadastrar Novo Procedimento</h3>
          <form onSubmit={handleSaveProcedimento} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Tipo de Exame *</label>
              <select
                value={formProcedimento.tipoExameId}
                onChange={(e) =>
                  setFormProcedimento({
                    ...formProcedimento,
                    tipoExameId: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Selecione o Tipo de Exame --</option>
                {auxData.tiposExame.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome do Procedimento *</label>
              <input
                type="text"
                value={formProcedimento.nome}
                onChange={(e) =>
                  setFormProcedimento({
                    ...formProcedimento,
                    nome: e.target.value,
                  })
                }
                placeholder="Ex: Ecocardiograma com Doppler"
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formProcedimento.valor}
                onChange={(e) =>
                  setFormProcedimento({
                    ...formProcedimento,
                    valor: e.target.value,
                  })
                }
                placeholder="Ex: 180.00"
                required
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>
                ➕ Salvar Procedimento
              </button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>
            Procedimentos Cadastrados
          </h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome do Procedimento</th>
                  <th>Tipo de Exame</th>
                  <th>Valor (R$)</th>
                  <th className={styles.actionsColumn}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {auxData.procedimentos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nome}</strong>
                    </td>
                    <td>{p.tipoExameNome}</td>
                    <td>R$ {Number(p.valor).toFixed(2)}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditProcedimento(p)}
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
