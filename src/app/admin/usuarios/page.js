'use client';

import { useState } from 'react';
import styles from './AdminUsuarios.module.css';

export default function AdminUsuariosPage() {
  const [cpf, setCpf] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState('OPERADOR_REGULA');
  const [senha, setSenha] = useState('');

  const [pessoaExiste, setPessoaExiste] = useState(false);
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Mapeia o Perfil selecionado para o texto que vai aparecer no Header
  const obterNomePerfil = (perfilRole) => {
    switch (perfilRole) {
      case 'OPERADOR_REGULA':
        return 'Regulação de Exames';
      case 'ADMIN_REGULA':
        return 'Gestor da Regulação';
      case 'ADMIN_FARMACIA':
        return 'Câmara Técnica / Farmácia';
      case 'OPERADOR_JUNTA':
        return 'Junta Reguladora';
      case 'VETERINARIO':
        return 'Vigilância & Zoonoses (CCZ)';
      case 'ADMIN':
        return 'Gestor do Sistema';
      default:
        return 'Operador do Sistema';
    }
  };

  // Busca automática ao digitar os 11 dígitos do CPF
  const handleCpfChange = async (e) => {
    const valorLimpo = e.target.value.replace(/\D/g, '');
    setCpf(valorLimpo);

    if (valorLimpo.length === 11) {
      setBuscandoCpf(true);
      setMensagem({ tipo: '', texto: '' });

      try {
        const res = await fetch(`/api/pessoas/${valorLimpo}`);
        const data = await res.json();

        if (res.ok && data.pessoa) {
          setPessoaExiste(true);
          setNomeCompleto(data.pessoa.nomeCompleto || '');
          setTelefone(data.pessoa.telefone || '');
          setMensagem({
            tipo: 'sucesso',
            texto: 'Pessoa encontrada no sistema! Defina a senha e o perfil abaixo.',
          });
        } else {
          setPessoaExiste(false);
          setNomeCompleto('');
          setTelefone('');
          setMensagem({
            tipo: 'alerta',
            texto: 'CPF não encontrado. Preencha o nome completo para cadastrar a pessoa.',
          });
        }
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao verificar o CPF.' });
      } finally {
        setBuscandoCpf(false);
      }
    } else {
      setPessoaExiste(false);
      if (valorLimpo.length < 11) {
        setMensagem({ tipo: '', texto: '' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cpf.length < 11) {
      setMensagem({ tipo: 'erro', texto: 'Informe um CPF válido com 11 dígitos.' });
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    const cargoFormatado = obterNomePerfil(role);

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf,
          nomeCompleto,
          dataNascimento,
          telefone,
          role,
          cargo: cargoFormatado,
          senha,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: `✅ Usuário cadastrado com sucesso como "${cargoFormatado}"!`,
        });
        // Limpa a senha após o sucesso
        setSenha('');
      } else {
        setMensagem({ tipo: 'erro', texto: data.error || 'Erro ao salvar usuário.' });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Usuários do Sistema</h1>

      {mensagem.texto && (
        <div className={`${styles.message} ${styles[mensagem.tipo]}`}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
        {/* CPF COM VALIDAÇÃO/BUSCA AUTOMÁTICA */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>CPF de Acesso (Login):</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="Digite os 11 dígitos do CPF"
              maxLength={11}
              autoComplete="off"
              className={styles.input}
            />
            {buscandoCpf && (
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.8rem',
                  color: '#2563eb',
                }}
              >
                Buscando...
              </span>
            )}
          </div>
        </div>

        {/* NOME COMPLETO */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Nome Completo: {pessoaExiste && <small style={{ color: '#166534' }}>(Cadastrado)</small>}
          </label>
          <input
            type="text"
            required
            disabled={pessoaExiste}
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className={styles.input}
            placeholder={pessoaExiste ? '' : 'Digite o nome do operador'}
            autoComplete="off"
            style={{ backgroundColor: pessoaExiste ? '#f1f5f9' : '#ffffff' }}
          />
        </div>

        {/* DATA E TELEFONE */}
        <div className={styles.gridTwoCols}>
          <div>
            <label className={styles.fieldLabel}>Data de Nascimento</label>
            <input
              type="date"
              disabled={pessoaExiste}
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className={styles.input}
              autoComplete="off"
              style={{ backgroundColor: pessoaExiste ? '#f1f5f9' : '#ffffff' }}
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Telefone</label>
            <input
              type="text"
              disabled={pessoaExiste}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className={styles.input}
              autoComplete="off"
              style={{ backgroundColor: pessoaExiste ? '#f1f5f9' : '#ffffff' }}
            />
          </div>
        </div>

        {/* PERFIL / PERMISSÃO DE ACESSO */}
        <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
          <label className={styles.label}>Perfil / Módulo de Acesso:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.select}
          >
            <option value="OPERADOR_REGULA">Regulação de Exames</option>
            <option value="ADMIN_REGULA">Gestor da Regulação</option>
            <option value="ADMIN_FARMACIA">Câmara Técnica / Farmácia</option>
            <option value="OPERADOR_JUNTA">Junta Reguladora</option>
            <option value="VETERINARIO">Vigilância & Zoonoses (CCZ)</option>
            <option value="ADMIN">ADMIN (Gestor Geral do Sistema)</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Cargo exibido no sistema: <strong>{obterNomePerfil(role)}</strong>
          </span>
        </div>

        {/* SENHA */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Senha de Acesso:</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite a senha de login"
            className={styles.input}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={salvando || buscandoCpf}
          className={styles.submitButton}
        >
          {salvando ? 'Salvando...' : 'Concluir Cadastro de Usuário'}
        </button>
      </form>
    </div>
  );
}