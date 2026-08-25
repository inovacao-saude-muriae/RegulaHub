"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getCCZDashboardData } from "./actions";

// Views de 1º Nível
import Dashboard from "./views/Dashboard";
import Cadastros from "./views/Cadastros";
import Usuarios from "./views/Usuarios";
import AnimaisCards from "./views/AnimaisCards";
import Procedimentos from "./views/Procedimentos";
import Denuncias from "./views/Denuncias";
import Zoonoses from "./views/Zoonoses";
import Esporotricose from "./views/Esporotricose";

import styles from "./page.module.css";

function CCZPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get("tab") || "DASHBOARD";
  const activeSubTab = searchParams.get("subTab") || "CADASTRO";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tutores: [],
    animais: [],
    denuncias: [],
    zoonoses: [],
    esporotricoses: [],
  });

  const reloadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCCZDashboardData();
      setData(result);
    } catch (err) {
      console.error("Erro ao carregar dados CCZ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const setActiveTab = (tab) => router.push(`/ccz?tab=${tab}`);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Centro de Controle de Zoonoses — CCZ</h1>
          <p>Controle de tutores, animais, procedimentos e denúncias</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Carregando dados...
        </div>
      ) : (
        <>
          {activeTab === "DASHBOARD" && (
            <Dashboard
              tutores={data.tutores}
              animais={data.animais}
              denuncias={data.denuncias}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "CADASTROS" && (
            <Cadastros
              tutores={data.tutores}
              animais={data.animais}
              reloadData={reloadData}
            />
          )}

          {activeTab === "ZOONOSES" && (
            <Zoonoses
              subTab={activeSubTab}
              data={data}
              reloadData={reloadData}
            />
          )}

          {activeTab === "ESPOROTRICOSE" && (
            <Esporotricose
              subTab={activeSubTab}
              data={data}
              reloadData={reloadData}
            />
          )}

          {activeTab === "USUARIOS" && (
            <Usuarios
              tutores={data.tutores}
              animais={data.animais}
              reloadData={reloadData}
            />
          )}

          {activeTab === "ANIMAIS" && (
            <AnimaisCards
              animais={data.animais}
              tutores={data.tutores}
              reloadData={reloadData}
            />
          )}

          {activeTab === "PROCEDIMENTOS" && (
            <Procedimentos tutores={data.tutores} animais={data.animais} />
          )}

          {activeTab === "DENUNCIAS" && (
            <Denuncias
              denuncias={data.denuncias}
              animais={data.animais}
              reloadData={reloadData}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function CCZPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "3rem" }}>
          Carregando...
        </div>
      }
    >
      <CCZPageContent />
    </Suspense>
  );
}
