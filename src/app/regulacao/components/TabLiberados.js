"use client";

import { useState } from "react";
import styles from "./TabLiberados.module.css";

export default function TabLiberados({
  auxData,
  requests,
  selectedReleasedExam,
  setSelectedReleasedExam,
  applyFilters,
  handleUpdateBillingDate,
  handleEditOrder,
  handleExportToExcelReleased,
  loading,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  // 1. Filtra primeiro por Status "Liberado" e pelo Tipo de Exame selecionado
  const baseReleased = requests.filter((item) => {
    if (item.status !== "Liberado") return false;
    if (selectedReleasedExam && item.examType !== selectedReleasedExam) {
      return false;
    }
    return true;
  });

  // 2. Aplica os filtros avançados passando o Array completo
  const releasedList =
    typeof applyFilters === "function"
      ? applyFilters(baseReleased)
      : baseReleased;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(releasedList.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getRiskClass = (classification) => {
    switch (classification) {
      case "Vermelho":
        return styles.riskRed;
      case "Amarelo":
        return styles.riskYellow;
      default:
        return styles.riskGreen;
    }
  };

  return (
    <div className={styles.container}>
      {/* ABAS SELETORAS DE TIPO DE EXAME */}
      <div className={styles.examTabs}>
        {auxData?.tiposExame?.map((tipo) => (
          <button
            key={tipo.id}
            type="button"
            className={`${styles.examTabBtn} ${
              selectedReleasedExam === tipo.nome ? styles.activeExamTab : ""
            }`}
            onClick={() => {
              setSelectedReleasedExam(tipo.nome);
              setSelectedIds([]);
            }}
          >
            {tipo.nome}
          </button>
        ))}
      </div>

      {/* CABEÇALHO E AÇÃO DE EXPORTAR */}
      <div className={styles.tableHeaderBar}>
        <div className={styles.infoGroup}>
          <h3>
            Pacientes Liberados: <span>{selectedReleasedExam || "Todos"}</span>
          </h3>
          <p>
            Total de registros: <strong>{releasedList.length}</strong>
          </p>
        </div>

        <button
          type="button"
          className={styles.exportBtn}
          onClick={() => handleExportToExcelReleased(selectedIds)}
          disabled={selectedIds.length === 0}
        >
          📊 Exportar Selecionados ({selectedIds.length}) para Excel
        </button>
      </div>

      {/* TABELA DE DADOS */}
      {loading ? (
        <div className={styles.loadingState}>Carregando pacientes liberados...</div>
      ) : releasedList.length === 0 ? (
        <div className={styles.emptyState}>
          Nenhum paciente liberado encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      releasedList.length > 0 &&
                      selectedIds.length === releasedList.length
                    }
                  />
                </th>
                <th>Cód. Reg.</th>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Procedimento</th>
                <th>Data Liberação</th>
                <th>Cota</th>
                <th>Competência</th>
                <th>Data Faturado</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {releasedList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const competence =
                  item.quotaCompetenceMonth && item.quotaCompetenceYear
                    ? `${item.quotaCompetenceMonth}/${item.quotaCompetenceYear}`
                    : "—";

                return (
                  <tr
                    key={item.id}
                    className={isSelected ? styles.selectedRow : ""}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(item.id)}
                      />
                    </td>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <div className={styles.patientHeader}>
                        <span className={styles.patientName}>{item.patientName}</span>
                        <span
                          className={`${styles.riskTag} ${getRiskClass(
                            item.classification
                          )}`}
                        >
                          {item.classification || "Verde"}
                        </span>
                      </div>
                      <small className={styles.subText}>
                        Mãe: {item.motherName || "Não informada"}
                      </small>
                    </td>
                    <td>{item.cpf || "—"}</td>
                    <td>{item.procedure}</td>
                    <td>{item.releaseDate || "—"}</td>
                    <td>
                      <span className={styles.quotaBadge}>
                        {item.quota || "N/A"}
                      </span>
                    </td>
                    <td>{competence}</td>
                    <td>
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={item.billingDate || ""}
                        onChange={(e) =>
                          handleUpdateBillingDate(item.id, e.target.value)
                        }
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleEditOrder(item)}
                        title="Editar Pedido"
                      >
                        <img
                          src="/img/icon/editar.png"
                          alt="Editar"
                          width={16}
                          height={16}
                          style={{ objectFit: "contain" }}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}