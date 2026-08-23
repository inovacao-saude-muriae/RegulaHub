"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Aguarde...",
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Pega o CPF do localStorage de forma segura
        const cpfLogado =
          typeof window !== "undefined"
            ? localStorage.getItem("user_cpf") || "12912453674"
            : "12912453674";

        const res = await fetch(`/api/auth/${cpfLogado}`);

        if (res.ok) {
          const data = await res.json();
          const pessoa = data.pessoa;

          if (pessoa) {
            setUserData({
              name: pessoa.nomeCompleto || "Jefinny de Paula",
              role:
                pessoa.usuario?.cargo ||
                pessoa.usuario?.role ||
                "Gestor do Sistema",
            });
            return;
          }
        }

        // Se a API não retornar OK ou não achar a pessoa
        setUserData({
          name: "Jefinny de Paula",
          role: "Gestor do Sistema",
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        // Em caso de erro na requisição, define o usuário padrão para destravar
        setUserData({
          name: "Jefinny de Paula",
          role: "Gestor do Sistema",
        });
      }
    }

    fetchUserData();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_cpf");
    }
    router.push("/login");
  };

  const initialLetter =
    userData.name && userData.name !== "Carregando..."
      ? userData.name.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <header className={styles.header}>
      {/* INFORMAÇÕES DO USUÁRIO LOGADO */}
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>{initialLetter}</div>
        <div className={styles.userDetails}>
          <span className={styles.userName}>{userData.name}</span>
          <span className={styles.userRole}>{userData.role}</span>
        </div>
      </div>

      {/* BOTÃO DE SAIR */}
      <button
        type="button"
        className={styles.logoutBtn}
        title="Sair do Sistema"
        onClick={handleLogout}
      >
        <svg
          width="15"
          height="15"
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
    </header>
  );
}