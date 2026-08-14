"use client";

import { useEffect, useState } from "react";
import styles from "./ModalEdicaoCadastro.module.css";

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

const buildPessoaDraft = (pessoa = {}) => ({
  cpf: pessoa.cpf || "",
  nomeCompleto: pessoa.nomeCompleto || "",
  dataNascimento: normalizeDateForInput(pessoa.dataNascimento),
  nomeMae: pessoa.nomeMae || "",
  telefone: pessoa.telefone ? pessoa.telefone : "",
  logradouro: pessoa.logradouro || "",
  numero: pessoa.numero || "",
  complemento: pessoa.complemento || "",
  bairro: pessoa.bairro || "",
  cidade: pessoa.cidade || "Muriaé",
  uf: pessoa.uf || "MG",
  cep: pessoa.cep || "",
});

const buildMedicoDraft = (medico = {}) => ({
  nome: medico.nome || "",
  crm: medico.crm || "",
  ufCrm: medico.ufCrm || "",
  especialidade: medico.especialidade || "",
  tipo: medico.tipo || "Solicitante",
});

const buildUbsDraft = (ubs = {}) => ({
  nome: ubs.nome || "",
  cnes: ubs.cnes || "",
});

const buildProcedimentoDraft = (procedimento = {}) => ({
  tipoExameId: procedimento.tipoExameId ?? "",
  nome: procedimento.nome || "",
  valor: procedimento.valor ?? "",
});

export default function ModalEdicaoCadastro({
  editingItem,
  editingType,
  formPessoa,
  setFormPessoa,
  formMedico,
  setFormMedico,
  formUbs,
  setFormUbs,
  formProcedimento,
  setFormProcedimento,
  handleSavePessoa,
  handleSaveMedico,
  handleSaveUbs,
  handleSaveProcedimento,
  auxData,
  onClose,
  maskTelefone,
  maskCep,
  onlyDigits,
}) {
  const [draftPessoa, setDraftPessoa] = useState(buildPessoaDraft());
  const [draftMedico, setDraftMedico] = useState(buildMedicoDraft());
  const [draftUbs, setDraftUbs] = useState(buildUbsDraft());
  const [draftProcedimento, setDraftProcedimento] = useState(
    buildProcedimentoDraft(),
  );

  useEffect(() => {
    if (editingType === "PESSOA") {
      setDraftPessoa(buildPessoaDraft(editingItem));
    }
    if (editingType === "MEDICO") {
      setDraftMedico(buildMedicoDraft(editingItem));
    }
    if (editingType === "UBS") {
      setDraftUbs(buildUbsDraft(editingItem));
    }
    if (editingType === "PROCEDIMENTO") {
      setDraftProcedimento(buildProcedimentoDraft(editingItem));
    }
  }, [editingItem, editingType]);

  if (!editingItem || !editingType) return null;

  const getTitulo = () => {
    if (editingType === "PESSOA")
      return `✏️ Editar Paciente — ${editingItem.nomeCompleto}`;
    if (editingType === "MEDICO")
      return `✏️ Editar Médico — ${editingItem.nome}`;
    if (editingType === "UBS") return `✏️ Editar Unidade — ${editingItem.nome}`;
    if (editingType === "PROCEDIMENTO")
      return `✏️ Editar Procedimento — ${editingItem.nome}`;
    return "✏️ Editar";
  };

  const isLarge = editingType === "PESSOA";

  // Wrapper para limpar máscara antes de salvar paciente
  const handleSubmitPessoa = (e) => {
    e.preventDefault();
    const payload = {
      ...draftPessoa,
      telefone: onlyDigits(draftPessoa.telefone || ""),
      cep: onlyDigits(draftPessoa.cep || ""),
    };
    handleSavePessoa(payload);
  };

  const handleSubmitMedico = (e) => {
    e.preventDefault();
    handleSaveMedico(draftMedico);
  };

  const handleSubmitUbs = (e) => {
    e.preventDefault();
    handleSaveUbs(draftUbs);
  };

  const handleSubmitProcedimento = (e) => {
    e.preventDefault();
    handleSaveProcedimento(draftProcedimento);
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.modalContent} ${isLarge ? styles.modalLarge : styles.modalMedium}`}
      >
        <div className={styles.modalHeader}>
          <h3>{getTitulo()}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        {/* FORMULÁRIO PACIENTE */}
        {editingType === "PESSOA" && (
          <form onSubmit={handleSubmitPessoa} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados Pessoais</p>
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldGroup}>
                <label>CPF</label>
                <input
                  type="text"
                  value={draftPessoa.cpf}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={draftPessoa.nomeCompleto}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
                      nomeCompleto: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  value={draftPessoa.dataNascimento}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
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
                  value={draftPessoa.nomeMae}
                  onChange={(e) =>
                    setDraftPessoa({ ...draftPessoa, nomeMae: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Telefone</label>
                <input
                  type="text"
                  value={draftPessoa.telefone}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
                      telefone: maskTelefone(e.target.value),
                    })
                  }
                  placeholder="(32) 99999-8888"
                />
              </div>
            </div>

            <p className={styles.sectionTitle}>Endereço</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Logradouro / Rua</label>
                <input
                  type="text"
                  value={draftPessoa.logradouro}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
                      logradouro: e.target.value,
                    })
                  }
                  placeholder="Ex: Rua Paschoal Bernardino"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Número</label>
                <input
                  type="text"
                  value={draftPessoa.numero}
                  onChange={(e) =>
                    setDraftPessoa({ ...draftPessoa, numero: e.target.value })
                  }
                  placeholder="Ex: 100"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Complemento</label>
                <input
                  type="text"
                  value={draftPessoa.complemento}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
                      complemento: e.target.value,
                    })
                  }
                  placeholder="Ex: Apto 201"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Bairro</label>
                <input
                  type="text"
                  value={draftPessoa.bairro}
                  onChange={(e) =>
                    setDraftPessoa({ ...draftPessoa, bairro: e.target.value })
                  }
                  placeholder="Ex: Centro"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Cidade</label>
                <input
                  type="text"
                  value={draftPessoa.cidade}
                  onChange={(e) =>
                    setDraftPessoa({ ...draftPessoa, cidade: e.target.value })
                  }
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>UF</label>
                <input
                  type="text"
                  value={draftPessoa.uf}
                  onChange={(e) =>
                    setDraftPessoa({ ...draftPessoa, uf: e.target.value })
                  }
                  maxLength={2}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CEP</label>
                <input
                  type="text"
                  value={draftPessoa.cep}
                  onChange={(e) =>
                    setDraftPessoa({
                      ...draftPessoa,
                      cep: maskCep(e.target.value),
                    })
                  }
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.secondaryBtn}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.primaryBtn}>
                💾 Atualizar Paciente
              </button>
            </div>
          </form>
        )}

        {/* FORMULÁRIO MÉDICO */}
        {editingType === "MEDICO" && (
          <form onSubmit={handleSubmitMedico} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados do Médico</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Nome do Médico *</label>
                <input
                  type="text"
                  value={draftMedico.nome}
                  onChange={(e) =>
                    setDraftMedico({ ...draftMedico, nome: e.target.value })
                  }
                  placeholder="Ex: Dr. Roberto Silva"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CRM *</label>
                <input
                  type="text"
                  value={draftMedico.crm}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>UF do CRM</label>
                <input
                  type="text"
                  value={draftMedico.ufCrm}
                  onChange={(e) =>
                    setDraftMedico({ ...draftMedico, ufCrm: e.target.value })
                  }
                  maxLength={2}
                  required
                />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Especialidade</label>
                <input
                  type="text"
                  value={draftMedico.especialidade}
                  onChange={(e) =>
                    setDraftMedico({
                      ...draftMedico,
                      especialidade: e.target.value,
                    })
                  }
                  placeholder="Ex: Cardiologia"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tipo</label>
                <select
                  value={draftMedico.tipo}
                  onChange={(e) =>
                    setDraftMedico({ ...draftMedico, tipo: e.target.value })
                  }
                >
                  <option value="Solicitante">Solicitante</option>
                  <option value="Regulador">Regulador</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.secondaryBtn}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.primaryBtn}>
                💾 Atualizar Médico
              </button>
            </div>
          </form>
        )}

        {/* FORMULÁRIO UBS */}
        {editingType === "UBS" && (
          <form onSubmit={handleSubmitUbs} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados da Unidade de Saúde</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Nome da Unidade / UBS *</label>
                <input
                  type="text"
                  value={draftUbs.nome}
                  onChange={(e) =>
                    setDraftUbs({ ...draftUbs, nome: e.target.value })
                  }
                  placeholder="Ex: UBS Bairro Central"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Código CNES *</label>
                <input
                  type="text"
                  value={draftUbs.cnes}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.secondaryBtn}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.primaryBtn}>
                💾 Atualizar UBS
              </button>
            </div>
          </form>
        )}
        {/* FORMULÁRIO PROCEDIMENTO */}
        {editingType === "PROCEDIMENTO" && (
          <form
            onSubmit={handleSubmitProcedimento}
            className={styles.modalForm}
          >
            <p className={styles.sectionTitle}>Dados do Procedimento</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Nome do Procedimento *</label>
                <input
                  type="text"
                  value={draftProcedimento.nome}
                  onChange={(e) =>
                    setDraftProcedimento({
                      ...draftProcedimento,
                      nome: e.target.value,
                    })
                  }
                  placeholder="Ex: Ecocardiograma com Doppler"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tipo de Exame *</label>
                <select
                  value={draftProcedimento.tipoExameId}
                  onChange={(e) =>
                    setDraftProcedimento({
                      ...draftProcedimento,
                      tipoExameId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Selecione --</option>
                  {auxData.tiposExame.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={draftProcedimento.valor}
                  onChange={(e) =>
                    setDraftProcedimento({
                      ...draftProcedimento,
                      valor: e.target.value,
                    })
                  }
                  placeholder="Ex: 180.00"
                  required
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.secondaryBtn}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.primaryBtn}>
                💾 Atualizar Procedimento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
