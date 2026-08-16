'use client';

import { useState } from 'react';
import { buscarPessoaExistente } from '../actions';
import styles from './TabPacientesJudiciais.module.css';

export default function TabPacientesJudiciais({
  pacientes,
  catalogo,
  onCreatePaciente,
  loading
}) {
  // Campo de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pessoaCadastrada, setPessoaCadastrada] = useState(false);

  // Formulário do Paciente Judicial
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
    cidade: '',
    uf: '',
    cep: ''
  });

  const [medicamentosForm, setMedicamentosForm] = useState([
    { medicamentoId: '', qtdMensal: '' }
  ]);

  // Função para buscar pessoa no banco
  const handleSearchPessoa = async (valor) => {
    setSearchTerm(valor);
    if (valor.length >= 2) {
      setIsSearching(true);
      const resultados = await buscarPessoaExistente(valor);
      setSearchResults(resultados || []);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  // Selecionar pessoa encontrada
  const handleSelectPessoa = (pessoa) => {
    setForm(prev => ({
      ...prev,
      cpf: pessoa.cpf,
      nomeCompleto: pessoa.nomeCompleto,
      dataNascimento: pessoa.dataNascimento || '',
      nomeMae: pessoa.nomeMae || '',
      telefone: pessoa.telefone || '',
      logradouro: pessoa.logradouro || '',
      numero: pessoa.numero || '',
      complemento: pessoa.complemento || '',
      bairro: pessoa.bairro || '',
      cidade: pessoa.cidade || '',
      uf: pessoa.uf || '',
      cep: pessoa.cep || ''
    }));
    setPessoaCadastrada(true);
    setSearchResults([]);
    setSearchTerm(`${pessoa.nomeCompleto} (${pessoa.cpf})`);
  };

  // Limpar busca para novo cadastro manual
  const handleClearPessoa = () => {
    setPessoaCadastrada(false);
    setSearchTerm('');
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
      cidade: '',
      uf: '',
      cep: ''
    });
  };

  const handleAddMedRow = () => {
    setMedicamentosForm(prev => [...prev, { medicamentoId: '', qtdMensal: '' }]);
  };

  const handleRemoveMedRow = (index) => {
    setMedicamentosForm(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    setMedicamentosForm(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numeroPasta || !form.numeroProcesso || !form.cpf || !form.nomeCompleto || !form.dataNascimento || !form.nomeMae) {
      return alert('Preencha os campos obrigatórios do paciente e do processo.');
    }

    await onCreatePaciente({
      ...form,
      medicamentos: medicamentosForm
    });

    handleClearPessoa();
    setMedicamentosForm([{ medicamentoId: '', qtdMensal: '' }]);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Cadastrar Paciente Judicial / Processo</h2>

      {/* BLOCAGEM DE BUSCA PRÉVIA DE PESSOA */}
      <div className={`${styles.fieldGroup} ${styles.fullWidth} ${styles.searchSection}`}>
        <label>1º Passo: Buscar Paciente Existente (Digite Nome ou CPF)</label>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Digite Nome ou CPF para verificar se já existe no sistema..." 
            value={searchTerm} 
            onChange={(e) => handleSearchPessoa(e.target.value)} 
          />
          {pessoaCadastrada && (
            <button type="button" onClick={handleClearPessoa} className={styles.clearSearchBtn}>
              🔄 Nova Busca / Limpar
            </button>
          )}
        </div>

        {/* SUGESTÕES DE AUTOCOMPLETAR */}
        {searchResults.length > 0 && !pessoaCadastrada && (
          <ul className={styles.suggestionsList}>
            {searchResults.map((p) => (
              <li key={p.cpf} onClick={() => handleSelectPessoa(p)} className={styles.suggestionItem}>
                <strong>{p.nomeCompleto}</strong> — CPF: {p.cpf} | Mãe: {p.nomeMae || 'Não informada'}
              </li>
            ))}
          </ul>
        )}

        {isSearching && <div className={styles.loadingBox}>Buscando registros no banco...</div>}
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* DADOS DENTRO DA FARMÁCIA JUDICIAL */}
        <div className={`${styles.fullWidth} ${styles.subHeaderMargin}`}>
          <h4 className={styles.sectionHeaderTitle}>2º Passo: Informações do Processo Judicial</h4>
        </div>

        <div className={styles.fieldGroup}>
          <label>Nº Pasta Judicial *</label>
          <input 
            type="text" 
            placeholder="Ex: PJ-2026/089" 
            value={form.numeroPasta} 
            onChange={(e) => setForm({ ...form, numeroPasta: e.target.value })} 
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
            required 
          />
        </div>

        {/* DADOS DA PESSOA */}
        <div className={`${styles.fullWidth} ${styles.subHeaderMargin}`}>
          <h4 className={styles.sectionHeaderTitle}>Dados Pessoais do Paciente</h4>
        </div>

        <div className={styles.fieldGroup}>
          <label>CPF * (Apenas números)</label>
          <input 
            type="text" 
            placeholder="Ex: 12345678901" 
            maxLength={11} 
            value={form.cpf} 
            onChange={(e) => setForm({ ...form, cpf: e.target.value })} 
            readOnly={pessoaCadastrada}
            className={pessoaCadastrada ? styles.readOnlyInput : ''}
            required 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Nome Completo do Paciente *</label>
          <input 
            type="text" 
            placeholder="Ex: Maria José da Silva" 
            value={form.nomeCompleto} 
            onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })} 
            readOnly={pessoaCadastrada}
            className={pessoaCadastrada ? styles.readOnlyInput : ''}
            required 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Data de Nascimento *</label>
          <input 
            type="date" 
            value={form.dataNascimento} 
            onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} 
            readOnly={pessoaCadastrada}
            className={pessoaCadastrada ? styles.readOnlyInput : ''}
            required 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Nome da Mãe *</label>
          <input 
            type="text" 
            placeholder="Ex: Ana Maria da Silva" 
            value={form.nomeMae} 
            onChange={(e) => setForm({ ...form, nomeMae: e.target.value })} 
            readOnly={pessoaCadastrada}
            className={pessoaCadastrada ? styles.readOnlyInput : ''}
            required 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Telefone / WhatsApp</label>
          <input 
            type="text" 
            placeholder="Ex: 32999998888" 
            value={form.telefone} 
            onChange={(e) => setForm({ ...form, telefone: e.target.value })} 
          />
        </div>

        {/* ENDEREÇO DA PESSOA */}
        <div className={`${styles.fullWidth} ${styles.subHeaderMargin}`}>
          <h4 className={styles.sectionHeaderTitle}>Endereço do Paciente</h4>
        </div>

        <div className={styles.fieldGroup}>
          <label>Logradouro / Rua</label>
          <input 
            type="text" 
            placeholder="Ex: Rua Paschoal Bernardino" 
            value={form.logradouro} 
            onChange={(e) => setForm({ ...form, logradouro: e.target.value })} 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Número</label>
          <input 
            type="text" 
            placeholder="Ex: 100" 
            value={form.numero} 
            onChange={(e) => setForm({ ...form, numero: e.target.value })} 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Complemento</label>
          <input 
            type="text" 
            placeholder="Ex: Apto 201" 
            value={form.complemento} 
            onChange={(e) => setForm({ ...form, complemento: e.target.value })} 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Bairro</label>
          <input 
            type="text" 
            placeholder="Ex: Centro" 
            value={form.bairro} 
            onChange={(e) => setForm({ ...form, bairro: e.target.value })} 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Cidade</label>
          <input 
            type="text" 
            placeholder="Ex: Muriaé" 
            value={form.cidade} 
            onChange={(e) => setForm({ ...form, cidade: e.target.value })} 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>UF</label>
          <input 
            type="text" 
            maxLength={2} 
            placeholder="Ex: MG" 
            value={form.uf} 
            onChange={(e) => setForm({ ...form, uf: e.target.value })} 
          />
        </div>

        {/* MEDICAMENTOS DO TRATAMENTO */}
        <div className={`${styles.fullWidth} ${styles.treatmentSection}`}>
          <h4>3º Passo: Medicamentos do Tratamento Judicial (Prescrição Mensal)</h4>
          
          {medicamentosForm.map((med, idx) => (
            <div key={idx} className={styles.treatmentGrid}>
              <div className={styles.fieldGroup}>
                <label>Medicamento Catálogo</label>
                <select 
                  value={med.medicamentoId} 
                  onChange={(e) => handleMedChange(idx, 'medicamentoId', e.target.value)}
                >
                  <option value="">-- Selecione do Catálogo --</option>
                  {catalogo.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nome} ({item.dosagem}) - {item.tipo}
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
                />
              </div>

              {medicamentosForm.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveMedRow(idx)} 
                  className={styles.removeRowBtn}
                >
                  🗑 Remover
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddMedRow} className={styles.addRowBtn}>
            + Adicionar Outro Medicamento ao Tratamento
          </button>
        </div>

        <div className={`${styles.fullWidth} ${styles.formActions}`}>
          <button type="submit" className={styles.primaryBtn}>
            Salvar Paciente e Processo Judicial
          </button>
        </div>
      </form>

      {/* LISTA DE PACIENTES */}
      <h3 className={styles.sectionTitle}>Pacientes Judiciais Cadastrados</h3>
      {loading ? (
        <div className={styles.loadingBox}>Carregando pacientes...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nº Pasta</th>
                <th>Nome do Paciente</th>
                <th>CPF</th>
                <th>Nº Processo</th>
                <th>Status</th>
                <th>Medicamentos Prescritos</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>
                    Nenhum paciente judicial cadastrado.
                  </td>
                </tr>
              ) : (
                pacientes.map(p => (
                  <tr key={p.numeroPasta}>
                    <td><strong>{p.numeroPasta}</strong></td>
                    <td>{p.patientName}</td>
                    <td>{p.cpf}</td>
                    <td>{p.numeroProcesso}</td>
                    <td><span className={styles.badgeActive}>{p.status}</span></td>
                    <td>{p.medicamentosTratamento || 'Sem medicamentos cadastrados'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}