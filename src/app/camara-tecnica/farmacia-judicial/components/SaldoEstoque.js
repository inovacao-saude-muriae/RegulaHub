'use client';

import styles from './SaldoEstoque.module.css';

export default function TabSaldoEstoque({ estoqueLotes = [], loading = false }) {
  return (
    <div className={styles.card}>
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
                estoqueLotes.map((item) => (
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
                    <td>R$ {Number(item.valorUnitario || 0).toFixed(2)}</td>
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