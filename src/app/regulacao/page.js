'use client';

import { useState, useEffect } from 'react';
import { 
  getPedidosExames, 
  getAuxiliaryData,
  searchPessoa, 
  searchPessoasAutocomplete,
  createPedidoExame, 
  updateCommunicationDate, 
  releasePaciente 
} from './actions';
import styles from './page.module.css';

const QUOTA_LIMITS = {
  OCI: 25000.00,
  Credenciamento: 30000.00
};

const MONTHS_LIST = [
  { value: '01', name: 'Janeiro' },
  { value: '02', name: 'Fevereiro' },
  { value: '03', name: 'Março' },
  { value: '04', name: 'Abril' },
  { value: '05', name: 'Maio' },
  { value: '06', name: 'Junho' },
  { value: '07', name: 'Julho' },
  { value: '08', name: 'Agosto' },
  { value: '09', name: 'Setembro' },
  { value: '10', name: 'Outubro' },
  { value: '11', name: 'Novembro' },
  { value: '12', name: 'Dezembro' }
];

export default function RegulacaoPage() {
  const [activeTab, setActiveTab] = useState('NOVO_PEDIDO');
  const [selectedQueueExam, setSelectedQueueExam] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados Auxiliares vindos do banco
  const [auxData, setAuxData] = useState({ tiposExame: [], procedimentos: [] });

  // Autocomplete
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Pop-up exclusivo de Cotas Mensais
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalType, setQuotaModalType] = useState('OCI');
  const [quotaModalYear, setQuotaModalYear] = useState('2026');

  const [filters, setFilters] = useState({
    search: '',
    procedure: '',
    status: '',
    classification: '',
    communicationStatus: '',
    quotaType: '',
    entryDateStart: '',
    entryDateEnd: '',
    communicationDateStart: '',
    communicationDateEnd: '',
    releaseDateStart: '',
    releaseDateEnd: '',
    billingDateStart: '',
    billingDateEnd: ''
  });

  const [requests, setRequests] = useState([]);

  // Função assíncrona colocada dentro do useEffect para evitar warnings do React
  useEffect(() => {
    const loadRequestsFromDb = async () => {
      try {
        setLoading(true);
        const [pedidos, aux] = await Promise.all([
          getPedidosExames(),
          getAuxiliaryData()
        ]);
        setRequests(pedidos || []);
        setAuxData(aux || { tiposExame: [], procedimentos: [] });

        if (aux?.tiposExame?.length > 0) {
          setSelectedQueueExam(aux.tiposExame[0].nome);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequestsFromDb();
  }, []);

  const [newRequest, setNewRequest] = useState({
    patientSearch: '',
    patientName: '',
    motherName: '',
    cpf: '',
    susCard: '',
    examTypeId: '',
    procedureId: '',
    procedureName: '',
    estimatedCost: 0,
    competence: `${new Date().toISOString().slice(5, 7)}/${new Date().getFullYear()}`,
    requestDate: new Date().toISOString().split('T')[0],
    classification: 'Verde',
    requestDoctor: '',
    requestUbs: '',
    justification: ''
  });

  // Modal de Liberação
  const [releasingItem, setReleasingItem] = useState(null);
  const [regulationForm, setRegulationForm] = useState({
    status: 'Liberado',
    quota: '',
    releaseDate: new Date().toISOString().split('T')[0],
    quotaCompetenceMonth: new Date().toISOString().slice(5, 7),
    quotaCompetenceYear: `${new Date().getFullYear()}`,
    generalObservation: ''
  });

  // Manipulação do Autocomplete de Pacientes
  const handlePatientSearchChange = async (e) => {
    const value = e.target.value;
    setNewRequest(prev => ({ ...prev, patientSearch: value }));

    if (value.trim().length >= 2) {
      setIsSearchingPatient(true);
      const suggestions = await searchPessoasAutocomplete(value);
      setPatientSuggestions(suggestions || []);
      setShowSuggestions(true);
      setIsSearchingPatient(false);
    } else {
      setPatientSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPatientSuggestion = (pessoa) => {
    setNewRequest(prev => ({
      ...prev,
      patientSearch: pessoa.nomeCompleto,
      patientName: pessoa.nomeCompleto,
      motherName: pessoa.nomeMae || '',
      cpf: pessoa.cpf,
      susCard: ''
    }));
    setShowSuggestions(false);
  };

  const handleOpenReleaseModal = (item) => {
    const today = new Date().toISOString().split('T')[0];
    const initialMonth = today.slice(5, 7);
    const initialYear = today.slice(0, 4);

    setReleasingItem(item);
    setRegulationForm({
      status: 'Liberado',
      quota: item.quota || '',
      releaseDate: today,
      quotaCompetenceMonth: initialMonth,
      quotaCompetenceYear: initialYear,
      generalObservation: item.generalObservation || ''
    });
  };

  const handleReleaseDateChange = (newReleaseDate) => {
    if (!newReleaseDate) {
      setRegulationForm(prev => ({ ...prev, releaseDate: '' }));
      return;
    }

    const month = newReleaseDate.slice(5, 7);
    const year = newReleaseDate.slice(0, 4);

    setRegulationForm(prev => ({
      ...prev,
      releaseDate: newReleaseDate,
      quotaCompetenceMonth: month,
      quotaCompetenceYear: year
    }));
  };

  const handleSelectQuotaType = (selectedQuota) => {
    setRegulationForm(prev => ({ ...prev, quota: selectedQuota }));

    if (selectedQuota) {
      const yearToUse = regulationForm.quotaCompetenceYear || `${new Date().getFullYear()}`;
      setQuotaModalType(selectedQuota);
      setQuotaModalYear(yearToUse);
      setShowQuotaModal(true);
    }
  };

  const calculateMonthQuotaDetails = (quotaType, year, monthValue) => {
    const totalLimit = QUOTA_LIMITS[quotaType] || 0;
    const totalUsed = requests
      .filter(r => 
        r.status === 'Liberado' &&
        r.quota === quotaType &&
        r.quotaCompetenceMonth === monthValue &&
        r.quotaCompetenceYear === year
      )
      .reduce((sum, r) => sum + r.estimatedCost, 0);

    const available = totalLimit - totalUsed;
    return { totalLimit, totalUsed, available };
  };

  const handleSelectMonthFromModal = (monthValue) => {
    setRegulationForm(prev => ({
      ...prev,
      quota: quotaModalType,
      quotaCompetenceMonth: monthValue,
      quotaCompetenceYear: quotaModalYear
    }));
    setShowQuotaModal(false);
  };

  const handleUpdateCommunicationDate = async (id, newDate) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, communicationDate: newDate };
      }
      return req;
    }));

    await updateCommunicationDate(id, newDate);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      procedure: '',
      status: '',
      classification: '',
      communicationStatus: '',
      quotaType: '',
      entryDateStart: '',
      entryDateEnd: '',
      communicationDateStart: '',
      communicationDateEnd: '',
      releaseDateStart: '',
      releaseDateEnd: '',
      billingDateStart: '',
      billingDateEnd: ''
    });
  };

  const applyFilters = (items, targetStatus) => {
    return items.filter(item => {
      if (targetStatus && item.status !== targetStatus) return false;
      if (filters.status && item.status !== filters.status) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          item.patientName.toLowerCase().includes(searchLower) ||
          (item.motherName && item.motherName.toLowerCase().includes(searchLower)) ||
          item.cpf.includes(filters.search) ||
          (item.susCard && item.susCard.includes(filters.search)) ||
          String(item.id).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.procedure && item.procedure !== filters.procedure) return false;
      if (filters.classification && item.classification !== filters.classification) return false;
      if (filters.quotaType && item.quota !== filters.quotaType) return false;

      if (filters.communicationStatus === 'FILLED' && !item.communicationDate) return false;
      if (filters.communicationStatus === 'EMPTY' && item.communicationDate) return false;

      if (filters.entryDateStart && item.requestDate < filters.entryDateStart) return false;
      if (filters.entryDateEnd && item.requestDate > filters.entryDateEnd) return false;

      if (filters.communicationDateStart && item.communicationDate < filters.communicationDateStart) return false;
      if (filters.communicationDateEnd && item.communicationDate > filters.communicationDateEnd) return false;

      if (filters.releaseDateStart && item.releaseDate < filters.releaseDateStart) return false;
      if (filters.releaseDateEnd && item.releaseDate > filters.releaseDateEnd) return false;

      if (filters.billingDateStart && item.billingDate < filters.billingDateStart) return false;
      if (filters.billingDateEnd && item.billingDate > filters.billingDateEnd) return false;

      return true;
    });
  };

  const handleSearchPatientManual = async () => {
    if (!newRequest.patientSearch) return;

    const pessoa = await searchPessoa(newRequest.patientSearch.trim());
    if (pessoa) {
      setNewRequest(prev => ({
        ...prev,
        patientName: pessoa.nomeCompleto,
        motherName: pessoa.nomeMae,
        cpf: pessoa.cpf,
        susCard: ''
      }));
      setShowSuggestions(false);
    } else {
      alert('Pessoa não encontrada no banco de dados.');
    }
  };

  const handleExamTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    setNewRequest(prev => ({
      ...prev,
      examTypeId: selectedTypeId,
      procedureId: '',
      procedureName: '',
      estimatedCost: 0
    }));
  };

  const handleProcedureChange = (e) => {
    const selectedProcId = Number(e.target.value);
    const foundProc = auxData.procedimentos.find(p => p.id === selectedProcId);

    if (foundProc) {
      setNewRequest(prev => ({
        ...prev,
        procedureId: foundProc.id,
        procedureName: foundProc.nome,
        estimatedCost: foundProc.valor
      }));
    } else {
      setNewRequest(prev => ({ ...prev, procedureId: '', procedureName: '', estimatedCost: 0 }));
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.patientName || !newRequest.examTypeId || !newRequest.procedureId) {
      alert('Preencha os dados do paciente, tipo de exame e procedimento.');
      return;
    }

    const res = await createPedidoExame(newRequest);
    if (res.success) {
      alert('Pedido registrado com sucesso no banco de dados!');
      const updatedPedidos = await getPedidosExames();
      setRequests(updatedPedidos || []);
      setActiveTab('LISTA_ESPERA');

      setNewRequest({
        patientSearch: '',
        patientName: '',
        motherName: '',
        cpf: '',
        susCard: '',
        examTypeId: '',
        procedureId: '',
        procedureName: '',
        estimatedCost: 0,
        competence: `${new Date().toISOString().slice(5, 7)}/${new Date().getFullYear()}`,
        requestDate: new Date().toISOString().split('T')[0],
        classification: 'Verde',
        requestDoctor: '',
        requestUbs: '',
        justification: ''
      });
    } else {
      alert('Erro ao registrar pedido no banco.');
    }
  };

  const handleConfirmRelease = async (e) => {
    e.preventDefault();
    if (regulationForm.status !== 'Liberado') {
      alert('Selecione o status "Liberado" para confirmar a autorização e o débito financeiro.');
      return;
    }

    if (!regulationForm.quota) {
      alert('Por favor, selecione um Tipo de Cota.');
      return;
    }

    const currentDetails = calculateMonthQuotaDetails(
      regulationForm.quota, 
      regulationForm.quotaCompetenceYear, 
      regulationForm.quotaCompetenceMonth
    );

    if (releasingItem.estimatedCost > currentDetails.available) {
      const confirmExceed = confirm(`Atenção: O valor do exame (R$ ${releasingItem.estimatedCost.toFixed(2)}) excede o saldo restante da cota ${regulationForm.quota} na competência ${regulationForm.quotaCompetenceMonth}/${regulationForm.quotaCompetenceYear} (Saldo Atual: R$ ${currentDetails.available.toFixed(2)}). Deseja confirmar mesmo assim?`);
      if (!confirmExceed) return;
    }

    const res = await releasePaciente(releasingItem.id, regulationForm);
    if (res.success) {
      alert(`Paciente ${releasingItem.patientName} liberado com sucesso!`);
      const updatedPedidos = await getPedidosExames();
      setRequests(updatedPedidos || []);
      setReleasingItem(null);
    } else {
      alert('Erro ao atualizar a liberação no banco.');
    }
  };

  const availableProcedures = auxData.procedimentos.filter(
    p => String(p.tipoExameId) === String(newRequest.examTypeId)
  );

  const allProceduresList = auxData.procedimentos.map(p => p.nome);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Módulo de Regulação de Exames</h1>
          <p>Gerenciamento de solicitações, filas, liberações e custos</p>
        </div>

        <div className={styles.tabNav}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'NOVO_PEDIDO' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('NOVO_PEDIDO')}
          >
            + Novo Pedido
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'LISTA_ESPERA' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('LISTA_ESPERA')}
          >
            Lista de Espera ({requests.filter(i => i.status === 'Aguardando').length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'LIBERADOS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('LIBERADOS')}
          >
            Liberados ({requests.filter(i => i.status === 'Liberado').length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'FINANCEIRO' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('FINANCEIRO')}
          >
            Financeiro
          </button>
        </div>
      </header>

      {/* FILTROS */}
      {(activeTab === 'LISTA_ESPERA' || activeTab === 'LIBERADOS') && (
        <div className={styles.filterCard}>
          <div className={styles.filterBarTop}>
            <div className={styles.mainSearchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por paciente, cartão SUS, CPF ou código..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className={styles.filterActionsTop}>
              <button 
                type="button"
                className={styles.toggleFilterBtn}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                {showAdvancedFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
              </button>

              <button type="button" onClick={clearFilters} className={styles.clearFilterBtn}>
                Limpar
              </button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className={styles.advancedFiltersWrapper}>
              <div className={styles.filterSection}>
                <span className={styles.sectionTitle}>1. Parâmetros Gerais</span>
                <div className={styles.filterRow}>
                  <div className={styles.fieldItem}>
                    <label>Procedimento</label>
                    <select value={filters.procedure} onChange={(e) => handleFilterChange('procedure', e.target.value)}>
                      <option value="">Todos os procedimentos</option>
                      {allProceduresList.map((procName, idx) => (
                        <option key={idx} value={procName}>{procName}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Status</label>
                    <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                      <option value="">Todos os Status</option>
                      <option value="Aguardando">Aguardando</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Liberado">Liberado</option>
                    </select>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Classificação de Risco</label>
                    <select value={filters.classification} onChange={(e) => handleFilterChange('classification', e.target.value)}>
                      <option value="">Todas</option>
                      <option value="Verde">Verde</option>
                      <option value="Amarelo">Amarelo</option>
                      <option value="Vermelho">Vermelho</option>
                    </select>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Comunicação</label>
                    <select value={filters.communicationStatus} onChange={(e) => handleFilterChange('communicationStatus', e.target.value)}>
                      <option value="">Todas</option>
                      <option value="FILLED">Preenchida</option>
                      <option value="EMPTY">Vazia</option>
                    </select>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Cota</label>
                    <select value={filters.quotaType} onChange={(e) => handleFilterChange('quotaType', e.target.value)}>
                      <option value="">Todas</option>
                      <option value="OCI">OCI</option>
                      <option value="Credenciamento">Credenciamento</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.filterSection}>
                <span className={styles.sectionTitle}>2. Intervalos de Datas</span>
                <div className={styles.filterRow}>
                  <div className={styles.fieldItem}>
                    <label>Período de Entrada</label>
                    <div className={styles.dateRangeBox}>
                      <input 
                        type="date" 
                        value={filters.entryDateStart} 
                        onChange={(e) => handleFilterChange('entryDateStart', e.target.value)} 
                      />
                      <span>até</span>
                      <input 
                        type="date" 
                        value={filters.entryDateEnd} 
                        onChange={(e) => handleFilterChange('entryDateEnd', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Período de Comunicação</label>
                    <div className={styles.dateRangeBox}>
                      <input 
                        type="date" 
                        value={filters.communicationDateStart} 
                        onChange={(e) => handleFilterChange('communicationDateStart', e.target.value)} 
                      />
                      <span>até</span>
                      <input 
                        type="date" 
                        value={filters.communicationDateEnd} 
                        onChange={(e) => handleFilterChange('communicationDateEnd', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className={styles.fieldItem}>
                    <label>Período de Liberação</label>
                    <div className={styles.dateRangeBox}>
                      <input 
                        type="date" 
                        value={filters.releaseDateStart} 
                        onChange={(e) => handleFilterChange('releaseDateStart', e.target.value)} 
                      />
                      <span>até</span>
                      <input 
                        type="date" 
                        value={filters.releaseDateEnd} 
                        onChange={(e) => handleFilterChange('releaseDateEnd', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 1: NOVO PEDIDO */}
      {activeTab === 'NOVO_PEDIDO' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Nova Solicitação de Exame</h2>
          
          <form onSubmit={handleCreateRequest} className={styles.formGrid}>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Buscar Paciente (Digite Nome ou CPF)</label>
              <div className={styles.autocompleteContainer}>
                <div className={styles.searchBox}>
                  <input 
                    type="text"
                    placeholder="Digite pelo menos 2 caracteres do nome ou CPF..."
                    value={newRequest.patientSearch}
                    onChange={handlePatientSearchChange}
                    onFocus={() => newRequest.patientSearch.length >= 2 && setShowSuggestions(true)}
                  />
                  <button type="button" onClick={handleSearchPatientManual} className={styles.secondaryBtn}>
                    Buscar
                  </button>
                  {isSearchingPatient && <span className={styles.loadingSpinner}>...</span>}
                </div>

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
                          <span>CPF: {pessoa.cpf}</span>
                          {pessoa.nomeMae && <span> • Mãe: {pessoa.nomeMae}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {showSuggestions && !isSearchingPatient && patientSuggestions.length === 0 && (
                  <div className={styles.noSuggestions}>Nenhum paciente encontrado</div>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Nome do Paciente</label>
              <input type="text" value={newRequest.patientName} readOnly placeholder="Aguardando busca..." className={styles.readOnlyInput} />
            </div>

            <div className={styles.fieldGroup}>
              <label>Nome da Mãe</label>
              <input type="text" value={newRequest.motherName} readOnly placeholder="Aguardando busca..." className={styles.readOnlyInput} />
            </div>

            <div className={styles.fieldGroup}>
              <label>CPF</label>
              <input type="text" value={newRequest.cpf} readOnly placeholder="Aguardando busca..." className={styles.readOnlyInput} />
            </div>

            <div className={styles.fieldGroup}>
              <label>Cartão SUS</label>
              <input type="text" value={newRequest.susCard} readOnly placeholder="Aguardando busca..." className={styles.readOnlyInput} />
            </div>

            <div className={styles.fieldGroup}>
              <label>1. Tipo de Exame</label>
              <select value={newRequest.examTypeId} onChange={handleExamTypeChange} required>
                <option value="">-- Selecione o Exame --</option>
                {auxData.tiposExame.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>2. Procedimento Específico</label>
              <select 
                value={newRequest.procedureId} 
                onChange={handleProcedureChange}
                disabled={!newRequest.examTypeId}
                required
              >
                <option value="">
                  {newRequest.examTypeId ? '-- Selecione o Procedimento --' : 'Selecione primeiro o Exame acima'}
                </option>
                {availableProcedures.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.nome} (R$ {proc.valor.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Classificação de Risco</label>
              <select 
                value={newRequest.classification} 
                onChange={(e) => setNewRequest({ ...newRequest, classification: e.target.value })}
              >
                <option value="Verde">Verde (Eletivo)</option>
                <option value="Amarelo">Amarelo (Prioritário)</option>
                <option value="Vermelho">Vermelho (Urgente)</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Médico Solicitante</label>
              <input 
                type="text" 
                placeholder="Ex: Dr. Carlos Eduardo" 
                value={newRequest.requestDoctor} 
                onChange={(e) => setNewRequest({ ...newRequest, requestDoctor: e.target.value })}
                required 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>UBS Solicitante</label>
              <input 
                type="text" 
                placeholder="Ex: UBS Bairro Porto" 
                value={newRequest.requestUbs} 
                onChange={(e) => setNewRequest({ ...newRequest, requestUbs: e.target.value })}
                required 
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>Justificativa do Pedido (Quadro Clínico)</label>
              <textarea 
                rows="3" 
                placeholder="Descreva o histórico clínico..."
                value={newRequest.justification}
                onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>
                Enviar para Lista de Espera
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA 2: LISTA DE ESPERA */}
      {activeTab === 'LISTA_ESPERA' && (
        <div className={styles.card}>
          <div className={styles.examQueueNav}>
            {auxData.tiposExame.map((exam) => {
              const count = requests.filter(i => (i.examType === exam.nome || String(i.examTypeId) === String(exam.id)) && i.status === 'Aguardando').length;
              return (
                <button
                  key={exam.id}
                  className={`${styles.examQueueBtn} ${selectedQueueExam === exam.nome ? styles.activeExamQueue : ''}`}
                  onClick={() => setSelectedQueueExam(exam.nome)}
                >
                  Fila de {exam.nome} <span className={styles.badgeCount}>{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className={styles.loadingBox}>Carregando fila de espera do banco de dados...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data Entrada</th>
                    <th>Data Comunicação (Editável)</th>
                    <th>Paciente / Mãe / Classificação</th>
                    <th>Procedimento</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(
                    requests.filter(r => r.examType === selectedQueueExam)
                  ).map((item) => (
                    <tr key={item.id}>
                      <td className={styles.dateCell}>{item.requestDate}</td>
                      <td className={styles.editDateCell}>
                        <input 
                          type="date" 
                          value={item.communicationDate} 
                          onChange={(e) => handleUpdateCommunicationDate(item.id, e.target.value)}
                          className={styles.inlineDateInput}
                        />
                      </td>
                      <td>
                        <div className={styles.patientBlock}>
                          <div className={styles.patientNameHeader}>
                            <strong>{item.patientName}</strong>
                            <span className={`${styles.classBadge} ${styles[item.classification.toLowerCase()]}`}>
                              {item.classification}
                            </span>
                          </div>
                          <small className={styles.motherText}>Mãe: {item.motherName || 'Não informada'}</small>
                        </div>
                      </td>
                      <td><strong>{item.procedure}</strong></td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[item.status.toLowerCase()]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'Aguardando' && (
                          <button 
                            className={styles.releaseBtn}
                            onClick={() => handleOpenReleaseModal(item)}
                          >
                            Liberar Paciente
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: LIBERADOS */}
      {activeTab === 'LIBERADOS' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Histórico de Exames Liberados</h2>

          {loading ? (
            <div className={styles.loadingBox}>Carregando histórico do banco de dados...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Data Liberação</th>
                    <th>Data Comunicação</th>
                    <th>Paciente / Mãe</th>
                    <th>Procedimento</th>
                    <th>Cota Utilizada</th>
                    <th>Competência Cota</th>
                    <th>Valor Débito</th>
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(requests, 'Liberado').map((item) => (
                    <tr key={item.id}>
                      <td className={styles.codeCell}>{item.id}</td>
                      <td>{item.releaseDate}</td>
                      <td>{item.communicationDate || <span className={styles.emptyText}>Vazia</span>}</td>
                      <td>
                        <div className={styles.patientBlock}>
                          <strong>{item.patientName}</strong>
                          <small className={styles.motherText}>Mãe: {item.motherName}</small>
                        </div>
                      </td>
                      <td>
                        <div className={styles.patientInfo}>
                          <strong>[{item.examType}]</strong>
                          <span>{item.procedure}</span>
                        </div>
                      </td>
                      <td><span className={styles.quotaBadge}>{item.quota}</span></td>
                      <td><span className={styles.competenceBadge}>{item.quotaCompetenceMonth}/{item.quotaCompetenceYear}</span></td>
                      <td><strong>R$ {item.estimatedCost.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA 4: FINANCEIRO */}
      {activeTab === 'FINANCEIRO' && (
        <div className={styles.financeContainer}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span>Total na Fila de Espera</span>
              <h3>R$ {requests.filter(r => r.status === 'Aguardando').reduce((a, b) => a + b.estimatedCost, 0).toFixed(2)}</h3>
              <small>{requests.filter(r => r.status === 'Aguardando').length} exames pendentes</small>
            </div>

            <div className={styles.metricCard}>
              <span>Total Liberado (Debitado)</span>
              <h3 className={styles.successText}>R$ {requests.filter(r => r.status === 'Liberado').reduce((a, b) => a + b.estimatedCost, 0).toFixed(2)}</h3>
              <small>{requests.filter(r => r.status === 'Liberado').length} exames autorizados</small>
            </div>
          </div>
        </div>
      )}

      {/* POPUP PRINCIPAL: LIBERAÇÃO DE PACIENTE */}
      {releasingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentLarge}>
            <div className={styles.modalHeader}>
              <h3>Liberar Paciente • Regulação de Exames</h3>
              <button onClick={() => setReleasingItem(null)} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.autoDataSection}>
              <h4 className={styles.modalSectionTitle}>Informações Automáticas do Paciente e Pedido</h4>
              
              <div className={styles.autoDataGrid}>
                <div className={styles.autoDataItem}>
                  <label>Paciente</label>
                  <span>{releasingItem.patientName}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Cartão SUS</label>
                  <span>{releasingItem.susCard || 'Não informado'}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>CPF</label>
                  <span>{releasingItem.cpf}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Data do Pedido</label>
                  <span>{releasingItem.requestDate}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Procedimento</label>
                  <span>[{releasingItem.examType}] - {releasingItem.procedure}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Classificação de Risco</label>
                  <span className={`${styles.classBadge} ${styles[releasingItem.classification.toLowerCase()]}`}>
                    {releasingItem.classification}
                  </span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>UBS Solicitante</label>
                  <span>{releasingItem.requestUbs}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Médico Solicitante</label>
                  <span>{releasingItem.requestDoctor}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Data da Comunicação</label>
                  <span>{releasingItem.communicationDate || 'Não preenchida'}</span>
                </div>

                <div className={styles.autoDataItem}>
                  <label>Valor do Exame</label>
                  <strong>R$ {releasingItem.estimatedCost.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmRelease} className={styles.modalReleaseForm}>
              <h4 className={styles.modalSectionTitle}>Parâmetros de Autorização, Cota e Débito</h4>

              <div className={styles.releaseFieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label>Status da Solicitação *</label>
                  <select 
                    value={regulationForm.status} 
                    onChange={(e) => setRegulationForm({ ...regulationForm, status: e.target.value })}
                    required
                  >
                    <option value="Liberado">Liberado (Confirmar Débito Financeiro)</option>
                    <option value="Aguardando">Manter em Aguardando</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Data da Liberação *</label>
                  <input 
                    type="date" 
                    value={regulationForm.releaseDate} 
                    onChange={(e) => handleReleaseDateChange(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Tipo de Cota *</label>
                  <select 
                    value={regulationForm.quota} 
                    onChange={(e) => handleSelectQuotaType(e.target.value)}
                    required
                  >
                    <option value="">-- Selecione o Tipo de Cota --</option>
                    <option value="OCI">OCI</option>
                    <option value="Credenciamento">Credenciamento</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Competência de Débito (Mês / Ano)</label>
                  <div className={styles.monthYearDisplayBox}>
                    <span>{regulationForm.quotaCompetenceMonth}/{regulationForm.quotaCompetenceYear}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setQuotaModalType(regulationForm.quota || 'OCI');
                        setQuotaModalYear(regulationForm.quotaCompetenceYear);
                        setShowQuotaModal(true);
                      }}
                      className={styles.openQuotaModalBtn}
                    >
                      Consultar / Mudar Mês 📊
                    </button>
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label>Observação Geral</label>
                  <textarea 
                    rows="2" 
                    placeholder="Insira observações adicionais referente à liberação..."
                    value={regulationForm.generalObservation}
                    onChange={(e) => setRegulationForm({ ...regulationForm, generalObservation: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setReleasingItem(null)} className={styles.secondaryBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.approveBtn}>
                  Confirmar e Liberar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP AUXILIAR EXCLUSIVO DE COTAS MENSAIS */}
      {showQuotaModal && (
        <div className={styles.modalOverlayQuota}>
          <div className={styles.modalContentQuota}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Consulta de Cotas Mensais e Saldos</h3>
                <p>Cota selecionada: <strong>{quotaModalType}</strong>. Escolha a competência para o débito:</p>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.quotaModalFilterRow}>
              <div className={styles.fieldItem}>
                <label>Tipo de Cota</label>
                <select 
                  value={quotaModalType} 
                  onChange={(e) => setQuotaModalType(e.target.value)}
                >
                  <option value="OCI">OCI (Teto Mensal: R$ 25.000,00)</option>
                  <option value="Credenciamento">Credenciamento (Teto Mensal: R$ 30.000,00)</option>
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Ano da Competência</label>
                <select 
                  value={quotaModalYear} 
                  onChange={(e) => setQuotaModalYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            <div className={styles.tableWrapperModal}>
              <table className={styles.tableModal}>
                <thead>
                  <tr>
                    <th>Mês / Competência</th>
                    <th>Teto Mensal</th>
                    <th>Acumulado Utilizado</th>
                    <th>Saldo Restante</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS_LIST.map((m) => {
                    const details = calculateMonthQuotaDetails(quotaModalType, quotaModalYear, m.value);
                    const isSelected = 
                      regulationForm.quota === quotaModalType &&
                      regulationForm.quotaCompetenceMonth === m.value &&
                      regulationForm.quotaCompetenceYear === quotaModalYear;

                    return (
                      <tr key={m.value} className={isSelected ? styles.selectedQuotaRow : ''}>
                        <td>
                          <strong>{m.name} ({m.value}/{quotaModalYear})</strong>
                        </td>
                        <td>R$ {details.totalLimit.toFixed(2)}</td>
                        <td>R$ {details.totalUsed.toFixed(2)}</td>
                        <td>
                          <strong className={details.available >= (releasingItem?.estimatedCost || 0) ? styles.positiveText : styles.negativeText}>
                            R$ {details.available.toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className={styles.selectMonthBtn}
                            onClick={() => handleSelectMonthFromModal(m.value)}
                          >
                            {isSelected ? 'Mês Selecionado' : 'Selecionar Mês'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                onClick={() => setShowQuotaModal(false)} 
                className={styles.primaryBtn}
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}