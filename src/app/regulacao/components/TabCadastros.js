"use client";

import { useState } from "react";
import styles from "./TabCadastros.module.css";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";
import {
  createPessoa,
  updatePessoa,
  deletePessoa,
  createMedico,
  updateMedico,
  deleteMedico,
  createUbs,
  updateUbs,
  deleteUbs,
  createProcedimento,
  updateProcedimento,
} from "../actions";

/* ── MÁSCARAS E MÁSCARAS DE FORMATAÇÃO ── */
function maskCpf(value) {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTelefone(value) {
  if (!value) return "";
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
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

function onlyDigits(value) {
  return value ? value.replace(/\D/g, "") : "";
}

export default function TabCadastros({
  cadSubTab = "PACIENTES",
  setCadSubTab,
  formPessoa,
  setFormPessoa,
  formMedico,
  setFormMedico,
  formUbs,
  setFormUbs,
  formProcedimento,
  setFormProcedimento,
  auxData = { pessoas: [], medicos: [], ubsList: [], procedimentos: [], tiposExame: [] },
  reloadData = () => {},
}) {
  const [deleteConfig, setDeleteConfig] = useState(null);

  const confirmarExclusao = ({ tipo, nome, detalhe, onConfirm }) => {
    setDeleteConfig({ tipo, nome, detalhe, onConfirm });
  };

  const handleConfirmDelete = () => {
    if (deleteConfig?.onConfirm) deleteConfig.onConfirm();
    setDeleteConfig(null);
  };

  /* ── RESETS DE FORMULÁRIOS ── */
  const resetFormPessoa = () => {
    setFormPessoa({
      cpf: "",
      nomeCompleto: "",
      dataNascimento: "",
      nomeMae: "",
      telefone: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "Muriaé",
      uf: "MG",
      cpfSearch: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

  const resetFormMedico = () => {
    setFormMedico({
      id: null,
      nome: "",
      crm: "",
      ufCrm: "MG",
      especialidade: "",
      search: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

  const resetFormUbs = () => {
    setFormUbs({
      id: null,
      nome: "",
      cnes: "",
      search: "",
      sugestoes: [],
      showSugestoes: false,
      isEditing: false,
      isFormActive: false,
    });
  };

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

  const carregarPessoaParaEdicao = (p) => {
    setFormPessoa({
      cpf: maskCpf(p.cpf),
      nomeCompleto: p.nomeCompleto || "",
      dataNascimento: p.dataNascimento || "",
      nomeMae: p.nomeMae || "",
      telefone: p.telefone ? maskTelefone(p.telefone) : "",
      cep: p.cep ? maskCep(p.cep) : "",
      logradouro: p.logradouro || "",
      numero: p.numero || "",
      complemento: p.complemento || "",
      bairro: p.bairro || "",
      cidade: p.cidade || "Muriaé",
      uf: p.uf || "MG",
      cpfSearch: `${p.nomeCompleto} (${maskCpf(p.cpf)})`,
      sugestoes: [],
      showSugestoes: false,
      isEditing: true,
      isFormActive: true,
    });
  };

  const carregarMedicoParaEdicao = (m) => {
    setFormMedico({
      id: m.id,
      nome: m.nome,
      crm: m.crm,
      ufCrm: m.ufCrm || "MG",
      especialidade: m.especialidade || "",
      search: `${m.nome} (CRM: ${m.crm})`,
      sugestoes: [],
      showSugestoes: false,
      isEditing: true,
      isFormActive: true,
    });
  };

  const carregarUbsParaEdicao = (u) => {
    setFormUbs({
      id: u.id,
      nome: u.nome,
      cnes: u.cnes,
      search: `${u.nome} (CNES: ${u.cnes})`,
      sugestoes: [],
      showSugestoes: false,
      isEditing: true,
      isFormActive: true,
    });
  };

  return (
    <div className={styles.card}>
      <ModalConfirmacaoExclusao
        config={deleteConfig}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfig(null)}
      />

      {/* ── NAVEGAÇÃO ENTRE CADASTROS ── */}
      <div className={styles.subTabNavContainer}>
        <div className={styles.subTabNav}>
          <button
            type="button"
            className={`${styles.subTabBtn} ${cadSubTab === "PACIENTES" ? styles.activeSubTab : ""}`}
            onClick={() => { resetFormPessoa(); setCadSubTab("PACIENTES"); }}
          >
            Pacientes
          </button>
          <button
            type="button"
            className={`${styles.subTabBtn} ${cadSubTab === "MEDICOS" ? styles.activeSubTab : ""}`}
            onClick={() => { resetFormMedico(); setCadSubTab("MEDICOS"); }}
          >
            Médicos
          </button>
          <button
            type="button"
            className={`${styles.subTabBtn} ${cadSubTab === "UBS" ? styles.activeSubTab : ""}`}
            onClick={() => { resetFormUbs(); setCadSubTab("UBS"); }}
          >
            Unidades de Saúde
          </button>
          <button
            type="button"
            className={`${styles.subTabBtn} ${cadSubTab === "PROCEDIMENTOS" ? styles.activeSubTab : ""}`}
            onClick={() => { resetFormProcedimento(); setCadSubTab("PROCEDIMENTOS"); }}
          >
            Procedimentos
          </button>
        </div>
      </div>

      {/* ── SUB-ABA 1: PACIENTES ── */}
      {cadSubTab === "PACIENTES" && (
        <div>
          <div className={styles.searchSectionContainer}>
            <div className={styles.fieldGroup}>
              <label>Buscar Paciente no Banco (CPF ou Nome)</label>
              <div className={styles.searchActionRow}>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    value={formPessoa.cpfSearch || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const termLower = val.toLowerCase().trim();
                      const termDigits = onlyDigits(val);

                      let sugestoes = [];
                      if (termLower.length >= 2) {
                        sugestoes = (auxData.pessoas || []).filter((p) => {
                          const cpfDigits = onlyDigits(p.cpf || "");
                          const nomeLower = (p.nomeCompleto || "").toLowerCase();
                          return (termDigits && cpfDigits.includes(termDigits)) || nomeLower.includes(termLower);
                        });
                      }

                      setFormPessoa((prev) => ({
                        ...prev,
                        cpfSearch: val,
                        sugestoes,
                        showSugestoes: true,
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (formPessoa.sugestoes && formPessoa.sugestoes.length > 0) {
                          carregarPessoaParaEdicao(formPessoa.sugestoes[0]);
                          return;
                        }
                        const term = (formPessoa.cpfSearch || "").trim().toLowerCase();
                        const termDigits = onlyDigits(term);
                        const encontrado = auxData.pessoas?.find((p) => {
                          const cpfDigits = onlyDigits(p.cpf || "");
                          const nomeLower = (p.nomeCompleto || "").toLowerCase();
                          return (termDigits && cpfDigits === termDigits) || nomeLower === term;
                        });

                        if (encontrado) carregarPessoaParaEdicao(encontrado);
                        else alert("Paciente não encontrado.");
                      }
                    }}
                    placeholder="Digite o CPF ou Nome do paciente..."
                  />

                  {formPessoa.showSugestoes && formPessoa.sugestoes && formPessoa.sugestoes.length > 0 && (
                    <ul className={styles.suggestionsDropdown}>
                      {formPessoa.sugestoes.map((p) => (
                        <li key={p.cpf} onClick={() => carregarPessoaParaEdicao(p)}>
                          <strong>{p.nomeCompleto}</strong> — CPF: {maskCpf(p.cpf)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
                  title="Buscar Paciente"
                  onClick={() => {
                    if (formPessoa.sugestoes && formPessoa.sugestoes.length > 0) {
                      carregarPessoaParaEdicao(formPessoa.sugestoes[0]);
                      return;
                    }
                    const term = (formPessoa.cpfSearch || "").trim().toLowerCase();
                    const termDigits = onlyDigits(term);
                    const encontrado = auxData.pessoas?.find((p) => {
                      const cpfDigits = onlyDigits(p.cpf || "");
                      const nomeLower = (p.nomeCompleto || "").toLowerCase();
                      return (termDigits && cpfDigits.includes(termDigits)) || nomeLower.includes(term);
                    });

                    if (encontrado) carregarPessoaParaEdicao(encontrado);
                    else alert("Paciente não encontrado.");
                  }}
                >
                  <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
                </button>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
                  title="Adicionar Novo Paciente"
                  onClick={() => {
                    resetFormPessoa();
                    setFormPessoa((prev) => ({ ...prev, isFormActive: true }));
                  }}
                >
                  <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
                </button>

                {formPessoa.isEditing && (
                  <button
                    type="button"
                    className={`${styles.iconSquareBtn} ${styles.btnRed}`}
                    title="Excluir Paciente"
                    onClick={() =>
                      confirmarExclusao({
                        tipo: "PESSOA",
                        nome: formPessoa.nomeCompleto,
                        detalhe: `CPF: ${maskCpf(formPessoa.cpf)}`,
                        onConfirm: async () => {
                          const res = await deletePessoa(onlyDigits(formPessoa.cpf));
                          if (res.success) {
                            alert("Paciente removido com sucesso!");
                            reloadData();
                            resetFormPessoa();
                          } else alert("Erro ao excluir: " + res.error);
                        },
                      })
                    }
                  >
                    <img src="/img/icon/excluir.png" alt="Excluir" className={styles.iconImg} />
                  </button>
                )}

                {(formPessoa.isFormActive || formPessoa.isEditing) && (
                  <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormPessoa}>
                    <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const cleanedData = {
                ...formPessoa,
                cpf: onlyDigits(formPessoa.cpf),
                telefone: onlyDigits(formPessoa.telefone),
                cep: onlyDigits(formPessoa.cep),
              };

              if (formPessoa.isEditing) {
                const res = await updatePessoa(cleanedData.cpf, cleanedData);
                if (res.success) {
                  alert("Paciente atualizado com sucesso!");
                  reloadData();
                } else alert("Erro ao atualizar: " + res.error);
              } else {
                const res = await createPessoa(cleanedData);
                if (res.success) {
                  alert("Paciente cadastrado com sucesso!");
                  reloadData();
                } else alert("Erro ao salvar: " + res.error);
              }
              resetFormPessoa();
            }}
            className={styles.patientFormContainer}
          >
            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <h4>Dados Pessoais e Contato</h4>
              </div>
              <div className={styles.formGridStrict}>
                <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
                  <label>CPF *</label>
                  <input
                    type="text"
                    value={formPessoa.cpf}
                    onChange={(e) => setFormPessoa({ ...formPessoa, cpf: maskCpf(e.target.value) })}
                    placeholder="000.000.000-00"
                    disabled={!formPessoa.isFormActive || formPessoa.isEditing}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colName}`}>
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={formPessoa.nomeCompleto}
                    onChange={(e) => setFormPessoa({ ...formPessoa, nomeCompleto: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colBirth}`}>
                  <label>Data de Nascimento *</label>
                  <input
                    type="date"
                    value={formPessoa.dataNascimento}
                    onChange={(e) => setFormPessoa({ ...formPessoa, dataNascimento: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colMother}`}>
                  <label>Nome da Mãe *</label>
                  <input
                    type="text"
                    value={formPessoa.nomeMae}
                    onChange={(e) => setFormPessoa({ ...formPessoa, nomeMae: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colPhone}`}>
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPessoa.telefone}
                    onChange={(e) => setFormPessoa({ ...formPessoa, telefone: maskTelefone(e.target.value) })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <h4>Endereço Residencial</h4>
              </div>
              <div className={styles.formGridStrict}>
                <div className={`${styles.fieldGroup} ${styles.colCep}`}>
                  <label>CEP</label>
                  <input
                    type="text"
                    value={formPessoa.cep}
                    onChange={(e) => setFormPessoa({ ...formPessoa, cep: maskCep(e.target.value) })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colStreet}`}>
                  <label>Logradouro / Rua</label>
                  <input
                    type="text"
                    value={formPessoa.logradouro}
                    onChange={(e) => setFormPessoa({ ...formPessoa, logradouro: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colNumber}`}>
                  <label>Número</label>
                  <input
                    type="text"
                    value={formPessoa.numero}
                    onChange={(e) => setFormPessoa({ ...formPessoa, numero: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colComp}`}>
                  <label>Complemento</label>
                  <input
                    type="text"
                    value={formPessoa.complemento}
                    onChange={(e) => setFormPessoa({ ...formPessoa, complemento: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colDistrict}`}>
                  <label>Bairro</label>
                  <input
                    type="text"
                    value={formPessoa.bairro}
                    onChange={(e) => setFormPessoa({ ...formPessoa, bairro: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colCity}`}>
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={formPessoa.cidade}
                    onChange={(e) => setFormPessoa({ ...formPessoa, cidade: e.target.value })}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colUf}`}>
                  <label>UF</label>
                  <input
                    type="text"
                    value={formPessoa.uf}
                    onChange={(e) => setFormPessoa({ ...formPessoa, uf: e.target.value })}
                    maxLength={2}
                    disabled={!formPessoa.isFormActive}
                  />
                </div>
              </div>
            </div>

            {formPessoa.isFormActive && (
              <div className={styles.formActions}>
                <button type="submit" className={formPessoa.isEditing ? styles.updateBtn : styles.primaryBtn}>
                  {formPessoa.isEditing ? "Atualizar Paciente" : "Salvar Paciente"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── SUB-ABA 2: MÉDICOS ── */}
      {cadSubTab === "MEDICOS" && (
        <div>
          <div className={styles.searchSectionContainer}>
            <div className={styles.fieldGroup}>
              <label>Buscar Médico no Banco (CRM ou Nome)</label>
              <div className={styles.searchActionRow}>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    value={formMedico.search || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const termLower = val.toLowerCase().trim();
                      let sugestoes = [];
                      if (termLower.length >= 2) {
                        sugestoes = (auxData.medicos || []).filter((m) =>
                          m.nome.toLowerCase().includes(termLower) || m.crm.includes(termLower)
                        );
                      }
                      setFormMedico((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (formMedico.sugestoes && formMedico.sugestoes.length > 0) {
                          carregarMedicoParaEdicao(formMedico.sugestoes[0]);
                          return;
                        }
                        const term = (formMedico.search || "").toLowerCase().trim();
                        const encontrado = auxData.medicos?.find((m) => m.nome.toLowerCase().includes(term) || m.crm.includes(term));
                        if (encontrado) carregarMedicoParaEdicao(encontrado);
                        else alert("Médico não encontrado.");
                      }
                    }}
                    placeholder="Digite o CRM ou Nome do médico..."
                  />

                  {formMedico.showSugestoes && formMedico.sugestoes && formMedico.sugestoes.length > 0 && (
                    <ul className={styles.suggestionsDropdown}>
                      {formMedico.sugestoes.map((m) => (
                        <li key={m.id} onClick={() => carregarMedicoParaEdicao(m)}>
                          <strong>{m.nome}</strong> — CRM: {m.crm}/{m.ufCrm}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
                  title="Buscar Médico"
                  onClick={() => {
                    if (formMedico.sugestoes && formMedico.sugestoes.length > 0) {
                      carregarMedicoParaEdicao(formMedico.sugestoes[0]);
                      return;
                    }
                    const term = (formMedico.search || "").toLowerCase().trim();
                    const encontrado = auxData.medicos?.find((m) => m.nome.toLowerCase().includes(term) || m.crm.includes(term));
                    if (encontrado) carregarMedicoParaEdicao(encontrado);
                    else alert("Médico não encontrado.");
                  }}
                >
                  <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
                </button>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
                  title="Adicionar Novo Médico"
                  onClick={() => { resetFormMedico(); setFormMedico((prev) => ({ ...prev, isFormActive: true })); }}
                >
                  <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
                </button>

                {formMedico.isEditing && (
                  <button
                    type="button"
                    className={`${styles.iconSquareBtn} ${styles.btnRed}`}
                    title="Excluir Médico"
                    onClick={() =>
                      confirmarExclusao({
                        tipo: "MEDICO",
                        nome: formMedico.nome,
                        detalhe: `CRM: ${formMedico.crm}`,
                        onConfirm: async () => {
                          const res = await deleteMedico(formMedico.id);
                          if (res.success) {
                            alert("Médico removido com sucesso!");
                            reloadData();
                            resetFormMedico();
                          } else alert("Erro ao excluir: " + res.error);
                        },
                      })
                    }
                  >
                    <img src="/img/icon/excluir.png" alt="Excluir" className={styles.iconImg} />
                  </button>
                )}

                {(formMedico.isFormActive || formMedico.isEditing) && (
                  <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormMedico}>
                    <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (formMedico.isEditing) {
                const res = await updateMedico(formMedico.id, formMedico);
                if (res.success) {
                  alert("Dados do médico atualizados com sucesso!");
                  reloadData();
                } else alert("Erro ao atualizar: " + res.error);
              } else {
                const res = await createMedico(formMedico);
                if (res.success) {
                  alert("Médico cadastrado com sucesso!");
                  reloadData();
                } else alert("Erro ao salvar: " + res.error);
              }
              resetFormMedico();
            }}
            className={styles.patientFormContainer}
          >
            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <h4>Dados Profissionais</h4>
              </div>
              <div className={styles.formGridStrict}>
                <div className={`${styles.fieldGroup} ${styles.colName}`}>
                  <label>Nome do Médico *</label>
                  <input
                    type="text"
                    value={formMedico.nome}
                    onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
                    disabled={!formMedico.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colCrm}`}>
                  <label>CRM *</label>
                  <input
                    type="text"
                    value={formMedico.crm}
                    onChange={(e) => setFormMedico({ ...formMedico, crm: e.target.value })}
                    disabled={!formMedico.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colUfCrm}`}>
                  <label>UF CRM *</label>
                  <input
                    type="text"
                    value={formMedico.ufCrm}
                    onChange={(e) => setFormMedico({ ...formMedico, ufCrm: e.target.value })}
                    maxLength={2}
                    disabled={!formMedico.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colEspecialidade}`}>
                  <label>Especialidade</label>
                  <input
                    type="text"
                    value={formMedico.especialidade}
                    onChange={(e) => setFormMedico({ ...formMedico, especialidade: e.target.value })}
                    disabled={!formMedico.isFormActive}
                  />
                </div>
              </div>
            </div>

            {formMedico.isFormActive && (
              <div className={styles.formActions}>
                <button type="submit" className={formMedico.isEditing ? styles.updateBtn : styles.primaryBtn}>
                  {formMedico.isEditing ? "Atualizar Médico" : "Salvar Médico"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── SUB-ABA 3: UBS ── */}
      {cadSubTab === "UBS" && (
        <div>
          <div className={styles.searchSectionContainer}>
            <div className={styles.fieldGroup}>
              <label>Buscar Unidade no Banco (CNES ou Nome)</label>
              <div className={styles.searchActionRow}>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    value={formUbs.search || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const termLower = val.toLowerCase().trim();
                      let sugestoes = [];
                      if (termLower.length >= 2) {
                        sugestoes = (auxData.ubsList || []).filter((u) =>
                          u.nome.toLowerCase().includes(termLower) || u.cnes.includes(termLower)
                        );
                      }
                      setFormUbs((prev) => ({ ...prev, search: val, sugestoes, showSugestoes: true }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (formUbs.sugestoes && formUbs.sugestoes.length > 0) {
                          carregarUbsParaEdicao(formUbs.sugestoes[0]);
                          return;
                        }
                        const term = (formUbs.search || "").toLowerCase().trim();
                        const encontrado = auxData.ubsList?.find((u) => u.nome.toLowerCase().includes(term) || u.cnes.includes(term));
                        if (encontrado) carregarUbsParaEdicao(encontrado);
                        else alert("Unidade de saúde não encontrada.");
                      }
                    }}
                    placeholder="Digite o CNES ou Nome da UBS..."
                  />

                  {formUbs.showSugestoes && formUbs.sugestoes && formUbs.sugestoes.length > 0 && (
                    <ul className={styles.suggestionsDropdown}>
                      {formUbs.sugestoes.map((u) => (
                        <li key={u.id} onClick={() => carregarUbsParaEdicao(u)}>
                          <strong>{u.nome}</strong> — CNES: {u.cnes}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
                  title="Buscar UBS"
                  onClick={() => {
                    if (formUbs.sugestoes && formUbs.sugestoes.length > 0) {
                      carregarUbsParaEdicao(formUbs.sugestoes[0]);
                      return;
                    }
                    const term = (formUbs.search || "").toLowerCase().trim();
                    const encontrado = auxData.ubsList?.find((u) => u.nome.toLowerCase().includes(term) || u.cnes.includes(term));
                    if (encontrado) carregarUbsParaEdicao(encontrado);
                    else alert("Unidade de saúde não encontrada.");
                  }}
                >
                  <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
                </button>

                <button
                  type="button"
                  className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
                  title="Adicionar Nova UBS"
                  onClick={() => { resetFormUbs(); setFormUbs((prev) => ({ ...prev, isFormActive: true })); }}
                >
                  <img src="/img/icon/mais.png" alt="Adicionar" className={styles.iconImg} />
                </button>

                {formUbs.isEditing && (
                  <button
                    type="button"
                    className={`${styles.iconSquareBtn} ${styles.btnRed}`}
                    title="Excluir UBS"
                    onClick={() =>
                      confirmarExclusao({
                        tipo: "UBS",
                        nome: formUbs.nome,
                        detalhe: `CNES: ${formUbs.cnes}`,
                        onConfirm: async () => {
                          const res = await deleteUbs(formUbs.id);
                          if (res.success) {
                            alert("UBS removida com sucesso!");
                            reloadData();
                            resetFormUbs();
                          } else alert("Erro ao excluir: " + res.error);
                        },
                      })
                    }
                  >
                    <img src="/img/icon/excluir.png" alt="Excluir" className={styles.iconImg} />
                  </button>
                )}

                {(formUbs.isFormActive || formUbs.isEditing) && (
                  <button type="button" className={`${styles.iconSquareBtn} ${styles.btnRed}`} title="Cancelar" onClick={resetFormUbs}>
                    <img src="/img/icon/cancelar.png" alt="Cancelar" className={styles.iconImg} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (formUbs.isEditing) {
                const res = await updateUbs(formUbs.id, formUbs);
                if (res.success) {
                  alert("Dados da UBS atualizados com sucesso!");
                  reloadData();
                } else alert("Erro ao atualizar: " + res.error);
              } else {
                const res = await createUbs(formUbs);
                if (res.success) {
                  alert("UBS cadastrada com sucesso!");
                  reloadData();
                } else alert("Erro ao salvar: " + res.error);
              }
              resetFormUbs();
            }}
            className={styles.patientFormContainer}
          >
            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <h4>Dados da Unidade</h4>
              </div>
              <div className={styles.formGridStrict}>
                <div className={`${styles.fieldGroup} ${styles.colUbsName}`}>
                  <label>Nome da Unidade / UBS *</label>
                  <input
                    type="text"
                    value={formUbs.nome}
                    onChange={(e) => setFormUbs({ ...formUbs, nome: e.target.value })}
                    disabled={!formUbs.isFormActive}
                    required
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.colCnes}`}>
                  <label>Código CNES *</label>
                  <input
                    type="text"
                    value={formUbs.cnes}
                    onChange={(e) => setFormUbs({ ...formUbs, cnes: e.target.value })}
                    disabled={!formUbs.isFormActive}
                    required
                  />
                </div>
              </div>
            </div>

            {formUbs.isFormActive && (
              <div className={styles.formActions}>
                <button type="submit" className={formUbs.isEditing ? styles.updateBtn : styles.primaryBtn}>
                  {formUbs.isEditing ? "Atualizar UBS" : "Salvar UBS"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── SUB-ABA 4: PROCEDIMENTOS (ÚNICO QUE MANTÉM TABELA) ── */}
      {cadSubTab === "PROCEDIMENTOS" && (
        <div>
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
                  onClick={() => { resetFormProcedimento(); setFormProcedimento((prev) => ({ ...prev, isFormActive: true })); }}
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

          {/* TABELA LIMPA EXCLUSIVA DE PROCEDIMENTOS */}
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
      )}
    </div>
  );
}