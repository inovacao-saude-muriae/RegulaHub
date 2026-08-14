'use client';

import { useState } from 'react';
import styles from './TabEstoqueMedicamentos.module.css';

export default function TabEstoqueMedicamentos({
  estoqueLotes,
  catalogo,
  onCreateMedicamento,
  onCreateLote,
  loading
}) {
  const [subTab, setSubTab] = useState('ESTOQUE_LOTE'); // ESTOQUE_LOTE, NOVO_LOTE, NOVO_MEDICAMENTO

  // Form Novo Medicamento Catálogo
  const [formMed, setFormMed] = useState({
    nome: '',
    tipo: 'Comprimido',
    dosagem: ''
  });

  // Form Novo Lote
  const [formLote, setFormLote] = useState({
    medicamentoId: '',
    numeroLote: '',
    fornecedor: '',
    qtdInicial: '',
    valorUnitario: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataValidade: ''
  });

  const handleSubmitMed = async (e) => {
    e.preventDefault();
    if (!formMed.nome || !formMed.dosagem) return alert('Preencha o nome e a dosagem do medicamento.');
    
    await onCreateMedicamento(formMed);
    setFormMed({ nome: '', tipo: 'Comprimido', dosagem: '' });
  };

  const handleSubmitLote = async (e) => {
    e.preventDefault();
    if (!formLote.medicamentoId || !formLote.numeroLote || !formLote.fornecedor || !formLote.qtdInicial || !formLote.dataValidade) {
      return alert('Preencha os campos obrigatórios da entrada de lote.');
    }

    await onCreateLote(formLote);
    setFormLote({
      medicamentoId: '',
      numeroLote: '',
      fornecedor: '',
      qtdInicial: '',
      valorUnitario: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      dataValidade: ''
    });
    setSubTab('ESTOQUE_LOTE');
  };

  return (
    <div className={styles.card}>
      <div className={styles.subTabNav}>
        <button 
          type="button"
          className={`${styles.subTabBtn} ${subTab === 'ESTOQUE_LOTE' ? styles.activeSubTab : ''}`}
          onClick={() => setSubTab('ESTOQUE_LOTE')}
        >
          📦 Saldo do Estoque por Lote
        </button>

        <button 
          type="button"
          className={`${styles.subTabBtn} ${subTab === 'NOVO_LOTE' ? styles.activeSubTab : ''}`}
          onClick={() => setSubTab('NOVO_LOTE')}
        >
          📥 Dar Entrada de Lote
        </button>

        <button 
          type="button"
          className={`${styles.subTabBtn} ${subTab === 'NOVO_MEDICAMENTO' ? styles.activeSubTab : ''}`}
          onClick={() => setSubTab('NOVO_MEDICAMENTO')}
        >
          💊 Catálogo de Medicamentos ({catalogo.length})
        </button>
      </div>

      {/* SUB-ABA 1: VISUALIZAR ESTOQUE POR LOTE */}
      {subTab === 'ESTOQUE_LOTE' && (
        <div>
          <h3 className={styles.sectionTitle}>Estoque Físico e Saldos Disponíveis</h3>

          {loading ? (
            <div className={styles.loadingBox}>Carregando estoque...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Tipo / Dosagem</th>
                    <th>Nº Lote</th>
                    <th>Fornecedor</th>
                    <th>Data Validade</th>
                    <th>Qtd Inicial</th>
                    <th>Saldo Atual</th>
                    <th>Valor Unit. (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueLotes.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b' }}>
                        Nenhum lote em estoque. Dê entrada em um novo lote para iniciar.
                      </td>
                    </tr>
                  ) : (
                    estoqueLotes.map(item => (
                      <tr key={item.loteId}>
                        <td><strong>{item.medicamentoNome}</strong></td>
                        <td>{item.tipo} - {item.dosagem}</td>
                        <td>{item.numeroLote}</td>
                        <td>{item.fornecedor}</td>
                        <td>{item.dataValidade}</td>
                        <td>{item.qtdInicial}</td>
                        <td>
                          <strong className={item.qtdAtual > 0 ? styles.positiveQty : styles.zeroQty}>
                            {item.qtdAtual}
                          </strong>
                        </td>
                        <td>R$ {Number(item.valorUnitario).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: ENTRADA DE LOTE */}
      {subTab === 'NOVO_LOTE' && (
        <div>
          <h3 className={styles.sectionTitle}>Entrada de Novo Lote no Estoque</h3>

          <form onSubmit={handleSubmitLote} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Medicamento do Catálogo *</label>
              <select 
                value={formLote.medicamentoId} 
                onChange={(e) => setFormLote({ ...formLote, medicamentoId: e.target.value })}
                required
              >
                <option value="">-- Selecione do Catálogo --</option>
                {catalogo.map(med => (
                  <option key={med.id} value={med.id}>
                    {med.nome} ({med.dosagem}) - {med.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Número do Lote *</label>
              <input 
                type="text" 
                placeholder="Ex: LOTE-2026-X" 
                value={formLote.numeroLote} 
                onChange={(e) => setFormLote({ ...formLote, numeroLote: e.target.value })} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Fornecedor / Fabricante *</label>
              <input 
                type="text" 
                placeholder="Ex: Eurofarma Laboratórios" 
                value={formLote.fornecedor} 
                onChange={(e) => setFormLote({ ...formLote, fornecedor: e.target.value })} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Quantidade Inicial Adquirida *</label>
              <input 
                type="number" 
                min="1" 
                placeholder="Ex: 500" 
                value={formLote.qtdInicial} 
                onChange={(e) => setFormLote({ ...formLote, qtdInicial: e.target.value })} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Valor Unitário (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Ex: 12.50" 
                value={formLote.valorUnitario} 
                onChange={(e) => setFormLote({ ...formLote, valorUnitario: e.target.value })} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Data de Entrada *</label>
              <input 
                type="date" 
                value={formLote.dataEntrada} 
                onChange={(e) => setFormLote({ ...formLote, dataEntrada: e.target.value })} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Data de Validade *</label>
              <input 
                type="date" 
                value={formLote.dataValidade} 
                onChange={(e) => setFormLote({ ...formLote, dataValidade: e.target.value })} 
                required 
              />
            </div>

            <div className={`${styles.fullWidth} ${styles.formActions}`}>
              <button type="submit" className={styles.primaryBtn}>
                Confirmar Entrada do Lote
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-ABA 3: NOVO MEDICAMENTO CATÁLOGO */}
      {subTab === 'NOVO_MEDICAMENTO' && (
        <div>
          <h3 className={styles.sectionTitle}>Cadastrar Novo Medicamento no Catálogo</h3>

          <form onSubmit={handleSubmitMed} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Nome do Medicamento *</label>
              <input 
                type="text" 
                placeholder="Ex: Insulina Glargina" 
                value={formMed.nome} 
                onChange={(e) => setFormMed({ ...formMed, nome: e.target.value })} 
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Tipo / Forma Farmacêutica *</label>
              <select value={formMed.tipo} onChange={(e) => setFormMed({ ...formMed, tipo: e.target.value })}>
                <option value="Comprimido">Comprimido / Drágea</option>
                <option value="Injetável / Caneta">Injetável / Caneta</option>
                <option value="Xarope / Solução">Xarope / Solução Oral</option>
                <option value="Pomada / Creme">Pomada / Creme</option>
                <option value="Frasco / Gotas">Frasco / Gotas</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Dosagem / Concentração *</label>
              <input 
                type="text" 
                placeholder="Ex: 100 UI/ml ou 500mg" 
                value={formMed.dosagem} 
                onChange={(e) => setFormMed({ ...formMed, dosagem: e.target.value })} 
                required 
              />
            </div>

            <div className={`${styles.fullWidth} ${styles.formActions}`}>
              <button type="submit" className={styles.primaryBtn}>
                Salvar no Catálogo
              </button>
            </div>
          </form>

          <h4 className={styles.sectionTitle}>Catálogo Geral</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome do Medicamento</th>
                  <th>Forma</th>
                  <th>Dosagem</th>
                </tr>
              </thead>
              <tbody>
                {catalogo.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td><strong>{c.nome}</strong></td>
                    <td>{c.tipo}</td>
                    <td>{c.dosagem}</td>
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