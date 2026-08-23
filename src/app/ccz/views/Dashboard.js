"use client";

import styles from "./Dashboard.module.css";

function formatDate(d) {
  if (!d) return "-";
  const s = d instanceof Date ? d.toISOString() : String(d);
  const parts = s.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : s;
}

export default function TabDashboardCCZ({
  tutores = [],
  animais = [],
  denuncias = [],
  setActiveTab,
}) {
  const totalTutores = tutores.length;
  const totalAnimais = animais.length;
  const totalDenuncias = denuncias.length;
  const denunciasComRisco = denuncias.filter(
    (d) => d.causou_risco === "Sim",
  ).length;

  // Animais por espécie
  const especies = ["Cão", "Gato", "Bovino", "Equino", "Suíno", "Outro"];
  const animaisPorEspecie = especies
    .map((e) => ({
      nome: e,
      count: animais.filter((a) => a.especie === e).length,
    }))
    .filter((e) => e.count > 0);

  // Denúncias por risco à vida
  const denunciasPorRisco = [
    {
      label: "Com risco à vida",
      color: "#dc2626",
      badgeClass: styles.redBadge,
      count: denunciasComRisco,
    },
    {
      label: "Sem risco à vida",
      color: "#16a34a",
      badgeClass: styles.greenBadge,
      count: totalDenuncias - denunciasComRisco,
    },
  ];
  const totalDenunciasBase = totalDenuncias || 1;

  const denunciasRecentes = [...denuncias].slice(0, 6);

  return (
    <div className={styles.dashboardContainer}>
      {/* BANNER */}
      <div className={styles.welcomeBanner}>
        <div>
          <h2>Centro de Controle de Zoonoses — CCZ</h2>
          <p>
            Acompanhe tutores, animais, procedimentos e denúncias em tempo real.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.newBtn}
            onClick={() => setActiveTab("CADASTROS")}
          >
            + Cadastrar Tutor / Animal
          </button>
          <button
            type="button"
            className={styles.newBtn}
            style={{ backgroundColor: "#475569" }}
            onClick={() => setActiveTab("DENUNCIAS")}
          >
            + Nova Denúncia
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.metricsGrid}>
        <div
          className={`${styles.kpiCard} ${styles.clickable}`}
          onClick={() => setActiveTab("USUARIOS")}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Tutores Cadastrados</span>
            <div className={`${styles.iconBox} ${styles.blueIcon}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>
            {totalTutores}
            <span className={styles.kpiUnit}>tutores</span>
          </div>
          <div className={styles.kpiFooter}>Responsáveis por animais</div>
        </div>

        <div
          className={`${styles.kpiCard} ${styles.clickable}`}
          onClick={() => setActiveTab("ANIMAIS")}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Animais Cadastrados</span>
            <div className={`${styles.iconBox} ${styles.greenIcon}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>
            {totalAnimais}
            <span className={styles.kpiUnit}>animais</span>
          </div>
          <div className={styles.kpiFooter}>No sistema CCZ</div>
        </div>

        <div
          className={`${styles.kpiCard} ${styles.clickable}`}
          onClick={() => setActiveTab("DENUNCIAS")}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Denúncias com Risco</span>
            <div className={`${styles.iconBox} ${styles.orangeIcon}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>
            {denunciasComRisco}
            <span className={styles.kpiUnit}>registros</span>
          </div>
          <div className={styles.kpiFooter}>Risco à vida informado</div>
        </div>

        <div
          className={`${styles.kpiCard} ${styles.clickable}`}
          onClick={() => setActiveTab("DENUNCIAS")}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total de Denúncias</span>
            <div className={`${styles.iconBox} ${styles.blueIcon}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>
            {totalDenuncias}
            <span className={styles.kpiUnit}>registros</span>
          </div>
          <div className={styles.kpiFooter}>Histórico geral</div>
        </div>
      </div>

      {/* Distribuição */}
      <h3 className={styles.sectionHeaderTitle}>Distribuição de Cadastros</h3>
      <div className={styles.dashboardGrid}>
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Animais por Espécie</h3>
          {animaisPorEspecie.length === 0 ? (
            <p className={styles.emptyState}>Nenhum animal cadastrado.</p>
          ) : (
            <div className={styles.listRows}>
              {animaisPorEspecie.map((e) => (
                <div key={e.nome} className={styles.listRow}>
                  <span>{e.nome}</span>
                  <span className={styles.listBadgeBlue}>{e.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle}>Denúncias por Risco</h3>
          <div className={styles.riskProgressList}>
            {denunciasPorRisco.map((d) => (
              <div key={d.label} className={styles.riskItem}>
                <div className={styles.riskHeader}>
                  <span className={`${styles.riskBadge} ${d.badgeClass}`}>
                    {d.label}
                  </span>
                  <strong>{d.count}</strong>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${(d.count / totalDenunciasBase) * 100}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Denúncias recentes */}
      <h3 className={styles.sectionHeaderTitle}>Denúncias Recentes</h3>
      <div className={styles.dashboardGrid}>
        <div className={styles.dashCard} style={{ gridColumn: "1 / -1" }}>
          {denunciasRecentes.length === 0 ? (
            <p className={styles.emptyState}>Nenhuma denúncia registrada.</p>
          ) : (
            <div className={styles.recentList}>
              {denunciasRecentes.map((d) => {
                const dot = d.causou_risco === "Sim" ? "#dc2626" : "#16a34a";
                return (
                  <div key={d.id} className={styles.recentItem}>
                    <div
                      className={styles.recentDot}
                      style={{ backgroundColor: dot }}
                    />
                    <div className={styles.recentContent}>
                      <p className={styles.recentTitle}>{d.localizacao}</p>
                      <p className={styles.recentMeta}>
                        {formatDate(d.data_denuncia)} • Risco:{" "}
                        {d.causou_risco || "Não"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
