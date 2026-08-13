'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  getPedidosExames, 
  getAuxiliaryData,
  searchPessoa, 
  searchPessoasAutocomplete,
  createPedidoExame, 
  updateCommunicationDate, 
  releasePaciente,
  createPessoa,
  createMedico,
  createUbs,
  createProcedimento,
  getCotasFinanceiras,
  saveCotaFinanceira,
  updateBillingDate,
  updatePedidoExame,
  deletePedidoExame
} from './actions';

import FiltersBar from './components/FiltersBar';
import TabNovoPedido from './components/TabNovoPedido';
import TabListaEspera from './components/TabListaEspera';
import TabLiberados from './components/TabLiberados';
import TabFinanceiro from './components/TabFinanceiro';
import TabCadastros from './components/TabCadastros';

import ModalTetoFinanceiro from './components/Modals/ModalTetoFinanceiro';
import ModalLiberacao from './components/Modals/ModalLiberacao';
import ModalEdicaoPedido from './components/Modals/ModalEdicaoPedido';
import ModalSeletorCotas from './components/Modals/ModalSeletorCotas';

import styles from './page.module.css';

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
  const [cadSubTab, setCadSubTab] = useState('PACIENTES');
  const [selectedQueueExam, setSelectedQueueExam] = useState('');
  const [selectedReleasedExam, setSelectedReleasedExam] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Seleções para exportação Excel
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedReleasedIds, setSelectedReleasedIds] = useState([]);

  // Autocomplete Ref
  const autocompleteRef = useRef(null);
  const isSelectedRef = useRef(false);

  // Estados dos Dados
  const [auxData, setAuxData] = useState({ tiposExame: [], procedimentos: [], medicos: [], ubsList: [], pessoas: [] });
  const [requests, setRequests] = useState([]);
  const [cotasFinanceiras, setCotasFinanceiras] = useState([]);

  // Autocomplete de Paciente
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Financeiro
  const [finMonth, setFinMonth] = useState('08');
  const [finYear, setFinYear] = useState('2026');
  const [editCotaModal, setEditCotaModal] = useState({ open: false, tipoCota: '', valor: '' });

  // Pop-up Seletor de Cotas
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalType, setQuotaModalType] = useState('OCI');
  const [quotaModalYear, setQuotaModalYear] = useState('2026');

  // Modal de Edição
  const [editingItem, setEditingItem] = useState(null);

  // Formulários de Cadastros Auxiliares
  const [formPessoa, setFormPessoa] = useState({
    cpf: '', nomeCompleto: '', dataNascimento: '', nomeMae: '', telefone: '',
    logradouro: '', numero: '', complemento: '', bairro: '', cidade: 'Muriaé', uf: 'MG', cep: ''
  });
  const [formMedico, setFormMedico] = useState({ nome: '', crm: '', ufCrm: 'MG', especialidade: '', tipo: 'Solicitante' });
  const [formUbs, setFormUbs] = useState({ nome: '', cnes: '' });
  const [formProcedimento, setFormProcedimento] = useState({ nome: '', valor: '', tipoExameId: '' });

  // Filtros Avançados
  const [filters, setFilters] = useState({
    search: '', procedure: '', status: '', classification: '', communicationStatus: '', quotaType: '',
    entryDateStart: '', entryDateEnd: '', communicationDateStart: '', communicationDateEnd: '',
    releaseDateStart: '', releaseDateEnd: '', billingDateStart: '', billingDateEnd: ''
  });

  // Novo Pedido State
  const [newRequest, setNewRequest] = useState({
    patientSearch: '', patientName: '', motherName: '', cpf: '', susCard: '',
    examTypeId: '', procedureId: '', procedureName: '', estimatedCost: 0,
    competence: `${new Date().toISOString().slice(5, 7)}/${new Date().getFullYear()}`,
    requestDate: new Date().toISOString().split('T')[0], classification: 'Verde',
    medicoSolicitanteId: '', ubsResponsavelId: '', justification: ''
  });

  // Modal de Liberação
  const [releasingItem, setReleasingItem] = useState(null);
  const [regulationForm, setRegulationForm] = useState({
    status: 'Liberado', quota: '', releaseDate: new Date().toISOString().split('T')[0],
    quotaCompetenceMonth: new Date().toISOString().slice(5, 7),
    quotaCompetenceYear: `${new Date().getFullYear()}`, generalObservation: '',
    regulatorDoctorId: ''
  });

  const reloadData = async () => {
    try {
      setLoading(true);
      const [pedidos, aux, cotas] = await Promise.all([
        getPedidosExames(),
        getAuxiliaryData(),
        getCotasFinanceiras()
      ]);
      setRequests(pedidos || []);
      setAuxData(aux || { tiposExame: [], procedimentos: [], medicos: [], ubsList: [], pessoas: [] });
      setCotasFinanceiras(cotas || []);

      if (aux?.tiposExame?.length > 0) {
        if (!selectedQueueExam) setSelectedQueueExam(aux.tiposExame[0].nome);
        if (!selectedReleasedExam) setSelectedReleasedExam(aux.tiposExame[0].nome);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resets de Seleções ao Trocar de Fila ou Aba
  useEffect(() => {
    setSelectedIds([]);
  }, [selectedQueueExam, activeTab]);

  useEffect(() => {
    setSelectedReleasedIds([]);
  }, [selectedReleasedExam, activeTab]);

  // AÇÕES E HANDLERS DA APLICAÇÃO
  const handleDeleteOrder = async (item) => {
    const confirmDelete = confirm(`Tem certeza que deseja excluir permanentemente o pedido de ${item.patientName} (${item.procedure})?`);
    if (!confirmDelete) return;

    const res = await deletePedidoExame(item.dbId || item.id);
    if (res.success) {
      alert('Pedido removido da fila com sucesso!');
      setSelectedIds(prev => prev.filter(id => id !== item.id));
      reloadData();
    } else {
      alert('Erro ao excluir o pedido: ' + res.error);
    }
  };

  const handleEditStatusChange = (newStatus) => {
    if (newStatus === 'Aguardando') {
      setEditingItem(prev => ({
        ...prev,
        status: 'Aguardando',
        quota: '',
        releaseDate: '',
        regulatorDoctorId: '',
        regulatorDoctor: ''
      }));
    } else {
      setEditingItem(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveEditedOrder = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const res = await updatePedidoExame(editingItem.dbId || editingItem.id, editingItem);
    if (res.success) {
      if (editingItem.status === 'Aguardando') {
        alert(`O paciente ${editingItem.patientName} retornou para a Lista de Espera! Dados de liberação foram limpos.`);
      } else {
        alert('Dados do paciente e pedido atualizados com sucesso!');
      }
      setEditingItem(null);
      reloadData();
    } else {
      alert('Erro ao atualizar registro: ' + res.error);
    }
  };

  const handleSavePessoa = async (e) => {
    e.preventDefault();
    if (!formPessoa.cpf || !formPessoa.nomeCompleto || !formPessoa.dataNascimento || !formPessoa.nomeMae) {
      return alert('Preencha os campos obrigatórios.');
    }

    const res = await createPessoa(formPessoa);
    if (res.success) {
      alert('Paciente cadastrado com sucesso!');
      setFormPessoa({
        cpf: '', nomeCompleto: '', dataNascimento: '', nomeMae: '', telefone: '',
        logradouro: '', numero: '', complemento: '', bairro: '', cidade: 'Muriaé', uf: 'MG', cep: ''
      });
      reloadData();
    } else alert('Erro ao cadastrar paciente: ' + res.error);
  };

  const handleSaveMedico = async (e) => {
    e.preventDefault();
    if (!formMedico.nome || !formMedico.crm) return alert('Preencha o Nome e o CRM.');
    
    const res = await createMedico(formMedico);
    if (res.success) {
      alert('Médico cadastrado com sucesso!');
      setFormMedico({ nome: '', crm: '', ufCrm: 'MG', especialidade: '', tipo: 'Solicitante' });
      reloadData();
    } else alert('Erro ao cadastrar médico: ' + res.error);
  };

  const handleSaveUbs = async (e) => {
    e.preventDefault();
    if (!formUbs.nome || !formUbs.cnes) return alert('Preencha o Nome e o CNES.');
    
    const res = await createUbs(formUbs);
    if (res.success) {
      alert('UBS cadastrada com sucesso!');
      setFormUbs({ nome: '', cnes: '' });
      reloadData();
    } else alert('Erro ao cadastrar UBS: ' + res.error);
  };

  const handleSaveProcedimento = async (e) => {
    e.preventDefault();
    if (!formProcedimento.nome || !formProcedimento.valor || !formProcedimento.tipoExameId) {
      return alert('Preencha todos os campos do procedimento.');
    }
    
    const res = await createProcedimento(formProcedimento);
    if (res.success) {
      alert('Procedimento cadastrado com sucesso!');
      setFormProcedimento({ nome: '', valor: '', tipoExameId: '' });
      reloadData();
    } else alert('Erro ao cadastrar procedimento: ' + res.error);
  };

  const handleOpenDefineTetoModal = (tipoCota, valorAtual) => {
    setEditCotaModal({ open: true, tipoCota, valor: valorAtual || '' });
  };

  const handleSaveTetoCota = async (e) => {
    e.preventDefault();
    const res = await saveCotaFinanceira({
      tipoCota: editCotaModal.tipoCota,
      mes: finMonth,
      ano: finYear,
      valorTeto: editCotaModal.valor
    });

    if (res.success) {
      alert(`Teto da cota ${editCotaModal.tipoCota} atualizado!`);
      setEditCotaModal({ open: false, tipoCota: '', valor: '' });
      reloadData();
    } else alert('Erro ao salvar teto: ' + res.error);
  };

  const calculateMonthQuotaDetails = (quotaType, year, monthValue) => {
    const record = cotasFinanceiras.find(c => c.tipoCota === quotaType && c.mes === monthValue && c.ano === year);
    const totalLimit = record ? record.valorTeto : 0;
    
    const totalUsed = requests
      .filter(r => 
        r.status === 'Liberado' && 
        r.quota === quotaType && 
        r.quotaCompetenceMonth === monthValue && 
        r.quotaCompetenceYear === year
      )
      .reduce((sum, r) => sum + r.estimatedCost, 0);

    return { totalLimit, totalUsed, available: totalLimit - totalUsed };
  };

  const handleUpdateBillingDate = async (id, newDate) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, billingDate: newDate } : req));
    await updateBillingDate(id, newDate);
  };

  const handlePatientSearchChange = async (e) => {
    const value = e.target.value;
    isSelectedRef.current = false;
    setNewRequest(prev => ({ ...prev, patientSearch: value }));

    if (value.trim().length >= 2) {
      setIsSearchingPatient(true);
      const suggestions = await searchPessoasAutocomplete(value);
      setPatientSuggestions(suggestions || []);
      if (!isSelectedRef.current) setShowSuggestions(true);
      setIsSearchingPatient(false);
    } else {
      setPatientSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPatientSuggestion = (pessoa) => {
    isSelectedRef.current = true;
    setShowSuggestions(false);
    setPatientSuggestions([]);

    setNewRequest(prev => ({
      ...prev,
      patientSearch: pessoa.nomeCompleto,
      patientName: pessoa.nomeCompleto,
      motherName: pessoa.nomeMae || '',
      cpf: pessoa.cpf,
      susCard: ''
    }));
  };

  const handleInputFocus = () => {
    if (isSelectedRef.current) return;
    if (newRequest.patientSearch.length >= 2 && patientSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchPatientManual = async () => {
    if (!newRequest.patientSearch) return;

    const pessoa = await searchPessoa(newRequest.patientSearch.trim());
    if (pessoa) {
      isSelectedRef.current = true;
      setNewRequest(prev => ({ ...prev, patientName: pessoa.nomeCompleto, motherName: pessoa.nomeMae, cpf: pessoa.cpf, susCard: '' }));
      setPatientSuggestions([]);
      setShowSuggestions(false);
    } else alert('Pessoa não encontrada no banco de dados.');
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
    } else setNewRequest(prev => ({ ...prev, procedureId: '', procedureName: '', estimatedCost: 0 }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.patientName || !newRequest.examTypeId || !newRequest.procedureId) {
      alert('Preencha os dados do paciente, tipo de exame e procedimento.');
      return;
    }

    const res = await createPedidoExame(newRequest);
    if (res.success) {
      alert('Pedido registrado com sucesso!');
      reloadData();
      setActiveTab('LISTA_ESPERA');

      isSelectedRef.current = false;
      setNewRequest({
        patientSearch: '', patientName: '', motherName: '', cpf: '', susCard: '',
        examTypeId: '', procedureId: '', procedureName: '', estimatedCost: 0,
        competence: `${new Date().toISOString().slice(5, 7)}/${new Date().getFullYear()}`,
        requestDate: new Date().toISOString().split('T')[0], classification: 'Verde',
        medicoSolicitanteId: '', ubsResponsavelId: '', justification: ''
      });
    } else alert('Erro ao registrar pedido.');
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
      generalObservation: item.generalObservation || '',
      regulatorDoctorId: item.regulatorDoctorId || ''
    });
  };

  const handleReleaseDateChange = (newReleaseDate) => {
    if (!newReleaseDate) return setRegulationForm(prev => ({ ...prev, releaseDate: '' }));
    setRegulationForm(prev => ({
      ...prev, releaseDate: newReleaseDate,
      quotaCompetenceMonth: newReleaseDate.slice(5, 7),
      quotaCompetenceYear: newReleaseDate.slice(0, 4)
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

  const handleSelectMonthFromModal = (monthValue) => {
    setRegulationForm(prev => ({
      ...prev, quota: quotaModalType, quotaCompetenceMonth: monthValue, quotaCompetenceYear: quotaModalYear
    }));
    setShowQuotaModal(false);
  };

  const handleUpdateCommunicationDate = async (id, newDate) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, communicationDate: newDate } : req));
    await updateCommunicationDate(id, newDate);
  };

  const handleConfirmRelease = async (e) => {
    e.preventDefault();
    if (regulationForm.status !== 'Liberado') return alert('Selecione o status "Liberado".');
    if (!regulationForm.quota) return alert('Selecione um Tipo de Cota.');

    const currentDetails = calculateMonthQuotaDetails(
      regulationForm.quota, 
      regulationForm.quotaCompetenceYear, 
      regulationForm.quotaCompetenceMonth
    );

    if (releasingItem.estimatedCost > currentDetails.available) {
      const confirmExceed = confirm(`Atenção: O valor do exame (R$ ${releasingItem.estimatedCost.toFixed(2)}) excede o saldo da cota ${regulationForm.quota}. Deseja confirmar mesmo assim?`);
      if (!confirmExceed) return;
    }

    const res = await releasePaciente(releasingItem.id, regulationForm);
    if (res.success) {
      alert(`Paciente ${releasingItem.patientName} liberado com sucesso!`);
      reloadData();
      setReleasingItem(null);
    } else alert('Erro ao atualizar a liberação.');
  };

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));
  const clearFilters = () => setFilters({
    search: '', procedure: '', status: '', classification: '', communicationStatus: '', quotaType: '',
    entryDateStart: '', entryDateEnd: '', communicationDateStart: '', communicationDateEnd: '',
    releaseDateStart: '', releaseDateEnd: '', billingDateStart: '', billingDateEnd: ''
  });

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

      const dateToCompare = item.requestDateRaw || item.requestDate;
      if (filters.entryDateStart && dateToCompare < filters.entryDateStart) return false;
      if (filters.entryDateEnd && dateToCompare > filters.entryDateEnd) return false;

      if (filters.communicationDateStart && item.communicationDate < filters.communicationDateStart) return false;
      if (filters.communicationDateEnd && item.communicationDate > filters.communicationDateEnd) return false;

      const releaseToCompare = item.releaseDateRaw || item.releaseDate;
      if (filters.releaseDateStart && releaseToCompare < filters.releaseDateStart) return false;
      if (filters.releaseDateEnd && releaseToCompare > filters.releaseDateEnd) return false;

      if (filters.billingDateStart && item.billingDate < filters.billingDateStart) return false;
      if (filters.billingDateEnd && item.billingDate > filters.billingDateEnd) return false;

      return true;
    });
  };

  const availableProcedures = auxData.procedimentos.filter(p => String(p.tipoExameId) === String(newRequest.examTypeId));
  const allProceduresList = auxData.procedimentos.map(p => p.nome);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Módulo de Regulação de Exames</h1>
          <p>Gerenciamento de solicitações, filas, liberações e custos</p>
        </div>

        <div className={styles.tabNav}>
          <button className={`${styles.tabBtn} ${activeTab === 'NOVO_PEDIDO' ? styles.activeTab : ''}`} onClick={() => setActiveTab('NOVO_PEDIDO')}>+ Novo Pedido</button>
          <button className={`${styles.tabBtn} ${activeTab === 'LISTA_ESPERA' ? styles.activeTab : ''}`} onClick={() => setActiveTab('LISTA_ESPERA')}>Lista de Espera ({requests.filter(i => i.status === 'Aguardando').length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'LIBERADOS' ? styles.activeTab : ''}`} onClick={() => setActiveTab('LIBERADOS')}>Liberados ({requests.filter(i => i.status === 'Liberado').length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'FINANCEIRO' ? styles.activeTab : ''}`} onClick={() => setActiveTab('FINANCEIRO')}>📊 Financeiro</button>
          <button className={`${styles.tabBtn} ${activeTab === 'CADASTROS' ? styles.activeTab : ''}`} onClick={() => setActiveTab('CADASTROS')}>⚙ Cadastros</button>
        </div>
      </header>

      {/* COMPONENTE DE FILTROS AVANÇADOS */}
      {(activeTab === 'LISTA_ESPERA' || activeTab === 'LIBERADOS') && (
        <FiltersBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          allProceduresList={allProceduresList}
          styles={styles}
        />
      )}

      {/* COMPONENTES DE ABAS */}
      {activeTab === 'NOVO_PEDIDO' && (
        <TabNovoPedido
          newRequest={newRequest}
          setNewRequest={setNewRequest}
          handleCreateRequest={handleCreateRequest}
          auxData={auxData}
          availableProcedures={availableProcedures}
          patientSuggestions={patientSuggestions}
          showSuggestions={showSuggestions}
          isSearchingPatient={isSearchingPatient}
          autocompleteRef={autocompleteRef}
          handlePatientSearchChange={handlePatientSearchChange}
          handleInputFocus={handleInputFocus}
          handleSearchPatientManual={handleSearchPatientManual}
          handleSelectPatientSuggestion={handleSelectPatientSuggestion}
          handleExamTypeChange={handleExamTypeChange}
          handleProcedureChange={handleProcedureChange}
          styles={styles}
        />
      )}

      {activeTab === 'LISTA_ESPERA' && (
        <TabListaEspera
          auxData={auxData}
          requests={requests}
          selectedQueueExam={selectedQueueExam}
          setSelectedQueueExam={setSelectedQueueExam}
          selectedIds={selectedIds}
          handleSelectAllQueue={(e) => {
            const visibleItems = applyFilters(requests.filter(r => r.examType === selectedQueueExam && r.status === 'Aguardando'));
            if (e.target.checked) setSelectedIds(Array.from(new Set([...selectedIds, ...visibleItems.map(i => i.id)])));
            else {
              const visibleSet = new Set(visibleItems.map(i => i.id));
              setSelectedIds(selectedIds.filter(id => !visibleSet.has(id)));
            }
          }}
          handleSelectOneQueue={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])}
          handleExportToExcelQueue={() => {
            if (selectedIds.length === 0) return alert('Selecione pelo menos um paciente.');
            const selectedItems = requests.filter(r => selectedIds.includes(r.id));
            const exportData = selectedItems.map(item => ({
              'Código Regulação': item.id, 'Data de Entrada': item.requestDate, 'Data de Comunicação': item.communicationDate || 'Não informada',
              'Nome do Paciente': item.patientName, 'CPF': item.cpf, 'Cartão SUS': item.susCard || 'Não informado',
              'Nome da Mãe': item.motherName || 'Não informada', 'Tipo de Exame': item.examType, 'Procedimento': item.procedure,
              'Classificação de Risco': item.classification, 'Médico Solicitante': item.requestDoctor || 'Não informado',
              'UBS Solicitante': item.requestUbs || 'Não informada', 'Justificativa Clínica': item.justification || '', 'Status': item.status
            }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Fila de Espera');
            XLSX.writeFile(workbook, `Fila_Espera_${selectedQueueExam.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
          }}
          applyFilters={applyFilters}
          handleUpdateCommunicationDate={handleUpdateCommunicationDate}
          handleOpenReleaseModal={handleOpenReleaseModal}
          handleDeleteOrder={handleDeleteOrder}
          loading={loading}
          styles={styles}
        />
      )}

      {activeTab === 'LIBERADOS' && (
        <TabLiberados
          auxData={auxData}
          requests={requests}
          selectedReleasedExam={selectedReleasedExam}
          setSelectedReleasedExam={setSelectedReleasedExam}
          selectedReleasedIds={selectedReleasedIds}
          handleSelectAllReleased={(e) => {
            const visibleItems = applyFilters(requests.filter(r => r.examType === selectedReleasedExam), 'Liberado');
            if (e.target.checked) setSelectedReleasedIds(Array.from(new Set([...selectedReleasedIds, ...visibleItems.map(i => i.id)])));
            else {
              const visibleSet = new Set(visibleItems.map(i => i.id));
              setSelectedReleasedIds(selectedReleasedIds.filter(id => !visibleSet.has(id)));
            }
          }}
          handleSelectOneReleased={(id) => setSelectedReleasedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])}
          handleExportToExcelReleased={() => {
            if (selectedReleasedIds.length === 0) return alert('Selecione pelo menos um paciente liberado.');
            const selectedItems = requests.filter(r => selectedReleasedIds.includes(r.id));
            const exportData = selectedItems.map(item => ({
              'Código Regulação': item.id, 'Nome do Paciente': item.patientName, 'CPF': item.cpf,
              'Cartão SUS': item.susCard || 'Não informado', 'Tipo de Exame': item.examType, 'Procedimento': item.procedure,
              'Data da Liberação': item.releaseDate || 'Não informada', 'Tipo de Cota': item.quota || 'N/A',
              'Competência Cota': item.quotaCompetenceMonth && item.quotaCompetenceYear ? `${item.quotaCompetenceMonth}/${item.quotaCompetenceYear}` : 'N/A',
              'Data Faturado': item.billingDate || 'Não informada', 'Médico Regulador': item.regulatorDoctor || 'Não informado',
              'Médico Solicitante': item.requestDoctor || 'Não informado', 'UBS Solicitante': item.requestUbs || 'Não informada',
              'Valor do Exame (R$)': item.estimatedCost ? item.estimatedCost.toFixed(2) : '0.00'
            }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Exames Liberados');
            XLSX.writeFile(workbook, `Liberados_${selectedReleasedExam.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
          }}
          applyFilters={applyFilters}
          handleUpdateBillingDate={handleUpdateBillingDate}
          setEditingItem={setEditingItem}
          loading={loading}
          styles={styles}
        />
      )}

      {activeTab === 'FINANCEIRO' && (
        <TabFinanceiro
          finMonth={finMonth}
          setFinMonth={setFinMonth}
          finYear={finYear}
          setFinYear={setFinYear}
          MONTHS_LIST={MONTHS_LIST}
          calculateMonthQuotaDetails={calculateMonthQuotaDetails}
          handleOpenDefineTetoModal={handleOpenDefineTetoModal}
          styles={styles}
        />
      )}

      {activeTab === 'CADASTROS' && (
        <TabCadastros
          cadSubTab={cadSubTab}
          setCadSubTab={setCadSubTab}
          formPessoa={formPessoa}
          setFormPessoa={setFormPessoa}
          handleSavePessoa={handleSavePessoa}
          formMedico={formMedico}
          setFormMedico={setFormMedico}
          handleSaveMedico={handleSaveMedico}
          formUbs={formUbs}
          setFormUbs={setFormUbs}
          handleSaveUbs={handleSaveUbs}
          formProcedimento={formProcedimento}
          setFormProcedimento={setFormProcedimento}
          handleSaveProcedimento={handleSaveProcedimento}
          auxData={auxData}
          styles={styles}
        />
      )}

      {/* COMPONENTES DE MODAIS */}
      <ModalTetoFinanceiro
        editCotaModal={editCotaModal}
        setEditCotaModal={setEditCotaModal}
        handleSaveTetoCota={handleSaveTetoCota}
        finMonth={finMonth}
        finYear={finYear}
        styles={styles}
      />

      <ModalLiberacao
        releasingItem={releasingItem}
        setReleasingItem={setReleasingItem}
        regulationForm={regulationForm}
        setRegulationForm={setRegulationForm}
        handleReleaseDateChange={handleReleaseDateChange}
        handleSelectQuotaType={handleSelectQuotaType}
        handleConfirmRelease={handleConfirmRelease}
        setShowQuotaModal={setShowQuotaModal}
        setQuotaModalType={setQuotaModalType}
        setQuotaModalYear={setQuotaModalYear}
        auxData={auxData}
        styles={styles}
      />

      <ModalEdicaoPedido
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        handleEditStatusChange={handleEditStatusChange}
        handleSaveEditedOrder={handleSaveEditedOrder}
        auxData={auxData}
        styles={styles}
      />

      <ModalSeletorCotas
        showQuotaModal={showQuotaModal}
        setShowQuotaModal={setShowQuotaModal}
        quotaModalType={quotaModalType}
        setQuotaModalType={setQuotaModalType}
        quotaModalYear={quotaModalYear}
        setQuotaModalYear={setQuotaModalYear}
        MONTHS_LIST={MONTHS_LIST}
        calculateMonthQuotaDetails={calculateMonthQuotaDetails}
        regulationForm={regulationForm}
        releasingItem={releasingItem}
        handleSelectMonthFromModal={handleSelectMonthFromModal}
        styles={styles}
      />
    </div>
  );
}