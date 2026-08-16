'use client';

import { useState, useEffect } from 'react';
import styles from './FiltersBar.module.css';

export default function FiltersBar({
  filters,
  handleFilterChange,
  clearFilters,
  showAdvancedFilters,
  setShowAdvancedFilters,
  allProceduresList = []
}) {
  // Estado local para armazenar os filtros temporariamente antes de clicar em "Filtrar"
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  // Sincroniza o rascunho se os filtros externos forem limpos/resetados
  useEffect(() => {
    setDraftFilters({ ...filters });
  }, [filters]);

  const handleDraftChange = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Aplica todos os filtros de uma vez ao clicar em "Filtrar"
  const handleApplyFilters = () => {
    Object.keys(draftFilters).forEach((key) => {
      handleFilterChange(key, draftFilters[key]);
    });
  };

  const handleClear = () => {
    clearFilters();
    setDraftFilters({});
  };

  return (
    <div className={styles.filterCard}>
      {/* BARRA SUPERIOR DE BUSCA E AÇÕES */}
      <div className={styles.filterBarTop}>
        <div className={styles.mainSearchBox}>
          <div className={styles.lupaIconContainer}>
            <img
              src="/img/icon/lupa.png"
              alt="Buscar"
              className={styles.searchIconImg}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <input
            type="text"
            placeholder="Buscar por paciente, mãe, CPF ou Cartão SUS..."
            value={draftFilters.search || draftFilters.searchName || ''}
            onChange={(e) => {
              handleDraftChange('search', e.target.value);
              handleDraftChange('searchName', e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters();
              }
            }}
          />
        </div>

        <div className={styles.filterActionsTop}>
          <button
            type="button"
            className={`${styles.toggleFilterBtn} ${
              showAdvancedFilters ? styles.activeToggle : ''
            }`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
          </button>

          <button
            type="button"
            className={styles.applyFilterBtnHeader}
            onClick={handleApplyFilters}
          >
            Filtrar
          </button>

          <button
            type="button"
            className={styles.clearFilterBtn}
            onClick={handleClear}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* PAINEL EXPANSÍVEL DE FILTROS AVANÇADOS */}
      {showAdvancedFilters && (
        <div className={styles.advancedFiltersWrapper}>
          <div className={styles.filterSection}>
            <span className={styles.sectionTitle}>Filtros Gerais</span>
            <div className={styles.filterGrid}>
              <div className={styles.fieldItem}>
                <label>Procedimento</label>
                <select
                  value={draftFilters.procedure || draftFilters.searchProcedure || ''}
                  onChange={(e) => {
                    handleDraftChange('procedure', e.target.value);
                    handleDraftChange('searchProcedure', e.target.value);
                  }}
                >
                  <option value="">Todos os procedimentos</option>
                  {allProceduresList.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Classificação de Risco</label>
                <select
                  value={draftFilters.classification || ''}
                  onChange={(e) =>
                    handleDraftChange('classification', e.target.value)
                  }
                >
                  <option value="">Todas</option>
                  <option value="Verde">Verde (Eletivo)</option>
                  <option value="Amarelo">Amarelo (Prioritário)</option>
                  <option value="Vermelho">Vermelho (Urgente)</option>
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Tipo de Cota</label>
                <select
                  value={draftFilters.quotaType || ''}
                  onChange={(e) => handleDraftChange('quotaType', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="SUS">SUS</option>
                  <option value="OCI">OCI</option>
                  <option value="PPI">PPI</option>
                  <option value="Credenciamento">Credenciamento</option>
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Data Comunicação</label>
                <select
                  value={draftFilters.communicationStatus || ''}
                  onChange={(e) =>
                    handleDraftChange('communicationStatus', e.target.value)
                  }
                >
                  <option value="">Todos</option>
                  <option value="FILLED">Comunicação Preenchida</option>
                  <option value="EMPTY">Comunicação Não Preenchida</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.filterSection}>
            <span className={styles.sectionTitle}>Filtros por Período / Datas</span>
            <div className={styles.filterGridDates}>
              <div className={styles.fieldItem}>
                <label>Período Entrada</label>
                <div className={styles.dateRangeBox}>
                  <input
                    type="date"
                    value={draftFilters.entryDateStart || draftFilters.startDate || ''}
                    onChange={(e) => {
                      handleDraftChange('entryDateStart', e.target.value);
                      handleDraftChange('startDate', e.target.value);
                    }}
                  />
                  <span>até</span>
                  <input
                    type="date"
                    value={draftFilters.entryDateEnd || draftFilters.endDate || ''}
                    onChange={(e) => {
                      handleDraftChange('entryDateEnd', e.target.value);
                      handleDraftChange('endDate', e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Período Comunicação</label>
                <div className={styles.dateRangeBox}>
                  <input
                    type="date"
                    value={draftFilters.communicationDateStart || ''}
                    onChange={(e) =>
                      handleDraftChange('communicationDateStart', e.target.value)
                    }
                  />
                  <span>até</span>
                  <input
                    type="date"
                    value={draftFilters.communicationDateEnd || ''}
                    onChange={(e) =>
                      handleDraftChange('communicationDateEnd', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Período Liberação</label>
                <div className={styles.dateRangeBox}>
                  <input
                    type="date"
                    value={draftFilters.releaseDateStart || ''}
                    onChange={(e) =>
                      handleDraftChange('releaseDateStart', e.target.value)
                    }
                  />
                  <span>até</span>
                  <input
                    type="date"
                    value={draftFilters.releaseDateEnd || ''}
                    onChange={(e) =>
                      handleDraftChange('releaseDateEnd', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Período Faturamento</label>
                <div className={styles.dateRangeBox}>
                  <input
                    type="date"
                    value={draftFilters.billingDateStart || ''}
                    onChange={(e) =>
                      handleDraftChange('billingDateStart', e.target.value)
                    }
                  />
                  <span>até</span>
                  <input
                    type="date"
                    value={draftFilters.billingDateEnd || ''}
                    onChange={(e) =>
                      handleDraftChange('billingDateEnd', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO FILTRAR SEM ÍCONE NO RODAPÉ */}
          <div className={styles.bottomFilterActions}>
            <button
              type="button"
              className={styles.applyFilterBtn}
              onClick={handleApplyFilters}
            >
              Filtrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}