'use client';

import { useState } from 'react';

export default function AdminUsuariosPage() {
  const [cpf, setCpf] = useState('');
  const [pessoa, setPessoa] = useState(null);
  const [loadingPessoa, setLoadingPessoa] = useState(false);
  const [role, setRole] = useState('OPERADOR_REGULA');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);

  // Busca se a pessoa já existe na tabela `pessoa` pelo CPF
  const handleBuscarPessoa = async () => {
    if (!cpf || cpf.length < 11) {
      setMensagem({ tipo: 'erro', texto: 'Informe um CPF válido com 11 dígitos.' });
      return;
    }

    setLoadingPessoa(true);
    setMensagem({ tipo: '', texto: '' });
    setPessoa(null);

    try {
      const res = await fetch(`/api/pessoas/${cpf}`);
      const data = await res.json();

      if (res.ok && data.pessoa) {
        setPessoa(data.pessoa);
      } else {
        setMensagem({
          tipo: 'erro',
          texto: 'Pessoa não encontrada no sistema. Cadastre-a antes de criar o usuário.'
        });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao buscar dados da pessoa.' });
    } finally {
      setLoadingPessoa(false);
    }
  };

  // Cria a conta de acesso para o usuário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pessoa) return;

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pessoaCpf: pessoa.cpf,
          role,
          cargo,
          senha
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: '✅ Usuário criado com sucesso!' });
        setSenha('');
        setCargo('');
      } else {
        setMensagem({ tipo: 'erro', texto: data.error || 'Erro ao criar usuário.' });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a202c' }}>
        Gerenciamento de Usuários
      </h1>

      {mensagem.texto && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', background: mensagem.tipo === 'sucesso' ? '#d4edda' : '#f8d7da', color: mensagem.tipo === 'sucesso' ? '#155724' : '#721c24' }}>
          {mensagem.texto}
        </div>
      )}

      {/* Busca de CPF */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>CPF do Colaborador:</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
            placeholder="Digite apenas números"
            maxLength={11}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button
            type="button"
            onClick={handleBuscarPessoa}
            disabled={loadingPessoa}
            style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loadingPessoa ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Formulário de Atribuição de Acesso */}
      {pessoa && (
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '4px', marginBottom: '1rem' }}>
            <p><strong>Nome:</strong> {pessoa.nomeCompleto}</p>
            <p><strong>CPF:</strong> {pessoa.cpf}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Perfil de Acesso (Role):</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="OPERADOR_REGULA">OPERADOR_REGULA</option>
              <option value="ADMIN_REGULA">ADMIN_REGULA</option>
              <option value="VETERINARIO">VETERINARIO</option>
              <option value="OPERADOR_JUNTA">OPERADOR_JUNTA</option>
              <option value="ADMIN_JUNTA">ADMIN_JUNTA</option>
              <option value="ADMIN_FARMACIA">ADMIN_FARMACIA</option>
              <option value="ADMIN_PROCESSO">ADMIN_PROCESSO</option>
              <option value="ADMIN">ADMIN (Acesso Total)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cargo / Função:</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Regulador de Saúde, Médico Veterinário"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Senha Inicial:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Defina a senha de acesso"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            style={{ width: '100%', padding: '0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {salvando ? 'Salvando...' : 'Criar Conta de Usuário'}
          </button>
        </form>
      )}
    </div>
  );
}