"use client";

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      {/* TÍTULO / STATUS NO LADO ESQUERDO */}
      <div className={styles.welcomeInfo}>
        <h2 className={styles.pageTitle}>Sistema de Regulação</h2>
        <span className={styles.statusBadge}>
          <span className={styles.statusDot}></span>
          Ativo
        </span>
      </div>

      {/* PERFIL DO USUÁRIO */}
      <div className={styles.actions}>
        <div className={styles.profile}>
          <div className={styles.avatar}>DR</div>
          <div className={styles.profileInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Administrador</span>
          </div>
        </div>

        <button className={styles.logoutBtn} title="Sair do Sistema">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}