'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Mapeamento de destinos com base no perfil (Role)
  const getDestinationByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/'; // Gestor do Sistema vai para a Tela de Início / Módulos

      case 'OPERADOR_REGULA':
      case 'ADMIN_REGULA':
        return '/regulacao?tab=DASHBOARD'; // Dashboard de Regulação de Exames

      case 'ADMIN_FARMACIA':
        return '/camara-tecnica/farmacia-judicial?tab=DASHBOARD'; // Farmácia Judicial

      case 'ADMIN_PROCESSO':
        return '/camara-tecnica/processos'; // Processos da Câmara Técnica

      case 'OPERADOR_JUNTA':
      case 'ADMIN_JUNTA':
        return '/junta-reguladora?tab=CADASTRO'; // Junta Reguladora

      case 'VETERINARIO':
        return '/ccz?tab=DASHBOARD'; // CCZ & Zoonoses

      default:
        return '/regulacao'; // Rota padrão de contingência
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    const formData = new FormData(e.target);
    const res = await loginAction(formData);

    if (res?.success) {
      const cpfDigitado = formData.get('cpf')?.replace(/\D/g, '');
      if (typeof window !== 'undefined' && cpfDigitado) {
        localStorage.setItem('user_cpf', cpfDigitado);
      }

      // Direciona o usuário para a página específica do seu perfil
      const destination = getDestinationByRole(res.role);
      router.push(destination);
    } else {
      setMsg(res?.error || 'CPF ou senha incorretos.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.loginHeader}>
        <div className={styles.brand}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>RegulaHub</span>
        </div>
        <span className={styles.badge}>Acesso Restrito</span>
      </header>

      <main className={styles.mainContent}>
        <form onSubmit={handleSubmit} className={styles.card}>
          <h2 className={styles.title}>Identifique-se</h2>

          {msg && <div className={styles.errorMessage}>{msg}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>CPF:</label>
            <input
              type="text"
              name="cpf"
              required
              placeholder="Digite seu CPF"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroupLast}>
            <label className={styles.label}>Senha:</label>
            <input
              type="password"
              name="senha"
              required
              placeholder="Digite sua senha"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
          >
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </main>
    </div>
  );
}