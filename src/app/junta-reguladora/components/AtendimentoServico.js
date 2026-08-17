'use client';

import { useState } from 'react';
import styles from './AtendimentoServico.module.css';

export default function AtendimentoServico({ servicoNome, pacientes, atendimentos, onRegistrar }) {
  const [form, setForm] = useState({
    pacienteId: '',
    especialidade: '',
    data: new Date().toISOString().split('T')[0],
    status: 'PRESENCA',
    observacao: ''
  });

  const pacientesDoServico = pacientes.filter((p) =>
    p.locaisEncaminhados?.includes(servicoNome)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.pacienteId || !form.especialidade) return alert('Selecione o paciente e a especialidade.');
    onRegistrar({ ...form, servico: servicoNome });
    setForm({ ...form, pacienteId: '', observacao: '' });
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Recepção e Controle - Serviço: <span className={styles.badgeServico}>{servicoNome}</span></h3>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label>Paciente Vinculado ao Serviço *</label>
          <select value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} required>
            <option value="">-- Selecione o Paciente --</option>
            {pacientesDoServico.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (CPF: {p.cpf})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>Especialidade do Atendimento *</label>
          <input
            type="text"
            placeholder="Ex: Fonoaudiologia, Terapia Ocupacional..."
            value={form.especialidade}
            onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Data *</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
        </div>

        <div className={styles.fieldGroup}>
          <label>Frequência / Status *</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PRESENCA">✅ Presença Confimada</option>
            <option value="FALTA">❌ Falta</option>
            <option value="FALTA_JUSTIFICADA">⚠️ Falta Justificada</option>
          </select>
        </div>

        <div className={`${styles.fullWidth} ${styles.fieldGroup}`}>
          <label>Observação / Registro de Atendimento</label>
          <textarea
            rows="3"
            placeholder="Descreva observações da recepção ou do profissional..."
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          />
        </div>

        <div className={`${styles.fullWidth} ${styles.formActions}`}>
          <button type="submit" className={styles.primaryBtn}>Registrar Presença / Ocorrência</button>
        </div>
      </form>
    </div>
  );
}