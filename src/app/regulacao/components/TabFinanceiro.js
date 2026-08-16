'use client';

import { useState } from 'react';
import styles from './TabFinanceiro.module.css';

// Lista de meses
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

// Tipos de cotas oficiais para os cards
const LISTA_COTAS_OFICIAIS = ['SUS', 'Credenciamento', 'OCI'];

// Cidades para a tabela de Planejamento Mensal
const LISTA_CIDADES = [
  'ALÉM PARAÍBA',
  'LEOPOLDINA-CATAGUASES',
  'MANHUAÇU',
];

export default function TabFinanceiro({
  finMonth,
  setFinMonth = () => {},
  finYear,
  setFinYear = () => {},
  MONTHS_LIST = DEFAULT_MONTHS_LIST,
  calculateMonthQuotaDetails = () => ({ totalLimit: 0, totalUsed: 0, available: 0 }),
  handleOpenDefineTetoModal = () => {}
}) {
  // Inicialização dinâmica baseada na data atual do sistema
  const currentDate = new Date();
  const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(currentDate.getFullYear());

  const activeMonth = finMonth || currentMonthStr;
  const activeYear = finYear || currentYearStr;

  // Estado local com as cidades para a tabela de planejamento
  const [tableData, setTableData] = useState({
    'ALÉM PARAÍBA': Array(12).fill(0),
    'LEOPOLDINA-CATAGUASES': Array(12).fill(0),
    'MANHUAÇU': Array(12).fill(0),
  });

  // Atualiza a célula da cidade
  const handleCellChange = (cidade, monthIndex, value) => {
    const numericValue = parseFloat(value) || 0;
    setTableData((prev) => {
      const updatedRow = [...(prev[cidade] || Array(12).fill(0))];
      updatedRow[monthIndex] = numericValue;
      return { ...prev, [cidade]: updatedRow };
    });
  };

  // Calcula o total da linha de cada cidade
  const calculateRowTotal = (cidade) => {
    return (tableData[cidade] || []).reduce((sum, val) => sum + (val || 0), 0);
  };

  // Anos para o select (ano atual + 2 próximos)
  const currentYearNum = currentDate.getFullYear();
  const availableYears = [
    String(currentYearNum),
    String(currentYearNum + 1),
    String(currentYearNum + 2),
  ];

  return (
    <div className={styles.financeContainer}>
      {/* CARD SUPERIOR DE FILTRO DE COMPETÊNCIA */}
      <div className={`${styles.card} ${styles.financeHeaderCard}`}>
        <h2 className={styles.cardTitle}>Painel de Controle Financeiro de Cotas</h2>
        <p>Selecione a competência para visualizar limites, gastos e saldos restantes de cada cota:</p>

        <div className={styles.financeFiltersRow}>
          <div className={styles.fieldGroup}>
            <label>Mês de Competência:</label>
            <select value={activeMonth} onChange={(e) => setFinMonth(e.target.value)}>
              {MONTHS_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name} ({m.value})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Ano de Competência:</label>
            <select value={activeYear} onChange={(e) => setFinYear(e.target.value)}>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GRID DE CARDS COM AS COTAS DO SISTEMA */}
      <div className={styles.financeCardsGrid}>
        {LISTA_COTAS_OFICIAIS.map((tipoCota) => {
          const details = calculateMonthQuotaDetails(tipoCota, activeYear, activeMonth) || {
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
                    Teto Disponível para {activeMonth}/{activeYear}:
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

      {/* TABELA DE ACOMPANHAMENTO MENSAL POR CIDADE */}
      <div className={`${styles.card} ${styles.tableCard}`}>
        <h3 className={styles.tableTitle}>Planejamento Mensal por Cidade ({activeYear})</h3>
        <p className={styles.tableSubtitle}>Preencha os valores de cada mês para acompanhar o total anual das cidades:</p>

        <div className={styles.tableResponsive}>
          <table className={styles.cotasTable}>
            <thead>
              <tr>
                <th>Cidade</th>
                {DEFAULT_MONTHS_LIST.map((m) => (
                  <th key={m.value}>{m.name}</th>
                ))}
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {LISTA_CIDADES.map((cidade) => {
                const totalRow = calculateRowTotal(cidade);

                return (
                  <tr key={cidade}>
                    <td className={styles.cotaNameCell}>
                      <strong>{cidade}</strong>
                    </td>
                    {(tableData[cidade] || Array(12).fill(0)).map((val, idx) => (
                      <td key={idx}>
                        <input
                          type="number"
                          step="0.01"
                          className={styles.cellInput}
                          value={val === 0 ? '' : val}
                          placeholder="0,00"
                          onChange={(e) => handleCellChange(cidade, idx, e.target.value)}
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