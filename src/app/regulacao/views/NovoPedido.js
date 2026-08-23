'use client';

import styles from './NovoPedido.module.css';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

export default function NovoPedido({
  newRequest = {
    patientSearch: '',
    patientName: '',
    motherName: '',
    cpf: '',
    susCard: '',
    examTypeId: '',
    procedureId: '',
    medicoSolicitanteId: '',
    ubsResponsavelId: '',
    classification: 'Verde',
    justification: '',
  },
  setNewRequest = () => {},
  handleCreateRequest = () => {},
  auxData = { tiposExame: [], medicos: [], ubsList: [] },
  availableProcedures = [],
  patientSuggestions = [],
  showSuggestions = false,
  isSearchingPatient = false,
  autocompleteRef,
  handlePatientSearchChange = () => {},
  handleInputFocus = () => {},
  handleSearchPatientManual = () => {},
  handleSelectPatientSuggestion = () => {},
  handleExamTypeChange = () => {},
  handleProcedureChange = () => {},
}) {
  // Identifica se qualquer dado relevante foi preenchido no formulário
  const isDirty = Boolean(
    newRequest.patientName ||
    newRequest.cpf ||
    newRequest.examTypeId ||
    newRequest.procedureId ||
    newRequest.justification
  );

  // Ativa o alerta de dados não salvos ao recarregar a página (F5) ou fechar a aba
  useUnsavedChanges(isDirty);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (handleCreateRequest) {
      await handleCreateRequest(e);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Nova Solicitação de Exame</h2>

      <form onSubmit={onSubmit} className={styles.patientFormContainer}>
        
        {/* SEÇÃO 1: BUSCA E IDENTIFICAÇÃO DO PACIENTE */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>1. Identificação do Paciente</h4>
          </div>

          <div className={styles.searchSectionContainer}>
            <div className={styles.fieldGroup}>
              <label>Buscar Paciente no Banco (Nome ou CPF) *</label>
              <div className={styles.searchActionRow} ref={autocompleteRef}>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    placeholder="Digite Nome ou CPF do paciente..."
                    value={newRequest.patientSearch || ''}
                    onChange={handlePatientSearchChange}
                    onFocus={handleInputFocus}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (patientSuggestions && patientSuggestions.length > 0) {
                          handleSelectPatientSuggestion(patientSuggestions[0]);
                        } else {
                          handleSearchPatientManual();
                        }
                      }
                    }}
                    required
                  />

                  {/* LISTA DE SUGESTÕES (AUTOCOMPLETE) */}
                  {showSuggestions && patientSuggestions && patientSuggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {patientSuggestions.map((pessoa) => (
                        <li
                          key={pessoa.cpf}
                          onClick={() => handleSelectPatientSuggestion(pessoa)}
                          className={styles.suggestionItem}
                        >
                          <div className={styles.suggestionName}>{pessoa.nomeCompleto}</div>
                          <div className={styles.suggestionDetails}>
                            CPF: {pessoa.cpf} | Mãe: {pessoa.nomeMae || 'Não informada'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {showSuggestions && !isSearchingPatient && patientSuggestions?.length === 0 && (newRequest.patientSearch || '').length >= 2 && (
                    <div className={styles.noSuggestions}>Nenhum paciente encontrado com esse nome ou CPF.</div>
                  )}
                </div>

                {/* BOTÃO LUPA BUSCAR */}
                <button
                  type="button"
                  onClick={handleSearchPatientManual}
                  className={`${styles.iconSquareBtn} ${styles.btnBlue}`}
                  title="Buscar Paciente"
                >
                  <img src="/img/icon/lupa.png" alt="Buscar" className={styles.iconImg} />
                </button>
              </div>

              {isSearchingPatient && (
                <div className={styles.loadingSpinner}>Buscando pacientes no banco...</div>
              )}
            </div>
          </div>

          {/* DADOS CONFIRMADOS DO PACIENTE */}
          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colName}`}>
              <label>Nome do Paciente *</label>
              <input
                type="text"
                value={newRequest.patientName || ''}
                readOnly
                placeholder="Aguardando busca..."
                className={styles.readOnlyInput}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colMother}`}>
              <label>Nome da Mãe</label>
              <input
                type="text"
                value={newRequest.motherName || ''}
                readOnly
                placeholder="Aguardando busca..."
                className={styles.readOnlyInput}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colCpf}`}>
              <label>CPF *</label>
              <input
                type="text"
                value={newRequest.cpf || ''}
                readOnly
                placeholder="Aguardando busca..."
                className={styles.readOnlyInput}
                required
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.colSus}`}>
              <label>Cartão SUS</label>
              <input
                type="text"
                value={newRequest.susCard || ''}
                onChange={(e) => setNewRequest({ ...newRequest, susCard: e.target.value })}
                placeholder="Ex: 700000000000000"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: DETALHES DO EXAME E SOLICITAÇÃO */}
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4>2. Detalhes do Exame e Solicitação</h4>
          </div>

          <div className={styles.formGridStrict}>
            <div className={`${styles.fieldGroup} ${styles.colExamType}`}>
              <label>Tipo de Exame *</label>
              <select value={newRequest.examTypeId || ''} onChange={handleExamTypeChange} required>
                <option value="">-- Selecione o Exame --</option>
                {auxData.tiposExame?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colProcedure}`}>
              <label>Procedimento Específico *</label>
              <select
                value={newRequest.procedureId || ''}
                onChange={handleProcedureChange}
                disabled={!newRequest.examTypeId}
                required
              >
                <option value="">
                  {!newRequest.examTypeId
                    ? 'Selecione primeiro o Exame'
                    : '-- Selecione o Procedimento --'}
                </option>
                {availableProcedures?.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.nome} (R$ {Number(proc.valor || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colDoctor}`}>
              <label>Médico Solicitante *</label>
              <select
                value={newRequest.medicoSolicitanteId || ''}
                onChange={(e) => setNewRequest({ ...newRequest, medicoSolicitanteId: e.target.value })}
                required
              >
                <option value="">-- Selecione o Médico --</option>
                {auxData.medicos
                  ?.filter((m) => m.tipo !== 'Regulador')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} (CRM: {m.crm})
                    </option>
                  ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colUbs}`}>
              <label>UBS Solicitante *</label>
              <select
                value={newRequest.ubsResponsavelId || ''}
                onChange={(e) => setNewRequest({ ...newRequest, ubsResponsavelId: e.target.value })}
                required
              >
                <option value="">-- Selecione a UBS --</option>
                {auxData.ubsList?.map((ubs) => (
                  <option key={ubs.id} value={ubs.id}>
                    {ubs.nome} (CNES: {ubs.cnes})
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.colRisk}`}>
              <label>Classificação de Risco *</label>
              <select
                value={newRequest.classification || 'Verde'}
                onChange={(e) => setNewRequest({ ...newRequest, classification: e.target.value })}
                required
              >
                <option value="Verde">Verde (Eletivo)</option>
                <option value="Amarelo">Amarelo (Prioritário)</option>
                <option value="Vermelho">Vermelho (Urgente)</option>
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label htmlFor="justification">Justificativa do Pedido (Quadro Clínico)</label>
              <textarea
                id="justification"
                rows="3"
                placeholder="Descreva a justificativa médica e o quadro clínico do paciente..."
                value={newRequest.justification || ''}
                onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryBtn}>
            Enviar para Lista de Espera
          </button>
        </div>
      </form>
    </div>
  );
}