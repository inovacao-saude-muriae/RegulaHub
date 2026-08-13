'use client';

import styles from './FiltersBar.module.css';

export default function FiltersBar({
  filters,
  handleFilterChange,
  clearFilters,
  showAdvancedFilters,
  setShowAdvancedFilters,
  allProceduresList
}) {
  return (
    <div className={styles.filterCard}>
      <div className={styles.filterBarTop}>
        <div className={styles.mainSearchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por paciente, mãe, CPF ou Cartão SUS..." 
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
            🔍 {showAdvancedFilters ? 'Ocultar Filtros Avançados' : 'Filtros Avançados'}
          </button>
          
          <button 
            type="button"
            className={styles.clearFilterBtn} 
            onClick={clearFilters}
          >
            Limpar
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className={styles.advancedFiltersWrapper}>
          <div className={styles.filterSection}>
            <span className={styles.sectionTitle}>Filtros Gerais</span>
            <div className={styles.filterRow}>
              <div className={styles.fieldItem}>
                <label>Procedimento</label>
                <select value={filters.procedure} onChange={(e) => handleFilterChange('procedure', e.target.value)}>
                  <option value="">Todos</option>
                  {allProceduresList.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Classificação de Risco</label>
                <select value={filters.classification} onChange={(e) => handleFilterChange('classification', e.target.value)}>
                  <option value="">Todas</option>
                  <option value="Verde">Verde (Eletivo)</option>
                  <option value="Amarelo">Amarelo (Prioritário)</option>
                  <option value="Vermelho">Vermelho (Urgente)</option>
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Tipo de Cota</label>
                <select value={filters.quotaType} onChange={(e) => handleFilterChange('quotaType', e.target.value)}>
                  <option value="">Todas</option>
                  <option value="SUS">SUS</option>
                  <option value="OCI">OCI</option>
                  <option value="Credenciamento">Credenciamento</option>
                </select>
              </div>

              <div className={styles.fieldItem}>
                <label>Status da Comunicação</label>
                <select value={filters.communicationStatus} onChange={(e) => handleFilterChange('communicationStatus', e.target.value)}>
                  <option value="">Todos</option>
                  <option value="FILLED">Comunicação Preenchida</option>
                  <option value="EMPTY">Comunicação Não Preenchida</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.filterSection}>
            <span className={styles.sectionTitle}>Filtros por Período / Datas</span>
            <div className={styles.filterRow}>
              <div className={styles.fieldItem}>
                <label>Data de Entrada</label>
                <div className={styles.dateRangeBox}>
                  <input type="date" value={filters.entryDateStart} onChange={(e) => handleFilterChange('entryDateStart', e.target.value)} />
                  <span>até</span>
                  <input type="date" value={filters.entryDateEnd} onChange={(e) => handleFilterChange('entryDateEnd', e.target.value)} />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Data de Comunicação</label>
                <div className={styles.dateRangeBox}>
                  <input type="date" value={filters.communicationDateStart} onChange={(e) => handleFilterChange('communicationDateStart', e.target.value)} />
                  <span>até</span>
                  <input type="date" value={filters.communicationDateEnd} onChange={(e) => handleFilterChange('communicationDateEnd', e.target.value)} />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Data de Liberação</label>
                <div className={styles.dateRangeBox}>
                  <input type="date" value={filters.releaseDateStart} onChange={(e) => handleFilterChange('releaseDateStart', e.target.value)} />
                  <span>até</span>
                  <input type="date" value={filters.releaseDateEnd} onChange={(e) => handleFilterChange('releaseDateEnd', e.target.value)} />
                </div>
              </div>

              <div className={styles.fieldItem}>
                <label>Data Faturado</label>
                <div className={styles.dateRangeBox}>
                  <input type="date" value={filters.billingDateStart} onChange={(e) => handleFilterChange('billingDateStart', e.target.value)} />
                  <span>até</span>
                  <input type="date" value={filters.billingDateEnd} onChange={(e) => handleFilterChange('billingDateEnd', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}