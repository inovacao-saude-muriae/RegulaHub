"use client";

import { useState } from "react";
import styles from "./CadastroPacientes.module.css";
import ModalConfirmacaoExclusao from "./Modals/ModalConfirmacaoExclusao";
import { createPessoa, updatePessoa, deletePessoa } from "../actions";

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

export default function TabCadastroPacientes({
  formPessoa,
  setFormPessoa,
  auxData = { pessoas: [] },
  reloadData = () => {},
}) {
  const [deleteConfig, setDeleteConfig] = useState(null);

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

  return (
    <div className={styles.card}>
      <ModalConfirmacaoExclusao
        config={deleteConfig}
        onConfirm={() => {
          if (deleteConfig?.onConfirm) deleteConfig.onConfirm();
          setDeleteConfig(null);
        }}
        onCancel={() => setDeleteConfig(null)}
      />

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
                  setDeleteConfig({
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
  );
}