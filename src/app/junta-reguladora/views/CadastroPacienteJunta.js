'use client';

import { useState } from 'react';
import Image from 'next/image';
import { buscarPessoaExistente } from '../actions';
import styles from './CadastroPacienteJunta.module.css';

const LOCAIS_DISPONIVEIS = [
  'CAEE',
  'APAE',
  'Ambulatório',
  'Educação',
  'Social',
  'Centro de Especialidades',
  'Centro de Reabilitação',
];

export default function CadastroPacienteJunta({ onCadastrar }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    cpf: '',
    nomeCompleto: '',
    sexo: 'Masculino',
    dataNascimento: '',
    nomeMae: '',
    telefone: '',
    tipoDeficiencia: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Muriaé',
    uf: 'MG',
    locaisEncaminhados: [],
  });

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
    const nomeSelecionado = pessoa.nomeCompleto || pessoa.nome || '';

    setSelectedPatient(pessoa);
    setEditingId(pessoa.id || null);
    
    // Atualiza o input de busca para exibir o NOME do paciente selecionado
    setSearchTerm(nomeSelecionado);

    setForm({
      cpf: pessoa.cpf || '',
      nomeCompleto: nomeSelecionado,
      sexo: pessoa.sexo || 'Masculino',
      dataNascimento: pessoa.dataNascimento
        ? new Date(pessoa.dataNascimento).toISOString().split('T')[0]
        : '',
      nomeMae: pessoa.nomeMae || '',
      telefone: pessoa.telefone || '',
      tipoDeficiencia: pessoa.tipoDeficiencia || '',
      cep: pessoa.cep || '',
      logradouro: pessoa.logradouro || '',
      numero: pessoa.numero || '',
      complemento: pessoa.complemento || '',
      bairro: pessoa.bairro || '',
      cidade: pessoa.cidade || 'Muriaé',
      uf: pessoa.uf || 'MG',
      locaisEncaminhados: pessoa.servicosAtivos || [],
    });

    setShowDropdown(false);
    setIsReadOnly(true);
  };

  const handleEnableEdit = () => {
    if (!selectedPatient && !form.cpf) return;
    setIsReadOnly(false);
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedPatient(null);
    setEditingId(null);
    setForm({
      cpf: '',
      nomeCompleto: '',
      sexo: 'Masculino',
      dataNascimento: '',
      nomeMae: '',
      telefone: '',
      tipoDeficiencia: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Muriaé',
      uf: 'MG',
      locaisEncaminhados: [],
    });
  };

  const handleNewRegistration = () => {
    handleClearAll();
    setIsReadOnly(false);
  };

  const handleCancel = () => {
    handleClearAll();
    setIsReadOnly(true);
  };

  const handleCheckboxChange = (local) => {
    if (isReadOnly) return;
    setForm((prev) => {
      const exists = prev.locaisEncaminhados.includes(local);
      return {
        ...prev,
        locaisEncaminhados: exists
          ? prev.locaisEncaminhados.filter((l) => l !== local)
          : [...prev.locaisEncaminhados, local],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!form.cpf || !form.nomeCompleto || !form.tipoDeficiencia || !form.sexo) {
      return alert('Preencha os campos obrigatórios (*).');
    }

    if (onCadastrar) {
      await onCadastrar(form);
    }

    setIsReadOnly(true);
  };

  return (
    <div className={styles.card}>
      {/* CARD 1: BUSCA DO PACIENTE E BOTÕES DE AÇÃO */}
      <div className={styles.searchSectionContainer}>
        <div className={styles.fieldGroup} style={{ marginBottom: '0.5rem' }}>
          <label>Buscar Paciente no Banco (CPF ou Nome)</label>
        </div>

        <div className={styles.searchActionRow}>
          <div className={styles.autocompleteWrapper}>
            <input
              type="text"
              placeholder="Digite o CPF ou Nome do paciente..."
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
            />

            {showDropdown && searchResults.length > 0 && (
              <ul className={styles.suggestionsDropdown}>
                {searchResults.map((pessoa, index) => (
                  <li
                    key={pessoa.cpf ? `${pessoa.cpf}-${index}` : index}
                    onClick={() => handleSelectPessoa(pessoa)}
                  >
                    <strong>{pessoa.nomeCompleto || pessoa.nome}</strong> — CPF: {formatCPF(pessoa.cpf)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" className={`${styles.iconSquareBtn} ${styles.btnBlue}`} title="Buscar">
            <Image src="/img/icon/lupa.png" alt="Buscar" width={22} height={22} className={styles.iconImg} />
          </button>

          {/* BOTÃO LÁPIS - ATIVA AO SELECIONAR PACIENTE */}
          {selectedPatient && (
            <button
              type="button"
              className={`${styles.iconSquareBtn} ${styles.btnOrange}`}
              onClick={handleEnableEdit}
              title="Habilitar Edição"
            >
              <Image src="/img/icon/editar.png" alt="Editar" width={22} height={22} className={styles.iconImg} />
            </button>
          )}

          <button
            type="button"
            className={`${styles.iconSquareBtn} ${styles.btnGreen}`}
            onClick={handleNewRegistration}
            title="Novo Cadastro"
          >
            <Image src="/img/icon/mais.png" alt="Adicionar" width={22} height={22} className={styles.iconImg} />
          </button>
        </div>

        {isSearching && <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Consultando...</span>}
      </div>

      {/* FORMULÁRIO EM GRID STRICT DE 12 COLUNAS */}
      <form onSubmit={handleSubmit} className={styles.patientFormContainer}>
        {/* DADOS PESSOAIS */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>DADOS PESSOAIS E CONTATO</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
              <label>CPF *</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Nome Completo *</label>
              <input
                type="text"
                value={form.nomeCompleto}
                onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colSexo}`}>
              <label>Sexo *</label>
              <select
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                disabled={isReadOnly}
                required
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colBirth}`}>
              <label>Data de Nascimento *</label>
              <input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colMother}`}>
              <label>Nome da Mãe *</label>
              <input
                type="text"
                value={form.nomeMae}
                onChange={(e) => setForm({ ...form, nomeMae: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colPhone}`}>
              <label>Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colFull}`}>
              <label>Tipo de Deficiência / Diagnóstico *</label>
              <input
                type="text"
                placeholder="Ex: Deficiência Auditiva, TEA, Síndrome de Down..."
                value={form.tipoDeficiencia}
                onChange={(e) => setForm({ ...form, tipoDeficiencia: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>
          </div>
        </div>

        {/* ENDEREÇO RESIDENCIAL */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>ENDEREÇO RESIDENCIAL</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colCep}`}>
              <label>CEP</label>
              <input
                type="text"
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colStreet}`}>
              <label>Logradouro / Rua</label>
              <input
                type="text"
                value={form.logradouro}
                onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colNumber}`}>
              <label>Número</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colComp}`}>
              <label>Complemento</label>
              <input
                type="text"
                value={form.complemento}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colDistrict}`}>
              <label>Bairro</label>
              <input
                type="text"
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colCity}`}>
              <label>Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colUf}`}>
              <label>UF</label>
              <input
                type="text"
                maxLength={2}
                value={form.uf}
                onChange={(e) => setForm({ ...form, uf: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        {/* LOCAIS DE ENCAMINHAMENTO */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>LOCAIS DE ENCAMINHAMENTO / VINCULADOS</h4>
          </div>
          <div className={styles.checkboxGrid}>
            {LOCAIS_DISPONIVEIS.map((local) => (
              <label key={local} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.locaisEncaminhados.includes(local)}
                  onChange={() => handleCheckboxChange(local)}
                  disabled={isReadOnly}
                />
                <span>{local}</span>
              </label>
            ))}
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        {!isReadOnly && (
          <div className={styles.formActions}>
            <button type="button" onClick={handleCancel} className={styles.btnRedAction}>
              Cancelar
            </button>
            <button
              type="submit"
              className={editingId ? styles.updateBtn : styles.primaryBtn}
            >
              {editingId ? '💾 Salvar Alterações' : 'Salvar Paciente na Junta'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}