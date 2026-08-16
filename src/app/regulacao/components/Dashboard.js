"use client";

import styles from "./Dashboard.module.css";

export default function TabDashboard({ requests = [], auxData = {}, setActiveTab }) {
  // Métricas Principais
  const totalAguardando = requests.filter((r) => r.status === "Aguardando").length;
  const totalLiberados = requests.filter((r) => r.status === "Liberado").length;
  const totalGeral = requests.length;

  // Riscos (Aguardando - Fila)
  const urgentes = requests.filter(
    (r) => r.status === "Aguardando" && r.classification === "Vermelho"
  ).length;
  const prioritarios = requests.filter(
    (r) => r.status === "Aguardando" && r.classification === "Amarelo"
  ).length;
  const eletivos = requests.filter(
    (r) => r.status === "Aguardando" && r.classification === "Verde"
  ).length;

  // Riscos (Liberados)
  const liberadosUrgentes = requests.filter(
    (r) => r.status === "Liberado" && r.classification === "Vermelho"
  ).length;
  const liberadosPrioritarios = requests.filter(
    (r) => r.status === "Liberado" && r.classification === "Amarelo"
  ).length;
  const liberadosEletivos = requests.filter(
    (r) => r.status === "Liberado" && r.classification === "Verde"
  ).length;

  // Agrupamento por Tipo de Exame (Aguardando - Fila)
  const examTypeCountsFila = (auxData.tiposExame || []).map((tipo) => {
    const count = requests.filter(
      (r) =>
        r.status === "Aguardando" &&
        (r.examType?.toLowerCase().trim() === tipo.nome?.toLowerCase().trim() ||
          String(r.examTypeId) === String(tipo.id))
    ).length;
    return { nome: tipo.nome, count };
  });

  // Agrupamento por Tipo de Exame (Liberados)
  const examTypeCountsLiberados = (auxData.tiposExame || []).map((tipo) => {
    const count = requests.filter(
      (r) =>
        r.status === "Liberado" &&
        (r.examType?.toLowerCase().trim() === tipo.nome?.toLowerCase().trim() ||
          String(r.examTypeId) === String(tipo.id))
    ).length;
    return { nome: tipo.nome, count };
  });

  return (
    <div className={styles.dashboardContainer}>
      {/* BANNER DE BOAS-VINDAS E ATALHO */}
      <div className={styles.welcomeBanner}>
        <div>
          <h2>Visão Geral da Regulação</h2>
          <p>Acompanhe o fluxo de solicitações, riscos e exames liberados em tempo real.</p>
        </div>
        <button
          type="button"
          className={styles.newRequestBtn}
          onClick={() => setActiveTab("NOVO_PEDIDO")}
        >
          Novo Pedido
        </button>
      </div>

      {/* MÉTROCAS PRINCIPAIS */}
      <div className={styles.metricsGrid}>
        <div
          className={`${styles.metricCard} ${styles.clickable}`}
          onClick={() => setActiveTab("LISTA_ESPERA")}
        >
          <div className={styles.metricIconBox} style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            ⏳
          </div>
          <div>
            <span className={styles.metricLabel}>Fila de Espera</span>
            <div className={styles.metricValue}>{totalAguardando}</div>
            <small className={styles.metricSubText}>Pacientes aguardando</small>
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${styles.clickable}`}
          onClick={() => setActiveTab("LIBERADOS")}
        >
          <div className={styles.metricIconBox} style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
            ✅
          </div>
          <div>
            <span className={styles.metricLabel}>Exames Liberados</span>
            <div className={styles.metricValue}>{totalLiberados}</div>
            <small className={styles.metricSubText}>Procedimentos concluídos</small>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            🚨
          </div>
          <div>
            <span className={styles.metricLabel}>Urgências na Fila</span>
            <div className={styles.metricValue}>{urgentes}</div>
            <small className={styles.metricSubText}>Classificação Vermelha</small>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
            📋
          </div>
          <div>
            <span className={styles.metricLabel}>Total Registrado</span>
            <div className={styles.metricValue}>{totalGeral}</div>
            <small className={styles.metricSubText}>Solicitações no sistema</small>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: PAINEL DA FILA DE ESPERA */}
      <h3 style={{ marginTop: "24px", marginBottom: "12px", color: "#1e293b", fontSize: "1.1rem" }}>
        📊 Fila de Espera
      </h3>
      <div className={styles.dashboardGrid}>
        {/* CARD: FILA POR CLASSIFICAÇÃO DE RISCO */}
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Fila por Classificação de Risco</h3>
          <div className={styles.riskProgressList}>
            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.redBadge}`}>Vermelho (Urgente)</span>
                <strong>{urgentes} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalAguardando ? (urgentes / totalAguardando) * 100 : 0}%`,
                    backgroundColor: "#dc2626",
                  }}
                />
              </div>
            </div>

            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.yellowBadge}`}>Amarelo (Prioritário)</span>
                <strong>{prioritarios} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalAguardando ? (prioritarios / totalAguardando) * 100 : 0}%`,
                    backgroundColor: "#d97706",
                  }}
                />
              </div>
            </div>

            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.greenBadge}`}>Verde (Eletivo)</span>
                <strong>{eletivos} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalAguardando ? (eletivos / totalAguardando) * 100 : 0}%`,
                    backgroundColor: "#16a34a",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD: FILA POR TIPO DE EXAME */}
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Fila por Tipo de Exame</h3>
          <div className={styles.examTypeList}>
            {examTypeCountsFila.map((item) => (
              <div key={item.nome} className={styles.examTypeRow}>
                <span>{item.nome}</span>
                <span className={styles.examCountBadge}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: PAINEL DE PACIENTES LIBERADOS */}
      <h3 style={{ marginTop: "32px", marginBottom: "12px", color: "#1e293b", fontSize: "1.1rem" }}>
        ✅ Pacientes Liberados
      </h3>
      <div className={styles.dashboardGrid}>
        {/* CARD: LIBERADOS POR CLASSIFICAÇÃO DE RISCO */}
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Liberados por Classificação de Risco</h3>
          <div className={styles.riskProgressList}>
            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.redBadge}`}>Vermelho (Urgente)</span>
                <strong>{liberadosUrgentes} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalLiberados ? (liberadosUrgentes / totalLiberados) * 100 : 0}%`,
                    backgroundColor: "#dc2626",
                  }}
                />
              </div>
            </div>

            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.yellowBadge}`}>Amarelo (Prioritário)</span>
                <strong>{liberadosPrioritarios} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalLiberados ? (liberadosPrioritarios / totalLiberados) * 100 : 0}%`,
                    backgroundColor: "#d97706",
                  }}
                />
              </div>
            </div>

            <div className={styles.riskItem}>
              <div className={styles.riskHeader}>
                <span className={`${styles.riskBadge} ${styles.greenBadge}`}>Verde (Eletivo)</span>
                <strong>{liberadosEletivos} pacientes</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${totalLiberados ? (liberadosEletivos / totalLiberados) * 100 : 0}%`,
                    backgroundColor: "#16a34a",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD: LIBERADOS POR TIPO DE EXAME */}
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Liberados por Tipo de Exame</h3>
          <div className={styles.examTypeList}>
            {examTypeCountsLiberados.map((item) => (
              <div key={item.nome} className={styles.examTypeRow}>
                <span>{item.nome}</span>
                <span className={styles.examCountBadge} style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}