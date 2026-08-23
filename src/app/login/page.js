'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const formData = new FormData(e.target);

    const res = await loginAction(formData);

    if (res.success) {
      // Redireciona com base no perfil ou para a página principal
      router.push('/regulacao');
    } else {
      setMsg(res.error);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#f4f6f8' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '320px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>RegulaHub - Login</h2>
        
        {msg && <p style={{ color: 'red', fontSize: '14px', marginBottom: '1rem' }}>{msg}</p>}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>CPF:</label>
          <input type="text" name="cpf" required placeholder="Digite seu CPF" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Senha:</label>
          <input type="password" name="senha" required placeholder="Digite sua senha" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}