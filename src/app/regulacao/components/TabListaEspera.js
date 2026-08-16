"use client";

import { useState } from "react";
import styles from "./TabListaEspera.module.css";

export default function TabListaEspera({
  auxData,
  requests,
  selectedQueueExam,
  setSelectedQueueExam,
  applyFilters,
  handleUpdateCommunicationDate,
  handleOpenReleaseModal,
  handleEditOrder,
  loading,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  // 1. Filtra primeiro por Status "Aguardando" e pelo Tipo de Exame selecionado
  const baseWaiting = requests.filter((item) => {
    if (item.status !== "Aguardando") return false;
    if (selectedQueueExam && item.examType !== selectedQueueExam) {
      return false;
    }
    return true;
  });

  // 2. Aplica os filtros avançados passando o Array completo
  const waitingList =
    typeof applyFilters === "function"
      ? applyFilters(baseWaiting)
      : baseWaiting;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(waitingList.map((item) => item.id));
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
              selectedQueueExam === tipo.nome ? styles.activeExamTab : ""
            }`}
            onClick={() => {
              setSelectedQueueExam(tipo.nome);
              setSelectedIds([]);
            }}
          >
            {tipo.nome}
          </button>
        ))}
      </div>

      {/* CABEÇALHO E RESUMO DA FILA */}
      <div className={styles.tableHeaderBar}>
        <div className={styles.infoGroup}>
          <h3>
            Fila de Espera: <span>{selectedQueueExam || "Todos"}</span>
          </h3>
          <p>
            Total aguardando: <strong>{waitingList.length}</strong> paciente(s)
          </p>
        </div>
      </div>

      {/* TABELA DE DADOS */}
      {loading ? (
        <div className={styles.loadingState}>Carregando fila de espera...</div>
      ) : waitingList.length === 0 ? (
        <div className={styles.emptyState}>
          Nenhum paciente aguardando na fila para os filtros selecionados.
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
                      waitingList.length > 0 &&
                      selectedIds.length === waitingList.length
                    }
                  />
                </th>
                <th>Cód. Reg.</th>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Procedimento</th>
                <th>Data Pedido</th>
                <th>Avisado Em</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.map((item) => {
                const isSelected = selectedIds.includes(item.id);

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
                        <span className={styles.patientName}>
                          {item.patientName}
                        </span>
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
                    <td>{item.requestDate || "—"}</td>
                    <td>
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={item.communicationDate || ""}
                        onChange={(e) =>
                          handleUpdateCommunicationDate(item.id, e.target.value)
                        }
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.releaseBtn}
                        onClick={() => handleOpenReleaseModal(item)}
                      >
                        Liberar
                      </button>
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