"use client";

import { useState } from "react";
import styles from "./Liberados.module.css";

export default function Liberados({
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

  // 1. Localiza o objeto exato do exame selecionado nas auxiliares
  const selectedTypeObj = auxData?.tiposExame?.find(
    (t) =>
      t.nome?.toLowerCase().trim() === selectedReleasedExam?.toLowerCase().trim() ||
      String(t.id) === String(selectedReleasedExam)
  );

  // 2. Filtra estritamente por Status "Liberado" E pelo Tipo de Exame ativo (sem vazamento por substring)
  const baseReleased = requests.filter((item) => {
    if (item.status !== "Liberado") return false;
    if (!selectedReleasedExam) return true;

    // A) Validação por ID do tipo de exame (Relacionamento Direto)
    if (selectedTypeObj && item.examTypeId) {
      return String(item.examTypeId) === String(selectedTypeObj.id);
    }

    // B) Validação por Nome do tipo de exame (Fallback)
    if (item.examType && selectedTypeObj) {
      return item.examType.toLowerCase().trim() === selectedTypeObj.nome.toLowerCase().trim();
    }

    return true;
  });

  // 3. Aplica os filtros avançados garantindo a trava do exame ativo
  const releasedList =
    typeof applyFilters === "function"
      ? applyFilters(baseReleased).filter((item) => {
          if (!selectedTypeObj) return true;
          if (item.examTypeId) {
            return String(item.examTypeId) === String(selectedTypeObj.id);
          }
          return (
            String(item.examType || "").toLowerCase().trim() ===
            selectedTypeObj.nome.toLowerCase().trim()
          );
        })
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
        {auxData?.tiposExame?.map((tipo) => {
          const isActive =
            selectedReleasedExam?.toLowerCase().trim() === tipo.nome?.toLowerCase().trim() ||
            String(selectedReleasedExam) === String(tipo.id);

          return (
            <button
              key={tipo.id}
              type="button"
              className={`${styles.examTabBtn} ${
                isActive ? styles.activeExamTab : ""
              }`}
              onClick={() => {
                setSelectedReleasedExam(tipo.nome);
                setSelectedIds([]);
              }}
            >
              {tipo.nome}
            </button>
          );
        })}
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
          Nenhum paciente liberado encontrado para <strong>{selectedReleasedExam}</strong>.
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
                      <strong>{item.id}</strong>
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
                      
                      {/* EXIBIÇÃO DA OBSERVAÇÃO GERAL DA REGULAÇÃO */}
                      {(item.generalObservation || item.justification) && (
                        <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#475569" }}>
                          <strong>Obs. Geral:</strong> {item.generalObservation || item.justification}
                        </div>
                      )}
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