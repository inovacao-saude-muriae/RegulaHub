'use client';

import { useState } from 'react';
import { buscarPessoaExistente } from '../actions';
import styles from './TabPacientesJudiciais.module.css';

export default function TabPacientesJudiciais({
  pacientes = [],
  catalogo = [],
  onCreatePaciente,
  onUpdatePaciente,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    numeroPasta: '',
    numeroProcesso: '',
    cpf: '',
    nomeCompleto: '',
    dataNascimento: '',
    nomeMae: '',
    telefone: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Muriaé',
    uf: 'MG',
    cep: '',
    status: 'Ativo'
  });

  const [medicamentosForm, setMedicamentosForm] = useState([
    { medicamentoId: '', qtdMensal: '', statusMedication: 'Ativo' }
  ]);

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const removeDuplicadosPorCPF = (lista) => {
    if (!Array.isArray(lista)) return [];
    const cpfsVistos = new Set();
    return lista.filter((item) => {
      const cpfLimpo = (item.cpf || '').replace(/\D/g, '');
      if (!cpfLimpo) return true;
      if (cpfsVistos.has(cpfLimpo)) return false;
      cpfsVistos.add(cpfLimpo);
      return true;
    });
  };

  const handleInputChange = async (valor) => {
    setSearchTerm(valor);
    if (valor.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const resultados = await buscarPessoaExistente(valor.trim());
        setSearchResults(removeDuplicadosPorCPF(resultados || []));
      } catch (error) {
        console.error('Erro ao buscar pessoa:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectPessoa = (pessoa) => {
    const pacienteExistente = pacientes.find(
      (p) => (p.cpf || '').replace(/\D/g, '') === (pessoa.cpf || '').replace(/\D/g, '')
    );

    setSelectedPatient(pacienteExistente || pessoa);
    setEditingId(pacienteExistente ? (pacienteExistente.id || pacienteExistente.numeroPasta) : null);

    setForm({
      numeroPasta: pacienteExistente?.numeroPasta || '',
      numeroProcesso: pacienteExistente?.numeroProcesso || '',
      cpf: pessoa.cpf || '',
      nomeCompleto: pessoa.nomeCompleto || pessoa.nome || '',
      dataNascimento: pessoa.dataNascimento ? pessoa.dataNascimento.split('T')[0] : '',
      nomeMae: pessoa.nomeMae || '',
      telefone: pessoa.telefone || '',
      logradouro: pessoa.logradouro || '',
      numero: pessoa.numero || '',
      complemento: pessoa.complemento || '',
      bairro: pessoa.bairro || '',
      cidade: pessoa.cidade || 'Muriaé',
      uf: pessoa.uf || 'MG',
      cep: pessoa.cep || '',
      status: pacienteExistente?.status || 'Ativo'
    });

    if (pacienteExistente?.medicamentosLista?.length > 0) {
      setMedicamentosForm(
        pacienteExistente.medicamentosLista.map((m) => ({
          medicamentoId: m.medicamentoId || m.id,
          qtdMensal: m.qtdMensal || m.quantidade || '',
          statusMedication: m.statusMedication || m.status || 'Ativo'
        }))
      );
    } else {
      setMedicamentosForm([{ medicamentoId: '', qtdMensal: '', statusMedication: 'Ativo' }]);
    }

    setShowDropdown(false);
    setIsReadOnly(true);
  };

  const handleEnableEdit = () => {
    if (!selectedPatient && !form.cpf && !form.nomeCompleto) {
      return alert('Selecione um paciente na busca antes de habilitar a edição.');
    }
    setIsReadOnly(false);
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedPatient(null);
    setEditingId(null);
    setForm({
      numeroPasta: '',
      numeroProcesso: '',
      cpf: '',
      nomeCompleto: '',
      dataNascimento: '',
      nomeMae: '',
      telefone: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Muriaé',
      uf: 'MG',
      cep: '',
      status: 'Ativo'
    });
    setMedicamentosForm([{ medicamentoId: '', qtdMensal: '', statusMedication: 'Ativo' }]);
  };

  const handleNewRegistration = () => {
    handleClearAll();
    setIsReadOnly(false);
  };

  const handleCancel = () => {
    handleClearAll();
    setIsReadOnly(true);
  };

  const handleAddMedRow = () => {
    if (isReadOnly) return;
    setMedicamentosForm((prev) => [
      ...prev,
      { medicamentoId: '', qtdMensal: '', statusMedication: 'Ativo' }
    ]);
  };

  const handleRemoveMedRow = (index) => {
    if (isReadOnly) return;
    setMedicamentosForm((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    if (isReadOnly) return;
    setMedicamentosForm((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!form.numeroPasta || !form.numeroProcesso || !form.cpf || !form.nomeCompleto) {
      return alert('Preencha os campos obrigatórios do paciente e processo.');
    }

    const payload = {
      ...form,
      medicamentos: medicamentosForm
    };

    if (editingId && onUpdatePaciente) {
      await onUpdatePaciente(editingId, payload);
    } else if (onCreatePaciente) {
      await onCreatePaciente(payload);
    }

    setIsReadOnly(true);
  };

  return (
    <div className={styles.container}>
      {/* 🎯 CONTAINER UNIFICADO COM FUNDO BRANCO */}
      <div className={styles.mainWrapper}>
        {/* BARRA DE BUSCA */}
        <div className={styles.searchBlock}>
          <label className={styles.searchLabel}>Buscar Paciente no Banco (CPF ou Nome)</label>

          <div className={styles.searchBarRow}>
            <div className={styles.inputSearchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Digite o CPF ou Nome do paciente..."
                value={searchTerm}
                onChange={(e) => handleInputChange(e.target.value)}
              />

              {showDropdown && searchResults.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {searchResults.map((pessoa, index) => (
                    <li
                      key={pessoa.cpf ? `${pessoa.cpf}-${index}` : index}
                      className={styles.suggestionItem}
                      onClick={() => handleSelectPessoa(pessoa)}
                    >
                      <strong>{pessoa.nomeCompleto || pessoa.nome}</strong> — CPF: {formatCPF(pessoa.cpf)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="button" className={styles.searchBtn} title="Buscar">
              <img src="/img/icon/lupa.png" alt="Buscar" width={20} height={20} />
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleEnableEdit}
              disabled={!selectedPatient && !form.cpf}
              title={selectedPatient || form.cpf ? 'Habilitar Edição dos Campos' : 'Selecione um paciente para editar'}
            >
              <img src="/img/icon/editar.png" alt="Editar" width={18} height={18} />
            </button>

            <button
              type="button"
              className={styles.addBtn}
              onClick={handleNewRegistration}
              title="Novo Cadastro Limpo"
            >
              <img src="/img/icon/mais.png" alt="Novo" width={20} height={20} />
            </button>
          </div>

          {isSearching && <div className={styles.loadingBox}>Consultando banco de dados...</div>}
        </div>

        <hr className={styles.divider} />

        {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {/* DADOS DO PROCESSO JUDICIAL */}
          <div className={styles.cardSection}>
            <h3 className={styles.sectionHeaderTitle}>DADOS DO PROCESSO JUDICIAL</h3>
            <div className={styles.gridProcesso}>
              <div className={styles.fieldGroup}>
                <label>Nº Pasta Judicial *</label>
                <input
                  type="text"
                  placeholder="Ex: PJ-2026/089"
                  value={form.numeroPasta}
                  onChange={(e) => setForm({ ...form, numeroPasta: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Nº do Processo Judicial *</label>
                <input
                  type="text"
                  placeholder="Ex: 5001234-56.2026.8.13.0439"
                  value={form.numeroProcesso}
                  onChange={(e) => setForm({ ...form, numeroProcesso: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Status do Paciente *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  disabled={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Falecido">Falecido</option>
                </select>
              </div>
            </div>
          </div>

          {/* DADOS PESSOAIS E CONTATO */}
          <div className={styles.cardSection}>
            <h3 className={styles.sectionHeaderTitle}>DADOS PESSOAIS E CONTATO</h3>
            <div className={styles.gridPessoaisRow1}>
              <div className={styles.fieldGroup}>
                <label>CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={form.nomeCompleto}
                  onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>
            </div>

            <div className={styles.gridPessoaisRow2}>
              <div className={styles.fieldGroup}>
                <label>Nome da Mãe *</label>
                <input
                  type="text"
                  value={form.nomeMae}
                  onChange={(e) => setForm({ ...form, nomeMae: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>
            </div>
          </div>

          {/* ENDEREÇO RESIDENCIAL */}
          <div className={styles.cardSection}>
            <h3 className={styles.sectionHeaderTitle}>ENDEREÇO RESIDENCIAL</h3>
            <div className={styles.gridEnderecoRow1}>
              <div className={styles.fieldGroup}>
                <label>CEP</label>
                <input
                  type="text"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Logradouro / Rua</label>
                <input
                  type="text"
                  value={form.logradouro}
                  onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Número</label>
                <input
                  type="text"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>
            </div>

            <div className={styles.gridEnderecoRow2}>
              <div className={styles.fieldGroup}>
                <label>Complemento</label>
                <input
                  type="text"
                  value={form.complemento}
                  onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Bairro</label>
                <input
                  type="text"
                  value={form.bairro}
                  onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Cidade</label>
                <input
                  type="text"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>UF</label>
                <input
                  type="text"
                  maxLength={2}
                  value={form.uf}
                  onChange={(e) => setForm({ ...form, uf: e.target.value })}
                  readOnly={isReadOnly}
                  className={isReadOnly ? styles.readOnlyInput : ''}
                />
              </div>
            </div>
          </div>

          {/* MEDICAMENTOS DO TRATAMENTO */}
          <div className={styles.cardSection}>
            <h3 className={styles.sectionHeaderTitle}>MEDICAMENTOS E PRESCRIÇÃO MENSAL</h3>
            {medicamentosForm.map((med, idx) => (
              <div key={idx} className={styles.treatmentGrid}>
                <div className={styles.fieldGroup}>
                  <label>Medicamento do Catálogo</label>
                  <select
                    value={med.medicamentoId}
                    onChange={(e) => handleMedChange(idx, 'medicamentoId', e.target.value)}
                    disabled={isReadOnly}
                    className={isReadOnly ? styles.readOnlyInput : ''}
                  >
                    <option value="">-- Selecione do Catálogo --</option>
                    {catalogo.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome} ({item.dosagem})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Qtd Prescrita Mensal</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 30"
                    value={med.qtdMensal}
                    onChange={(e) => handleMedChange(idx, 'qtdMensal', e.target.value)}
                    readOnly={isReadOnly}
                    className={isReadOnly ? styles.readOnlyInput : ''}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Status do Medicamento</label>
                  <select
                    value={med.statusMedication || 'Ativo'}
                    onChange={(e) => handleMedChange(idx, 'statusMedication', e.target.value)}
                    disabled={isReadOnly}
                    className={isReadOnly ? styles.readOnlyInput : ''}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Descontinuado">Descontinuado</option>
                  </select>
                </div>

                {!isReadOnly && medicamentosForm.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedRow(idx)}
                    className={styles.removeRowBtn}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}

            {!isReadOnly && (
              <button type="button" onClick={handleAddMedRow} className={styles.addRowBtn}>
                + Adicionar Outro Medicamento
              </button>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          {!isReadOnly && (
            <div className={styles.formActions}>
              <button type="button" onClick={handleCancel} className={styles.secondaryBtn}>
                Cancelar
              </button>
              <button type="submit" className={styles.primaryBtn}>
                {editingId ? '💾 Salvar Alterações' : 'Salvar Paciente e Processo'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}