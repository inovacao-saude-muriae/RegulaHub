'use client';

import { useState } from 'react';
import styles from './TabFinanceiro.module.css';

// Lista de meses definida no próprio componente
const DEFAULT_MONTHS_LIST = [
  { value: "01", name: "Jan" },
  { value: "02", name: "Fev" },
  { value: "03", name: "Mar" },
  { value: "04", name: "Abr" },
  { value: "05", name: "Mai" },
  { value: "06", name: "Jun" },
  { value: "07", name: "Jul" },
  { value: "08", name: "Ago" },
  { value: "09", name: "Set" },
  { value: "10", name: "Out" },
  { value: "11", name: "Nov" },
  { value: "12", name: "Dez" },
];

// Tipos de cotas oficiais atualizados do sistema
const LISTA_COTAS_OFICIAIS = ['OCI', 'SUS', 'PPI'];

export default function TabFinanceiro({
  finMonth = "08",
  setFinMonth = () => {},
  finYear = "2026",
  setFinYear = () => {},
  MONTHS_LIST = DEFAULT_MONTHS_LIST,
  calculateMonthQuotaDetails = () => ({ totalLimit: 0, totalUsed: 0, available: 0 }),
  handleOpenDefineTetoModal = () => {}
}) {
  // Estado local para gerenciar os valores editáveis da tabela (3 cotas x 12 meses)
  const [tableData, setTableData] = useState({
    OCI: Array(12).fill(0),
    SUS: Array(12).fill(0),
    PPI: Array(12).fill(0),
  });

  // Atualiza a célula correspondente
  const handleCellChange = (cota, monthIndex, value) => {
    const numericValue = parseFloat(value) || 0;
    setTableData((prev) => {
      const updatedRow = [...prev[cota]];
      updatedRow[monthIndex] = numericValue;
      return { ...prev, [cota]: updatedRow };
    });
  };

  // Calcula o total da linha de cada cota
  const calculateRowTotal = (cota) => {
    return tableData[cota].reduce((sum, val) => sum + (val || 0), 0);
  };

  return (
    <div className={styles.financeContainer}>
      {/* CARD SUPERIOR DE FILTRO DE COMPETÊNCIA */}
      <div className={`${styles.card} ${styles.financeHeaderCard}`}>
        <h2 className={styles.cardTitle}>Painel de Controle Financeiro de Cotas</h2>
        <p>Selecione a competência para visualizar limites, gastos e saldos restantes de cada cota:</p>

        <div className={styles.financeFiltersRow}>
          <div className={styles.fieldGroup}>
            <label>Mês de Competência:</label>
            <select value={finMonth} onChange={(e) => setFinMonth(e.target.value)}>
              {MONTHS_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name} ({m.value})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Ano de Competência:</label>
            <select value={finYear} onChange={(e) => setFinYear(e.target.value)}>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID DE CARDS COM AS COTAS DO SISTEMA */}
      <div className={styles.financeCardsGrid}>
        {LISTA_COTAS_OFICIAIS.map((tipoCota) => {
          const details = calculateMonthQuotaDetails(tipoCota, finYear, finMonth) || {
            totalLimit: 0,
            totalUsed: 0,
            available: 0,
          };

          return (
            <div key={tipoCota} className={`${styles.card} ${styles.financeQuotaCard}`}>
              <div className={styles.financeCardHeader}>
                <h3>Cota: {tipoCota}</h3>
                <button
                  type="button"
                  onClick={() => handleOpenDefineTetoModal(tipoCota, details.totalLimit)}
                  className={styles.iconBtn}
                  title="Editar Teto de Gastos"
                >
                  <img
                    src="/img/icon/editar.png"
                    alt="Editar"
                    width={16}
                    height={16}
                    style={{ objectFit: "contain" }}
                  />
                </button>
              </div>

              <div className={styles.financeCardBody}>
                <div>
                  <small className={styles.mutedText}>
                    Teto Disponível para {finMonth}/{finYear}:
                  </small>
                  <div className={styles.amountTotal}>
                    R$ {(details.totalLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <small className={styles.mutedText}>Total Debitado (Liberados no Mês):</small>
                  <div className={styles.amountSpent}>
                    R$ {(details.totalUsed || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className={styles.balanceDivider}>
                  <small className={styles.mutedText}>Saldo Restante:</small>
                  <div className={(details.available || 0) >= 0 ? styles.positiveText : styles.negativeText}>
                    R$ {(details.available || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABELA DE ACOMPANHAMENTO MENSAL DAS COTAS */}
      <div className={`${styles.card} ${styles.tableCard}`}>
        <h3 className={styles.tableTitle}>Planejamento Mensal de Cotas ({finYear})</h3>
        <p className={styles.tableSubtitle}>Preencha os valores de cada mês para acompanhar o total anual das cotas:</p>

        <div className={styles.tableResponsive}>
          <table className={styles.cotasTable}>
            <thead>
              <tr>
                <th>Cota</th>
                {DEFAULT_MONTHS_LIST.map((m) => (
                  <th key={m.value}>{m.name}</th>
                ))}
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {LISTA_COTAS_OFICIAIS.map((cota) => {
                const totalRow = calculateRowTotal(cota);

                return (
                  <tr key={cota}>
                    <td className={styles.cotaNameCell}>
                      <strong>{cota}</strong>
                    </td>
                    {tableData[cota].map((val, idx) => (
                      <td key={idx}>
                        <input
                          type="number"
                          step="0.01"
                          className={styles.cellInput}
                          value={val === 0 ? '' : val}
                          placeholder="0,00"
                          onChange={(e) => handleCellChange(cota, idx, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className={styles.totalCell}>
                      <strong>
                        R$ {totalRow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}