"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function initDashboard() {
      try {
        setLoading(true);

        // 1. Autenticação do Usuário
        const resUser = await fetch("/api/me");
        if (!resUser.ok) {
          router.replace("/login");
          return;
        }

        const dataUser = await resUser.json();
        const userData = dataUser.user;
        setUser(userData);

        // 2. Redirecionamento de Operadores Comuns
        const isGestorOuAdmin = userData?.role === "ADMIN" || userData?.role === "GESTOR";

        if (!isGestorOuAdmin) {
          switch (userData?.role) {
            case "OPERADOR_REGULA":
            case "ADMIN_REGULA":
              router.replace("/regulacao?tab=DASHBOARD");
              break;
            case "ADMIN_FARMACIA":
            case "OPERADOR_FARMACIA":
              router.replace("/camara-tecnica/farmacia-judicial?tab=DASHBOARD");
              break;
            case "OPERADOR_JUNTA":
            case "ADMIN_JUNTA":
              router.replace("/junta-reguladora?tab=CADASTRO");
              break;
            case "VETERINARIO":
            case "OPERADOR_CCZ":
              router.replace("/ccz?tab=DASHBOARD");
              break;
            default:
              router.replace("/regulacao");
              break;
          }
          return;
        }

        // 3. Telemetria Real do Sistema (ADMIN/GESTOR)
        const resHealth = await fetch("/api/admin/health", { cache: "no-store" });
        if (resHealth.ok) {
          const healthData = await resHealth.json();
          setTelemetry(healthData);
          setError("");
        } else {
          setError("Não foi possível carregar os diagnósticos do banco de dados.");
        }
      } catch (err) {
        console.error("Erro ao carregar Dashboard:", err);
        setError("Falha de conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    initDashboard();

    const interval = setInterval(async () => {
      try {
        const resHealth = await fetch("/api/admin/health", { cache: "no-store" });
        if (resHealth.ok) {
          const healthData = await resHealth.json();
          setTelemetry(healthData);
        }
      } catch (err) {
        console.error("Erro na atualização em segundo plano:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Aferindo diagnóstico e telemetria do banco...</p>
      </div>
    );
  }

  if (!user) return null;

  const isDbOnline = telemetry?.database?.status === "ONLINE";

  return (
    <div className={styles.container}>
      {/* HEADER TÉCNICO */}
      <header className={styles.welcomeHeader}>
        <span className={styles.systemBadge}>Painel do Desenvolvedor • Telemetria Real</span>
        <h1 className={styles.pageTitle}>Diagnóstico do Sistema 🛠️</h1>
        <p className={styles.pageSubtitle}>
          Operador logado: <strong>{user?.nomeCompleto}</strong> ({user?.cargo || user?.role}).
        </p>
      </header>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className={styles.errorAlert}>
          <strong>Alerta de Diagnóstico:</strong> {error}
        </div>
      )}

      {/* CARDS DE MONITORAMENTO DA INFRAESTRUTURA */}
      <section className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${isDbOnline ? styles.cardSuccessBorder : styles.cardDangerBorder}`}>
          <div className={styles.kpiTitle}>Status do PostgreSQL (Prisma)</div>
          <div className={`${styles.kpiValue} ${isDbOnline ? styles.textSuccess : styles.textDanger}`}>
            {telemetry?.database?.status || "DESCONECTADO"}
          </div>
          <p className={styles.kpiFooter}>
            Latência da Query: <strong>{telemetry?.database?.pingMs ?? 0}ms</strong>
          </p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Tamanho do Banco</div>
          <div className={`${styles.kpiValue} ${styles.textDark}`}>
            {telemetry?.database?.tamanhoBanco || "Calculando..."}
          </div>
          <p className={styles.kpiFooter}>Volume de dados no PostgreSQL</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Sessões Ativas no Banco</div>
          <div className={`${styles.kpiValue} ${styles.textPrimary}`}>
            {telemetry?.metrics?.sessoesAtivas ?? 0}
          </div>
          <p className={styles.kpiFooter}>Tokens de sessão não expirados</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Usuários Registrados</div>
          <div className={`${styles.kpiValue} ${styles.textDark}`}>
            {telemetry?.metrics?.totalUsuarios ?? 0}
          </div>
          <p className={styles.kpiFooter}>Registros na tabela User</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>API /api/me</div>
          <div className={`${styles.kpiValue} ${styles.textSuccess}`}>
            200 OK
          </div>
          <p className={styles.kpiFooter}>Sessão HTTP-Only validada</p>
        </div>
      </section>

      {/* TRILHA DE SESSÕES RECENTES */}
      <section className={styles.dashboardGrid}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Sessões Recentes Registradas no Banco</h2>
          <div className={styles.moduleList}>
            {telemetry?.logs?.length > 0 ? (
              telemetry.logs.map((log) => (
                <div key={log.id} className={styles.moduleItem}>
                  <div>
                    <strong>{log.usuario}</strong>
                    <span className={styles.logRole}>
                      • Perfil: {log.role}
                    </span>
                  </div>
                  <span className={styles.logTime}>
                    Iniciado às {log.data}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyLogText}>
                Nenhuma sessão recente capturada.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}