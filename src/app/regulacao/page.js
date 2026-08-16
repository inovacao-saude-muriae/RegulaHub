"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Custom Hooks
import { useRegulacaoData } from "./hooks/useRegulacaoData";
import { useRegulacaoFilters } from "./hooks/useRegulacaoFilters";

// Componentes
import FiltersBar from "./components/FiltersBar";
import TabDashboard from "./components/Dashboard"; // Módulo do Dashboard
import TabNovoPedido from "./components/TabNovoPedido";
import TabListaEspera from "./components/TabListaEspera";
import TabLiberados from "./components/TabLiberados";
import TabFinanceiro from "./components/TabFinanceiro";
import TabCadastros from "./components/TabCadastros";
import TelaLiberarPedido from "./components/LiberarPedido";
import TelaEditarPedido from "./components/EditarPedido";

// Modais
import ModalTetoFinanceiro from "./components/Modals/ModalTetoFinanceiro";
import ModalSeletorCotas from "./components/Modals/ModalSeletorCotas";

import styles from "./page.module.css";

export default function RegulacaoPage() {
  // 1. Persiste a aba ativa no sessionStorage para que no F5 não volte obrigatoriamente pro DASHBOARD
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("activeTab") || "DASHBOARD";
    }
    return "DASHBOARD";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  const data = useRegulacaoData(setActiveTab);
  const { filters, handleFilterChange, clearFilters, applyFilters } = useRegulacaoFilters();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Procedimentos disponíveis para o formulário de NOVO PEDIDO
  const availableProcedures = data.auxData.procedimentos.filter(
    (p) => String(p.tipoExameId) === String(data.newRequest.examTypeId)
  );

  // ── LÓGICA DE CORREÇÃO DO FILTRO DE PROCEDIMENTOS ──
  // Identifica o nome do exame ativo baseado na aba que o usuário está visualizando
  const activeExamName =
    activeTab === "LISTA_ESPERA"
      ? data.selectedQueueExam
      : activeTab === "LIBERADOS"
      ? data.selectedReleasedExam
      : "";

  // Busca o objeto do tipo de exame correspondente ao botão ativo (Tomografia, Ressonância, etc)
  const activeExamObj = data.auxData.tiposExame.find(
    (t) =>
      t.nome?.toLowerCase() === activeExamName?.toLowerCase() ||
      String(t.id) === String(activeExamName)
  );

  // Filtra a lista enviada ao FiltersBar para conter APENAS procedimentos do exame da aba ativa
  const allProceduresList = data.auxData.procedimentos
    .filter((p) => {
      if (!activeExamObj) return true; // Se não houver exame selecionado, exibe todos
      return String(p.tipoExameId) === String(activeExamObj.id);
    })
    .map((p) => p.nome);

  return (
    <div className={styles.container}>
      {/* CABEÇALHO */}
      <header className={styles.header}>
        <div>
          <h1>Módulo de Regulação de Exames</h1>
          <p>Gerenciamento de solicitações, filas, liberações e custos</p>
        </div>

        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === "DASHBOARD" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("DASHBOARD")}
          >
            📊 Dashboard
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "NOVO_PEDIDO" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("NOVO_PEDIDO")}
          >
            Novo Pedido
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "LISTA_ESPERA" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("LISTA_ESPERA")}
          >
            Lista de Espera
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "LIBERADOS" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("LIBERADOS")}
          >
            Liberados
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "FINANCEIRO" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("FINANCEIRO")}
          >
            💰 Financeiro
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "CADASTROS" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("CADASTROS")}
          >
            ⚙ Cadastros
          </button>
        </div>
      </header>

      {/* FILTROS AVANÇADOS */}
      {(activeTab === "LISTA_ESPERA" || activeTab === "LIBERADOS") && (
        <FiltersBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          allProceduresList={allProceduresList}
        />
      )}

      {/* RENDERIZAÇÃO DAS ABAS */}
      {activeTab === "DASHBOARD" && (
        <TabDashboard
          requests={data.requests}
          auxData={data.auxData}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === "NOVO_PEDIDO" && (
        <TabNovoPedido
          newRequest={data.newRequest}
          setNewRequest={data.setNewRequest}
          handleCreateRequest={data.handleCreateRequest}
          auxData={data.auxData}
          availableProcedures={availableProcedures}
          patientSuggestions={data.patientSuggestions}
          showSuggestions={data.showSuggestions}
          isSearchingPatient={data.isSearchingPatient}
          autocompleteRef={data.autocompleteRef}
          handlePatientSearchChange={data.handlePatientSearchChange}
          handleInputFocus={data.handleInputFocus}
          handleSearchPatientManual={data.handleSearchPatientManual}
          handleSelectPatientSuggestion={data.handleSelectPatientSuggestion}
          handleExamTypeChange={data.handleExamTypeChange}
          handleProcedureChange={data.handleProcedureChange}
        />
      )}

      {activeTab === "LISTA_ESPERA" && (
        <TabListaEspera
          auxData={data.auxData}
          requests={data.requests}
          selectedQueueExam={data.selectedQueueExam}
          setSelectedQueueExam={data.setSelectedQueueExam}
          applyFilters={applyFilters}
          handleUpdateCommunicationDate={data.handleUpdateCommunicationDate}
          handleOpenReleaseModal={data.handleOpenReleaseModal}
          handleEditOrder={data.handleEditOrder}
          reloadData={data.reloadData}
          loading={data.loading}
        />
      )}

      {/* TELA CHEIA: EDIÇÃO DE PEDIDO */}
      {activeTab === "EDITAR_PEDIDO" && (
        <TelaEditarPedido
          editingItem={data.editingItem}
          setEditingItem={data.setEditingItem}
          auxData={data.auxData}
          handleEditStatusChange={data.handleEditStatusChange}
          handleSaveEditedOrder={data.handleSaveEditedOrder}
          onBack={() => {
            data.setEditingItem(null);
            setActiveTab("LISTA_ESPERA");
          }}
          styles={styles}
        />
      )}

      {/* TELA CHEIA: LIBERAÇÃO DE PACIENTE */}
      {activeTab === "LIBERAR_PEDIDO" && (
        <TelaLiberarPedido
          releasingItem={data.releasingItem}
          regulationForm={data.regulationForm}
          setRegulationForm={data.setRegulationForm}
          auxData={data.auxData}
          handleSelectQuotaType={data.handleSelectQuotaType}
          handleReleaseDateChange={data.handleReleaseDateChange}
          handleConfirmRelease={data.handleConfirmRelease}
          onBack={() => {
            data.setReleasingItem(null);
            setActiveTab("LISTA_ESPERA");
          }}
          showQuotaModal={data.showQuotaModal}
          setShowQuotaModal={data.setShowQuotaModal}
          quotaModalType={data.quotaModalType}
          quotaModalYear={data.quotaModalYear}
          setQuotaModalYear={data.setQuotaModalYear}
          handleSelectMonthFromModal={data.handleSelectMonthFromModal}
          calculateMonthQuotaDetails={data.calculateMonthQuotaDetails}
          styles={styles}
        />
      )}

      {activeTab === "LIBERADOS" && (
        <TabLiberados
          auxData={data.auxData}
          requests={data.requests}
          selectedReleasedExam={data.selectedReleasedExam}
          setSelectedReleasedExam={data.setSelectedReleasedExam}
          applyFilters={applyFilters}
          handleUpdateBillingDate={data.handleUpdateBillingDate}
          handleEditOrder={data.handleEditOrder}
          loading={data.loading}
          handleExportToExcelReleased={(selectedIds) => {
            if (!selectedIds || selectedIds.length === 0)
              return alert("Selecione pelo menos um paciente liberado.");
            const selectedItems = data.requests.filter((r) => selectedIds.includes(r.id));
            const exportData = selectedItems.map((item) => ({
              "Código Regulação": item.id,
              "Nome do Paciente": item.patientName,
              CPF: item.cpf,
              "Cartão SUS": item.susCard || "Não informado",
              "Tipo de Exame": item.examType,
              Procedimento: item.procedure,
              "Data da Liberação": item.releaseDate || "Não informada",
              "Tipo de Cota": item.quota || "N/A",
              "Competência Cota":
                item.quotaCompetenceMonth && item.quotaCompetenceYear
                  ? `${item.quotaCompetenceMonth}/${item.quotaCompetenceYear}`
                  : "N/A",
              "Data Faturado": item.billingDate || "Não informada",
              "Médico Regulador": item.regulatorDoctor || "Não informado",
              "Médico Solicitante": item.requestDoctor || "Não informado",
              "UBS Solicitante": item.requestUbs || "Não informada",
              "Valor do Exame (R$)": item.estimatedCost ? item.estimatedCost.toFixed(2) : "0.00",
            }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Exames Liberados");
            XLSX.writeFile(
              workbook,
              `Liberados_${data.selectedReleasedExam.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
            );
          }}
        />
      )}

      {activeTab === "FINANCEIRO" && (
        <TabFinanceiro
          finMonth={data.finMonth}
          setFinMonth={data.setFinMonth}
          finYear={data.finYear}
          setFinYear={data.setFinYear}
          calculateMonthQuotaDetails={data.calculateMonthQuotaDetails}
          handleOpenDefineTetoModal={data.handleOpenDefineTetoModal}
        />
      )}

      {activeTab === "CADASTROS" && (
        <TabCadastros
          cadSubTab={data.cadSubTab}
          setCadSubTab={data.setCadSubTab}
          formPessoa={data.formPessoa}
          setFormPessoa={data.setFormPessoa}
          formMedico={data.formMedico}
          setFormMedico={data.setFormMedico}
          formUbs={data.formUbs}
          setFormUbs={data.setFormUbs}
          formProcedimento={data.formProcedimento}
          setFormProcedimento={data.setFormProcedimento}
          auxData={data.auxData}
          reloadData={data.reloadData}
        />
      )}

      {/* MODAIS */}
      <ModalTetoFinanceiro
        editCotaModal={data.editCotaModal}
        setEditCotaModal={data.setEditCotaModal}
        handleSaveTetoCota={data.handleSaveTetoCota}
        finMonth={data.finMonth}
        finYear={data.finYear}
        styles={styles}
      />

      <ModalSeletorCotas
        open={data.showQuotaModal}
        onClose={() => data.setShowQuotaModal(false)}
        tipoCota={data.quotaModalType}
        anoAtual={data.quotaModalYear}
        setAnoAtual={data.setQuotaModalYear}
        onSelectMonth={data.handleSelectMonthFromModal}
        calculateMonthQuotaDetails={data.calculateMonthQuotaDetails}
        defaultMonth={data.regulationForm.quotaCompetenceMonth}
        styles={styles}
      />
    </div>
  );
}