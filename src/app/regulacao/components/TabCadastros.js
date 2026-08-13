'use client';

import styles from './TabCadastros.module.css';

export default function TabCadastros({
  cadSubTab,
  setCadSubTab,
  formPessoa,
  setFormPessoa,
  handleSavePessoa,
  formMedico,
  setFormMedico,
  handleSaveMedico,
  formUbs,
  setFormUbs,
  handleSaveUbs,
  formProcedimento,
  setFormProcedimento,
  handleSaveProcedimento,
  auxData
}) {
  return (
    <div className={styles.card}>
      <div className={styles.examQueueNav}>
        <button 
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === 'PACIENTES' ? styles.activeExamQueue : ''}`} 
          onClick={() => setCadSubTab('PACIENTES')}
        >
          👤 Pacientes ({auxData.pessoas ? auxData.pessoas.length : 0})
        </button>
        <button 
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === 'MEDICOS' ? styles.activeExamQueue : ''}`} 
          onClick={() => setCadSubTab('MEDICOS')}
        >
          👨‍⚕️ Médicos ({auxData.medicos.length})
        </button>
        <button 
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === 'UBS' ? styles.activeExamQueue : ''}`} 
          onClick={() => setCadSubTab('UBS')}
        >
          🏥 Unidades de Saúde ({auxData.ubsList.length})
        </button>
        <button 
          type="button"
          className={`${styles.examQueueBtn} ${cadSubTab === 'PROCEDIMENTOS' ? styles.activeExamQueue : ''}`} 
          onClick={() => setCadSubTab('PROCEDIMENTOS')}
        >
          🔬 Procedimentos ({auxData.procedimentos.length})
        </button>
      </div>

      {/* SUB-ABA: PACIENTES / PESSOAS */}
      {cadSubTab === 'PACIENTES' && (
        <div>
          <h3>Cadastrar Novo Paciente / Pessoa</h3>
          <form onSubmit={handleSavePessoa} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>CPF * (Apenas números)</label>
              <input type="text" value={formPessoa.cpf} onChange={(e) => setFormPessoa({ ...formPessoa, cpf: e.target.value })} placeholder="Ex: 12345678901" maxLength={11} required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome Completo *</label>
              <input type="text" value={formPessoa.nomeCompleto} onChange={(e) => setFormPessoa({ ...formPessoa, nomeCompleto: e.target.value })} placeholder="Ex: Maria das Dores" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Data de Nascimento *</label>
              <input type="date" value={formPessoa.dataNascimento} onChange={(e) => setFormPessoa({ ...formPessoa, dataNascimento: e.target.value })} required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome da Mãe *</label>
              <input type="text" value={formPessoa.nomeMae} onChange={(e) => setFormPessoa({ ...formPessoa, nomeMae: e.target.value })} placeholder="Ex: Ana Silva" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input type="text" value={formPessoa.telefone} onChange={(e) => setFormPessoa({ ...formPessoa, telefone: e.target.value })} placeholder="Ex: 32999998888" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Logradouro / Rua</label>
              <input type="text" value={formPessoa.logradouro} onChange={(e) => setFormPessoa({ ...formPessoa, logradouro: e.target.value })} placeholder="Ex: Rua Paschoal Bernardino" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Número</label>
              <input type="text" value={formPessoa.numero} onChange={(e) => setFormPessoa({ ...formPessoa, numero: e.target.value })} placeholder="Ex: 100" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Complemento</label>
              <input type="text" value={formPessoa.complemento} onChange={(e) => setFormPessoa({ ...formPessoa, complemento: e.target.value })} placeholder="Ex: Apto 201" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Bairro</label>
              <input type="text" value={formPessoa.bairro} onChange={(e) => setFormPessoa({ ...formPessoa, bairro: e.target.value })} placeholder="Ex: Centro" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Cidade</label>
              <input type="text" value={formPessoa.cidade} onChange={(e) => setFormPessoa({ ...formPessoa, cidade: e.target.value })} placeholder="Ex: Muriaé" />
            </div>
            <div className={styles.fieldGroup}>
              <label>UF</label>
              <input type="text" value={formPessoa.uf} onChange={(e) => setFormPessoa({ ...formPessoa, uf: e.target.value })} placeholder="Ex: MG" maxLength={2} />
            </div>
            <div className={styles.fieldGroup}>
              <label>CEP</label>
              <input type="text" value={formPessoa.cep} onChange={(e) => setFormPessoa({ ...formPessoa, cep: e.target.value })} placeholder="Ex: 36880000" maxLength={8} />
            </div>
            <div className={`${styles.formActions} ${styles.fullWidth}`}>
              <button type="submit" className={styles.primaryBtn}>Salvar Paciente</button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Pacientes Cadastrados</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>CPF</th><th>Nome Completo</th><th>Mãe</th><th>Data Nasc.</th><th>Telefone</th></tr>
              </thead>
              <tbody>
                {auxData.pessoas && auxData.pessoas.map((p) => (
                  <tr key={p.cpf}>
                    <td>{p.cpf}</td>
                    <td><strong>{p.nomeCompleto}</strong></td>
                    <td>{p.nomeMae}</td>
                    <td>{p.dataNascimento}</td>
                    <td>{p.telefone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: MÉDICOS */}
      {cadSubTab === 'MEDICOS' && (
        <div>
          <h3>Cadastrar Novo Médico</h3>
          <form onSubmit={handleSaveMedico} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Nome do Médico *</label>
              <input type="text" value={formMedico.nome} onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })} placeholder="Ex: Dr. Roberto Silva" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>CRM *</label>
              <input type="text" value={formMedico.crm} onChange={(e) => setFormMedico({ ...formMedico, crm: e.target.value })} placeholder="Ex: 123456" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>UF do CRM</label>
              <input type="text" value={formMedico.ufCrm} onChange={(e) => setFormMedico({ ...formMedico, ufCrm: e.target.value })} maxLength={2} required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Tipo de Médico *</label>
              <select value={formMedico.tipo} onChange={(e) => setFormMedico({ ...formMedico, tipo: e.target.value })} required>
                <option value="Solicitante">Solicitante / Responsável</option>
                <option value="Regulador">Médico Regulador</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Especialidade</label>
              <input type="text" value={formMedico.especialidade} onChange={(e) => setFormMedico({ ...formMedico, especialidade: e.target.value })} placeholder="Ex: Cardiologia" />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>Salvar Médico</button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Médicos Cadastrados</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Nome</th><th>CRM</th><th>UF</th><th>Tipo</th><th>Especialidade</th></tr>
              </thead>
              <tbody>
                {auxData.medicos.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.nome}</strong></td>
                    <td>{m.crm}</td>
                    <td>{m.ufCrm}</td>
                    <td><span className={styles.quotaBadge}>{m.tipo}</span></td>
                    <td>{m.especialidade || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: UBS */}
      {cadSubTab === 'UBS' && (
        <div>
          <h3>Cadastrar Nova Unidade de Saúde (UBS)</h3>
          <form onSubmit={handleSaveUbs} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Nome da Unidade / UBS *</label>
              <input type="text" value={formUbs.nome} onChange={(e) => setFormUbs({ ...formUbs, nome: e.target.value })} placeholder="Ex: UBS Bairro Central" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Código CNES *</label>
              <input type="text" value={formUbs.cnes} onChange={(e) => setFormUbs({ ...formUbs, cnes: e.target.value })} placeholder="Ex: 7654321" required />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>Salvar UBS</button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Unidades Cadastradas</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Nome da UBS</th><th>CNES</th></tr>
              </thead>
              <tbody>
                {auxData.ubsList.map((u) => (
                  <tr key={u.id}><td><strong>{u.nome}</strong></td><td>{u.cnes}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: PROCEDIMENTOS */}
      {cadSubTab === 'PROCEDIMENTOS' && (
        <div>
          <h3>Cadastrar Novo Procedimento de Exame</h3>
          <form onSubmit={handleSaveProcedimento} className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Tipo de Exame Pertencente *</label>
              <select value={formProcedimento.tipoExameId} onChange={(e) => setFormProcedimento({ ...formProcedimento, tipoExameId: e.target.value })} required>
                <option value="">-- Selecione o Tipo de Exame --</option>
                {auxData.tiposExame.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Nome do Procedimento *</label>
              <input type="text" value={formProcedimento.nome} onChange={(e) => setFormProcedimento({ ...formProcedimento, nome: e.target.value })} placeholder="Ex: Ecocardiograma com Doppler" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Valor do Procedimento (R$) *</label>
              <input type="number" step="0.01" value={formProcedimento.valor} onChange={(e) => setFormProcedimento({ ...formProcedimento, valor: e.target.value })} placeholder="Ex: 180.00" required />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>Salvar Procedimento</button>
            </div>
          </form>

          <h4 className={styles.sectionHeaderMargin}>Procedimentos Cadastrados</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Nome do Procedimento</th><th>Tipo de Exame</th><th>Valor (R$)</th></tr>
              </thead>
              <tbody>
                {auxData.procedimentos.map((p) => (
                  <tr key={p.id}><td><strong>{p.nome}</strong></td><td>{p.tipoExameNome}</td><td>R$ {p.valor.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}