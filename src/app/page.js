"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

// SIMULAÇÃO DO USUÁRIO LOGADO (Substitua depois pela sua Context API / Auth Session)
const currentUser = {
  name: "Dr. João",
  isDevAdmin: false, // 'true' para você (Admin) | 'false' para o usuário comum
  allowedModules: [
    {
      title: "Regulação de Exames",
      path: "/regulacao",
      defaultTab: "DASHBOARD",
    },
  ],
};

const modules = [
  {
    title: "Regulação de Exames",
    description: "Gestão e autorização de pedidos de Tomografia, Ressonância e Cintilografia.",
    path: "/regulacao",
    defaultTab: "DASHBOARD",
    tag: "Alta Complexidade",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Câmara Técnica",
    description: "Análise de Farmácia Judicial, pareceres e acompanhamento de processos.",
    path: "/camara-tecnica/farmacia-judicial",
    defaultTab: "DASHBOARD",
    tag: "Jurídico",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    ),
  },
  {
    title: "Junta Reguladora",
    description: "Avaliação médica conjunta e emissão de laudos de segunda opinião.",
    path: "/junta-reguladora",
    defaultTab: "CADASTRO",
    tag: "Auditoria",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: "CCZ - Zoonoses",
    description: "Controle de agravos, vetores e vigilância em saúde ambiental.",
    path: "/ccz",
    defaultTab: "DASHBOARD",
    tag: "Vigilância",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // REDIRECIONAMENTO AUTOMÁTICO:
    // Se não for Admin e tiver permissão de 1 módulo, vai direto para o Dashboard dele.
    if (!currentUser.isDevAdmin && currentUser.allowedModules.length === 1) {
      const userModule = currentUser.allowedModules[0];
      router.replace(`${userModule.path}?tab=${userModule.defaultTab}`);
    }
  }, [router]);

  // Se o usuário estiver sendo redirecionado, mostra um feedback simples na tela
  if (!currentUser.isDevAdmin && currentUser.allowedModules.length === 1) {
    return (
      <div className={styles.loadingContainer}>
        <p>Redirecionando para o seu Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.welcomeHeader}>
        <div className={styles.badgeGroup}>
          <span className={styles.systemBadge}>RegulaHub • Sistema Integrado</span>
          <span className={styles.devBadge}>Dev / System Admin</span>
        </div>
        <h1>Olá, {currentUser.name} 👋</h1>
        <p>Você está no modo Administrador. Escolha um módulo para acessar o Dashboard ou gerenciar os dados.</p>
      </header>

      {/* VISÃO DE TODOS OS MÓDULOS (PARA VOCÊ COMO DEV) */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>Módulos do Sistema</h2>

        <div className={styles.grid}>
          {modules.map((mod, idx) => (
            <Link key={idx} href={`${mod.path}?tab=${mod.defaultTab}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>{mod.icon}</div>
                <span className={styles.tag}>{mod.tag}</span>
              </div>

              <div className={styles.cardBody}>
                <h2>{mod.title}</h2>
                <p>{mod.description}</p>
              </div>

              <div className={styles.cardFooter}>
                <span>Abrir Dashboard</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}