'use client';

import { useState } from 'react';
import styles from './TabDispensacao.module.css';

export default function TabDispensacao({
  pacientes,
  estoqueLotes,
  onConfirmarDispensacao
}) {
  const [search, setSearch] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [responsavelEntrega, setResponsavelEntrega] = useState('');
  const [observacao, setObservacao] = useState('');

  const [carrinhoDispensacao, setCarrinhoDispensacao] = useState([]);
  const [selectedLoteId, setSelectedLoteId] = useState('');
  const [qtdEntregue, setQtdEntregue] = useState('');

  const filteredPacientes = pacientes.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.numeroPasta.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search)
  );

  const handleSelectPaciente = (p) => {
    setSelectedPaciente(p);
    setSearch(`${p.numeroPasta} - ${p.patientName}`);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedLoteId || !qtdEntregue || Number(qtdEntregue) <= 0) {
      return alert('Selecione um lote e informe uma quantidade válida.');
    }

    const lote = estoqueLotes.find(l => String(l.loteId) === String(selectedLoteId));
    if (!lote) return;

    if (Number(qtdEntregue) > lote.qtdAtual) {
      return alert(`Quantidade excede o saldo em estoque deste lote (${lote.qtdAtual} disp).`);
    }

    setCarrinhoDispensacao(prev => [
      ...prev,
      {
        loteId: lote.loteId,
        medicamentoNome: lote.medicamentoNome,
        dosagem: lote.dosagem,
        numeroLote: lote.numeroLote,
        qtdEntregue: Number(qtdEntregue)
      }
    ]);

    setSelectedLoteId('');
    setQtdEntregue('');
  };

  const handleRemoveItem = (index) => {
    setCarrinhoDispensacao(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDispensacao = async (e) => {
    e.preventDefault();
    if (!selectedPaciente) return alert('Selecione o paciente.');
    if (carrinhoDispensacao.length === 0) return alert('Adicione pelo menos um medicamento para dispensar.');
    if (!responsavelEntrega.trim()) return alert('Informe o nome do Responsável pela Entrega.');

    await onConfirmarDispensacao({
      numeroPasta: selectedPaciente.numeroPasta,
      responsavelEntrega,
      observacao,
      itens: carrinhoDispensacao
    });

    setSelectedPaciente(null);
    setSearch('');
    setCarrinhoDispensacao([]);
    setResponsavelEntrega('');
    setObservacao('');
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Dispensação de Medicamentos Judiciais</h2>

      <div className={styles.formGrid}>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label>Buscar Paciente Judicial (Pasta, Nome ou CPF) *</label>
          <input 
            type="text" 
            placeholder="Digite para buscar..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedPaciente(null);
            }} 
          />

          {search && !selectedPaciente && filteredPacientes.length > 0 && (
            <ul className={styles.suggestionsList}>
              {filteredPacientes.map((p) => (
                <li key={p.numeroPasta} onClick={() => handleSelectPaciente(p)} className={styles.suggestionItem}>
                  <strong>Pasta {p.numeroPasta}</strong> - {p.patientName} (CPF: {p.cpf}) | Proc: {p.numeroProcesso}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedPaciente && (
          <div className={`${styles.patientSummaryBox} ${styles.fullWidth}`}>
            <div><strong>Paciente:</strong> {selectedPaciente.patientName}</div>
            <div><strong>Nº Pasta:</strong> {selectedPaciente.numeroPasta}</div>
            <div><strong>Processo:</strong> {selectedPaciente.numeroProcesso}</div>
            <div><strong>Medicamentos em Tratamento:</strong> {selectedPaciente.medicamentosTratamento || 'Nenhum medicamento pré-cadastrado'}</div>
          </div>
        )}

        <div className={`${styles.addMedSection} ${styles.fullWidth}`}>
          <h4>Adicionar Medicamento para Entrega</h4>
          <div className={styles.addMedGrid}>
            <div className={styles.fieldGroup}>
              <label>Selecione o Medicamento / Lote Disponível *</label>
              <select value={selectedLoteId} onChange={(e) => setSelectedLoteId(e.target.value)}>
                <option value="">-- Selecione o Lote do Estoque --</option>
                {estoqueLotes.filter(l => l.qtdAtual > 0).map(l => (
                  <option key={l.loteId} value={l.loteId}>
                    {l.medicamentoNome} ({l.dosagem}) - Lote: {l.numeroLote} | Disp: {l.qtdAtual} | Val: {l.dataValidade}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Qtd Entregue *</label>
              <input 
                type="number" 
                min="1" 
                placeholder="Ex: 30" 
                value={qtdEntregue} 
                onChange={(e) => setQtdEntregue(e.target.value)} 
              />
            </div>

            <button type="button" onClick={handleAddItem} className={styles.addBtn}>
              + Adicionar Item
            </button>
          </div>
        </div>

        <div className={`${styles.fullWidth} ${styles.tableWrapper}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosagem</th>
                <th>Lote</th>
                <th>Qtd a Entregar</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {carrinhoDispensacao.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>Nenhum medicamento inserido na lista de entrega.</td>
                </tr>
              ) : (
                carrinhoDispensacao.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.medicamentoNome}</strong></td>
                    <td>{item.dosagem}</td>
                    <td>{item.numeroLote}</td>
                    <td><strong>{item.qtdEntregue}</strong></td>
                    <td>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className={styles.removeBtn}>
                        🗑 Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.fieldGroup}>
          <label>Responsável pela Entrega / Servidor *</label>
          <input 
            type="text" 
            placeholder="Ex: Farmacêutico João Pedro" 
            value={responsavelEntrega} 
            onChange={(e) => setResponsavelEntrega(e.target.value)} 
            required 
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Observação da Dispensação</label>
          <input 
            type="text" 
            placeholder="Ex: Entrega referente ao mês de Agosto" 
            value={observacao} 
            onChange={(e) => setObservacao(e.target.value)} 
          />
        </div>

        <div className={`${styles.fullWidth} ${styles.formActions}`}>
          <button type="button" onClick={handleSubmitDispensacao} className={styles.primaryBtn}>
            Confirmar e Registrar Dispensação
          </button>
        </div>
      </div>
    </div>
  );
}