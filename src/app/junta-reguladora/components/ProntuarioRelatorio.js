'use client';

import { useState } from 'react';
import { buscarPessoaExistente } from '../actions';
import styles from './ProntuarioRelatorio.module.css';

export default function ProntuarioRelatorio({ prontuarioData, onBuscar }) {
  const [termo, setTermo] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleInputChange = async (valor) => {
    setTermo(valor);
    if (valor.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const resultados = await buscarPessoaExistente(valor.trim());
        setSugestoes(resultados || []);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        setSugestoes([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSugestoes([]);
      setShowDropdown(false);
    }
  };

  const handleSelectPessoa = (pessoa) => {
    setTermo(pessoa.cpf || pessoa.nomeCompleto);
    setShowDropdown(false);
    if (onBuscar) {
      onBuscar(pessoa.cpf);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!termo.trim()) return alert('Digite um Nome ou CPF para pesquisar.');
    setShowDropdown(false);
    if (onBuscar) {
      onBuscar(termo.trim());
    }
  };

  const paciente = prontuarioData?.paciente;
  const historico = prontuarioData?.historico || [];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Prontuário Unificado e Relatório de Serviços</h3>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className={styles.searchRow}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Digite o Nome ou CPF do paciente para buscar no banco..."
              value={termo}
              onChange={(e) => handleInputChange(e.target.value)}
              style={{ width: '100%' }}
            />

            {/* LISTA SUSPENSA DE AUTOCOMPLETAR AO DIGITAR */}
            {showDropdown && sugestoes.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 99,
                  listStyle: 'none',
                  padding: 0,
                  margin: '4px 0 0 0',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {sugestoes.map((p, index) => (
                  <li
                    key={p.cpf ? `${p.cpf}-${index}` : index}
                    onClick={() => handleSelectPessoa(p)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '0.9rem',
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <strong>{p.nomeCompleto || p.nome}</strong> — CPF: {formatCPF(p.cpf)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className={styles.primaryBtn}>
            {isSearching ? 'Buscando...' : 'Buscar Prontuário'}
          </button>
        </form>
      </div>

      {paciente ? (
        <div className={styles.prontuarioBox}>
          {/* DADOS GERAIS */}
          <div className={styles.infoCard}>
            <h4>Dados do Paciente</h4>
            <p><strong>Nome:</strong> {paciente.nome}</p>
            <p><strong>CPF:</strong> {formatCPF(paciente.cpf)}</p>
            <p><strong>Nome da Mãe:</strong> {paciente.nomeMae || 'Não informado'}</p>
            <p><strong>Data Nascimento:</strong> {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
            <p><strong>Telefone:</strong> {paciente.telefone || 'Não informado'}</p>
            <p><strong>Deficiência/Diagnóstico:</strong> {paciente.tipo_deficiencia || 'Não informado'}</p>
            <p><strong>Endereço:</strong> {paciente.logradouro ? `${paciente.logradouro}, ${paciente.numero} - ${paciente.bairro}` : 'Não informado'}</p>
          </div>

          {/* SERVIÇOS ATIVOS */}
          <div className={styles.infoCard}>
            <h4>Serviços onde o Paciente está Ativo</h4>
            <div className={styles.badgesGroup}>
              {paciente.servicos_ativos && paciente.servicos_ativos.length > 0 ? (
                paciente.servicos_ativos.map((servico) => (
                  <span key={servico} className={styles.activeBadge}>
                    🟢 {servico}
                  </span>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhum serviço ativo vinculado.</span>
              )}
            </div>
          </div>

          {/* HISTÓRICO DE FREQUÊNCIAS */}
          <div className={styles.historySection}>
            <h4>Histórico Multidisciplinar de Atendimentos</h4>
            {historico.length === 0 ? (
              <p className={styles.emptyMsg}>Nenhum registro de atendimento gravado até o momento.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Especialidade</th>
                    <th>Status</th>
                    <th>Profissional</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                      <td><strong>{item.servico}</strong></td>
                      <td>{item.especialidade}</td>
                      <td>
                        <span className={styles[item.status]}>
                          {item.status === 'PRESENCA' && 'Presença'}
                          {item.status === 'FALTA' && 'Falta'}
                          {item.status === 'FALTA_JUSTIFICADA' && 'Falta Justificada'}
                        </span>
                      </td>
                      <td>{item.profissional || '-'}</td>
                      <td>{item.observacao || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.placeholderBox}>
          Digite o nome ou CPF no campo acima para pesquisar o histórico do paciente no banco de dados.
        </div>
      )}
    </div>
  );
}