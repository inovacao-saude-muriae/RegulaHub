"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGlobalDashboardData } from "@/app/actions/dashboard";
import styles from "./page.module.css";

const modules = [
  {
    title: "Regulação de Exames",
    path: "/regulacao?tab=DASHBOARD",
    tag: "Exames",
  },
  {
    title: "Farmácia Judicial",
    path: "/camara-tecnica/farmacia-judicial?tab=DASHBOARD",
    tag: "Câmara Técnica",
  },
  {
    title: "Junta Reguladora",
    path: "/junta-reguladora?tab=CADASTRO",
    tag: "Junta",
  },
  {
    title: "CCZ - Zoonoses",
    path: "/ccz?tab=DASHBOARD",
    tag: "Vigilância",
  },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({
    examesPendentes: 0,
    examesLiberados: 0,
    dispensacoesFarmacia: 0,
    animaisCCZ: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1. Verifica autenticação e permissão
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const userData = data.user;
          setUser(userData);

          // Se NÃO for ADMIN, redireciona diretamente para o módulo do usuário
          if (userData?.role !== "ADMIN") {
            switch (userData?.role) {
              case "OPERADOR_REGULA":
              case "ADMIN_REGULA":
                router.replace("/regulacao?tab=DASHBOARD");
                break;
              case "ADMIN_FARMACIA":
                router.replace("/camara-tecnica/farmacia-judicial?tab=DASHBOARD");
                break;
              case "OPERADOR_JUNTA":
              case "ADMIN_JUNTA":
                router.replace("/junta-reguladora?tab=CADASTRO");
                break;
              case "VETERINARIO":
                router.replace("/ccz?tab=DASHBOARD");
                break;
              default:
                router.replace("/regulacao");
                break;
            }
            return;
          }
        }

        // 2. Busca dados globais para o Gestor
        const dashRes = await getGlobalDashboardData();
        if (dashRes.success) {
          setMetrics(dashRes.data.kpis);
        }
      } catch (error) {
        console.error("Erro ao carregar Dashboard Geral:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando Dashboard Geral...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER GERAL */}
      <header className={styles.welcomeHeader}>
        <span className={styles.systemBadge}>Painel de Controle • Visão Geral</span>
        <h1 style={{ marginTop: "0.5rem", color: "#0f172a" }}>
          Visão Geral do Sistema 👋
        </h1>
        <p style={{ color: "#64748b" }}>
          Acompanhamento em tempo real de todos os módulos da saúde municipal.
        </p>
      </header>

      {/* CARDS DE INDICADORES GLOBAIS (KPIs) */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Exames Pendentes</div>
          <div className={styles.kpiValue} style={{ color: "#d97706" }}>
            {metrics.examesPendentes}
          </div>
          <Link href="/regulacao?tab=LISTA_ESPERA" className={styles.kpiFooter}>
            Ver Fila de Espera →
          </Link>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Exames Liberados</div>
          <div className={styles.kpiValue} style={{ color: "#16a34a" }}>
            {metrics.examesLiberados}
          </div>
          <Link href="/regulacao?tab=LIBERADOS" className={styles.kpiFooter}>
            Ver Autorizados →
          </Link>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Atendimentos Farmácia</div>
          <div className={styles.kpiValue} style={{ color: "#2563eb" }}>
            {metrics.dispensacoesFarmacia}
          </div>
          <Link href="/camara-tecnica/farmacia-judicial?tab=DISPENSACAO" className={styles.kpiFooter}>
            Ver Dispensações →
          </Link>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Animais em Acompanhamento</div>
          <div className={styles.kpiValue} style={{ color: "#9333ea" }}>
            {metrics.animaisCCZ}
          </div>
          <Link href="/ccz?tab=ANIMAIS" className={styles.kpiFooter}>
            Ver Registros CCZ →
          </Link>
        </div>
      </section>

      {/* PAINEL INFERIOR: NAVEGAÇÃO RÁPIDA E ATALHOS */}
      <section className={styles.dashboardGrid}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Módulos e Acessos Rápidos</h2>
          <div className={styles.moduleList}>
            {modules.map((mod, idx) => (
              <Link key={idx} href={mod.path} className={styles.moduleItem}>
                <div>
                  <strong>{mod.title}</strong>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "0.5rem" }}>
                    • {mod.tag}
                  </span>
                </div>
                <span style={{ color: "#2563eb", fontSize: "0.875rem", fontWeight: "600" }}>
                  Acessar Painel
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Ações Administrativas</h2>
          <div className={styles.moduleList}>
            <Link href="/admin/usuarios" className={styles.moduleItem}>
              <div>
                <strong>Gerenciar Usuários</strong>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                  Cadastro e permissões do sistema
                </p>
              </div>
              <span style={{ color: "#2563eb" }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}