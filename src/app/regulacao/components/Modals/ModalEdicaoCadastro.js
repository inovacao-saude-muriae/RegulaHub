'use client';

import styles from './ModalEdicaoCadastro.module.css';

export default function ModalEdicaoCadastro({
  editingItem,
  editingType,
  formPessoa,
  setFormPessoa,
  formMedico,
  setFormMedico,
  formUbs,
  setFormUbs,
  handleSavePessoa,
  handleSaveMedico,
  handleSaveUbs,
  onClose,
}) {
  if (!editingItem || !editingType) return null;

  const getTitulo = () => {
    if (editingType === 'PESSOA') return `✏️ Editar Paciente — ${editingItem.nomeCompleto}`;
    if (editingType === 'MEDICO') return `✏️ Editar Médico — ${editingItem.nome}`;
    if (editingType === 'UBS') return `✏️ Editar Unidade — ${editingItem.nome}`;
    return '✏️ Editar';
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${editingType === 'PESSOA' ? styles.modalLarge : styles.modalMedium}`}>
        <div className={styles.modalHeader}>
          <h3>{getTitulo()}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        {/* FORMULÁRIO PACIENTE */}
        {editingType === 'PESSOA' && (
          <form onSubmit={handleSavePessoa} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados Pessoais</p>
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldGroup}>
                <label>CPF</label>
                <input
                  type="text"
                  value={formPessoa.cpf}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formPessoa.nomeCompleto}
                  onChange={(e) => setFormPessoa({ ...formPessoa, nomeCompleto: e.target.value })}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  value={formPessoa.dataNascimento}
                  onChange={(e) => setFormPessoa({ ...formPessoa, dataNascimento: e.target.value })}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Nome da Mãe *</label>
                <input
                  type="text"
                  value={formPessoa.nomeMae}
                  onChange={(e) => setFormPessoa({ ...formPessoa, nomeMae: e.target.value })}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Telefone</label>
                <input
                  type="text"
                  value={formPessoa.telefone}
                  onChange={(e) => setFormPessoa({ ...formPessoa, telefone: e.target.value })}
                  placeholder="Ex: 32999998888"
                />
              </div>
            </div>

            <p className={styles.sectionTitle}>Endereço</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Logradouro / Rua</label>
                <input
                  type="text"
                  value={formPessoa.logradouro}
                  onChange={(e) => setFormPessoa({ ...formPessoa, logradouro: e.target.value })}
                  placeholder="Ex: Rua Paschoal Bernardino"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Número</label>
                <input
                  type="text"
                  value={formPessoa.numero}
                  onChange={(e) => setFormPessoa({ ...formPessoa, numero: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Complemento</label>
                <input
                  type="text"
                  value={formPessoa.complemento}
                  onChange={(e) => setFormPessoa({ ...formPessoa, complemento: e.target.value })}
                  placeholder="Ex: Apto 201"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Bairro</label>
                <input
                  type="text"
                  value={formPessoa.bairro}
                  onChange={(e) => setFormPessoa({ ...formPessoa, bairro: e.target.value })}
                  placeholder="Ex: Centro"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Cidade</label>
                <input
                  type="text"
                  value={formPessoa.cidade}
                  onChange={(e) => setFormPessoa({ ...formPessoa, cidade: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>UF</label>
                <input
                  type="text"
                  value={formPessoa.uf}
                  onChange={(e) => setFormPessoa({ ...formPessoa, uf: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CEP</label>
                <input
                  type="text"
                  value={formPessoa.cep}
                  onChange={(e) => setFormPessoa({ ...formPessoa, cep: e.target.value })}
                  placeholder="Ex: 36880000"
                  maxLength={8}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancelar</button>
              <button type="submit" className={styles.primaryBtn}>💾 Atualizar Paciente</button>
            </div>
          </form>
        )}

        {/* FORMULÁRIO MÉDICO */}
        {editingType === 'MEDICO' && (
          <form onSubmit={handleSaveMedico} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados do Médico</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Nome do Médico *</label>
                <input
                  type="text"
                  value={formMedico.nome}
                  onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
                  placeholder="Ex: Dr. Roberto Silva"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CRM *</label>
                <input
                  type="text"
                  value={formMedico.crm}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>UF do CRM</label>
                <input
                  type="text"
                  value={formMedico.ufCrm}
                  onChange={(e) => setFormMedico({ ...formMedico, ufCrm: e.target.value })}
                  maxLength={2}
                  required
                />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Especialidade</label>
                <input
                  type="text"
                  value={formMedico.especialidade}
                  onChange={(e) => setFormMedico({ ...formMedico, especialidade: e.target.value })}
                  placeholder="Ex: Cardiologia"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tipo</label>
                <select
                  value={formMedico.tipo}
                  onChange={(e) => setFormMedico({ ...formMedico, tipo: e.target.value })}
                >
                  <option value="Solicitante">Solicitante</option>
                  <option value="Regulador">Regulador</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancelar</button>
              <button type="submit" className={styles.primaryBtn}>💾 Atualizar Médico</button>
            </div>
          </form>
        )}

        {/* FORMULÁRIO UBS */}
        {editingType === 'UBS' && (
          <form onSubmit={handleSaveUbs} className={styles.modalForm}>
            <p className={styles.sectionTitle}>Dados da Unidade de Saúde</p>
            <div className={styles.fieldsGrid}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label>Nome da Unidade / UBS *</label>
                <input
                  type="text"
                  value={formUbs.nome}
                  onChange={(e) => setFormUbs({ ...formUbs, nome: e.target.value })}
                  placeholder="Ex: UBS Bairro Central"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Código CNES *</label>
                <input
                  type="text"
                  value={formUbs.cnes}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancelar</button>
              <button type="submit" className={styles.primaryBtn}>💾 Atualizar UBS</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
