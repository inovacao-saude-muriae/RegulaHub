'use client';

import styles from './TabNovoPedido.module.css';

export default function TabNovoPedido({
  newRequest,
  setNewRequest,
  handleCreateRequest,
  auxData,
  availableProcedures,
  patientSuggestions,
  showSuggestions,
  isSearchingPatient,
  autocompleteRef,
  handlePatientSearchChange,
  handleInputFocus,
  handleSearchPatientManual,
  handleSelectPatientSuggestion,
  handleExamTypeChange,
  handleProcedureChange
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Nova Solicitação de Exame</h2>

      <form onSubmit={handleCreateRequest} className={styles.formGrid}>
        {/* BUSCA DE PACIENTE / AUTOCOMPLETE */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label>Buscar Paciente (Digite Nome ou CPF) *</label>
          <div className={styles.autocompleteContainer} ref={autocompleteRef}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Digite pelo menos 2 caracteres do Nome ou CPF..."
                value={newRequest.patientSearch}
                onChange={handlePatientSearchChange}
                onFocus={handleInputFocus}
                required
              />
              <button
                type="button"
                onClick={handleSearchPatientManual}
                className={styles.secondaryBtn}
              >
                Buscar
              </button>
            </div>

            {isSearchingPatient && (
              <div className={styles.loadingSpinner}>Buscando pacientes no banco...</div>
            )}

            {/* LISTA DE SUGESTÕES */}
            {showSuggestions && patientSuggestions.length > 0 && (
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

            {showSuggestions && !isSearchingPatient && patientSuggestions.length === 0 && newRequest.patientSearch.length >= 2 && (
              <div className={styles.noSuggestions}>Nenhum paciente encontrado com esse nome ou CPF.</div>
            )}
          </div>
        </div>

        {/* CAMPOS PREENCHIDOS AUTOMATICAMENTE */}
        <div className={styles.fieldGroup}>
          <label>Nome do Paciente *</label>
          <input
            type="text"
            value={newRequest.patientName}
            readOnly
            placeholder="Aguardando busca..."
            className={styles.readOnlyInput}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Nome da Mãe *</label>
          <input
            type="text"
            value={newRequest.motherName}
            readOnly
            placeholder="Aguardando busca..."
            className={styles.readOnlyInput}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>CPF *</label>
          <input
            type="text"
            value={newRequest.cpf}
            readOnly
            placeholder="Aguardando busca..."
            className={styles.readOnlyInput}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Cartão SUS</label>
          <input
            type="text"
            value={newRequest.susCard}
            onChange={(e) => setNewRequest({ ...newRequest, susCard: e.target.value })}
            placeholder="Ex: 700000000000000"
          />
        </div>

        {/* DADOS DO EXAME */}
        <div className={styles.fieldGroup}>
          <label>1. Tipo de Exame *</label>
          <select value={newRequest.examTypeId} onChange={handleExamTypeChange} required>
            <option value="">-- Selecione o Exame --</option>
            {auxData.tiposExame.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>2. Procedimento Específico *</label>
          <select
            value={newRequest.procedureId}
            onChange={handleProcedureChange}
            disabled={!newRequest.examTypeId}
            required
          >
            <option value="">
              {!newRequest.examTypeId
                ? 'Selecione primeiro o Exame acima'
                : '-- Selecione o Procedimento --'}
            </option>
            {availableProcedures.map((proc) => (
              <option key={proc.id} value={proc.id}>
                {proc.nome} (R$ {proc.valor.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>Médico Solicitante (Cadastrado) *</label>
          <select
            value={newRequest.medicoSolicitanteId}
            onChange={(e) => setNewRequest({ ...newRequest, medicoSolicitanteId: e.target.value })}
            required
          >
            <option value="">-- Selecione o Médico --</option>
            {auxData.medicos
              .filter((m) => m.tipo !== 'Regulador')
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} (CRM: {m.crm})
                </option>
              ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>UBS Solicitante (Cadastrada) *</label>
          <select
            value={newRequest.ubsResponsavelId}
            onChange={(e) => setNewRequest({ ...newRequest, ubsResponsavelId: e.target.value })}
            required
          >
            <option value="">-- Selecione a UBS --</option>
            {auxData.ubsList.map((ubs) => (
              <option key={ubs.id} value={ubs.id}>
                {ubs.nome} (CNES: {ubs.cnes})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>Classificação de Risco *</label>
          <select
            value={newRequest.classification}
            onChange={(e) => setNewRequest({ ...newRequest, classification: e.target.value })}
            required
          >
            <option value="Verde">Verde (Eletivo)</option>
            <option value="Amarelo">Amarelo (Prioritário)</option>
            <option value="Vermelho">Vermelho (Urgente)</option>
          </select>
        </div>

        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label>Justificativa do Pedido (Quadro Clínico)</label>
          <textarea
            rows="3"
            placeholder="Descreva o histórico clínico..."
            value={newRequest.justification}
            onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
          />
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