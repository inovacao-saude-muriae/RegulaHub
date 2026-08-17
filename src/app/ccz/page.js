"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getCCZDashboardData } from "./actions";

import TabDashboardCCZ  from "./components/Dashboard";
import TabUsuarios      from "./components/TabUsuarios";
import TabCadastros     from "./components/TabCadastros";
import TabAnimaisCards  from "./components/TabAnimaisCards";
import TabProcedimentos from "./components/TabProcedimentos";
import TabDenuncias     from "./components/TabDenuncias";

import styles from "./page.module.css";

export default function CCZPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const activeTab = searchParams.get("tab") || "DASHBOARD";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tutores: [],
    animais: [],
    denuncias: [],
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

  useEffect(() => { reloadData(); }, [reloadData]);

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
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontWeight: 500 }}>
          Carregando dados...
        </div>
      ) : (
        <>
          {activeTab === "DASHBOARD" && (
            <TabDashboardCCZ
              tutores={data.tutores}
              animais={data.animais}
              denuncias={data.denuncias}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "USUARIOS" && (
            <TabUsuarios
              tutores={data.tutores}
              animais={data.animais}
              reloadData={reloadData}
            />
          )}

          {activeTab === "CADASTROS" && (
            <TabCadastros
              tutores={data.tutores}
              animais={data.animais}
              reloadData={reloadData}
            />
          )}

          {activeTab === "ANIMAIS" && (
            <TabAnimaisCards
              animais={data.animais}
              tutores={data.tutores}
            />
          )}

          {activeTab === "PROCEDIMENTOS" && (
            <TabProcedimentos
              tutores={data.tutores}
              animais={data.animais}
            />
          )}

          {activeTab === "DENUNCIAS" && (
            <TabDenuncias
              denuncias={data.denuncias}
              reloadData={reloadData}
            />
          )}
        </>
      )}
    </div>
  );
}
