'use client';

import { useState } from 'react';
import styles from './ProntuarioRelatorio.module.css';

export default function ProntuarioRelatorio({ prontuarioData, onBuscar }) {
  const [termo, setTermo] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!termo.trim()) return alert('Digite um Nome ou CPF para pesquisar.');
    onBuscar(termo);
  };

  const paciente = prontuarioData?.paciente;
  const historico = prontuarioData?.historico || [];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Prontuário Unificado e Relatório de Serviços</h3>

      <form onSubmit={handleSearchSubmit} className={styles.searchRow}>
        <input
          type="text"
          placeholder="Digite o Nome ou CPF do paciente para buscar no banco..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <button type="submit" className={styles.primaryBtn}>Buscar Prontuário</button>
      </form>

      {paciente ? (
        <div className={styles.prontuarioBox}>
          {/* DADOS GERAIS */}
          <div className={styles.infoCard}>
            <h4>Dados do Paciente</h4>
            <p><strong>Nome:</strong> {paciente.nome}</p>
            <p><strong>CPF:</strong> {paciente.cpf}</p>
            <p><strong>Data Nascimento:</strong> {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
            <p><strong>Telefone:</strong> {paciente.telefone || 'Não informado'}</p>
            <p><strong>Deficiência/Diagnóstico:</strong> {paciente.tipo_deficiencia}</p>
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