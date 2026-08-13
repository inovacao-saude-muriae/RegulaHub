'use client';

import styles from './TabLiberados.module.css';

export default function TabLiberados({
  auxData,
  requests,
  selectedReleasedExam,
  setSelectedReleasedExam,
  selectedReleasedIds,
  handleSelectAllReleased,
  handleSelectOneReleased,
  handleExportToExcelReleased,
  applyFilters,
  handleUpdateBillingDate,
  setEditingItem,
  loading
}) {
  const visibleReleasedItems = applyFilters(
    requests.filter(r => r.examType === selectedReleasedExam), 
    'Liberado'
  );

  const isAllVisibleReleasedSelected = 
    visibleReleasedItems.length > 0 && 
    visibleReleasedItems.every(i => selectedReleasedIds.includes(i.id));

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className={styles.examQueueNav} style={{ marginBottom: 0, borderBottom: 'none' }}>
          {auxData.tiposExame.map((exam) => {
            const count = requests.filter(i => (i.examType === exam.nome || String(i.examTypeId) === String(exam.id)) && i.status === 'Liberado').length;
            return (
              <button 
                type="button"
                key={exam.id} 
                className={`${styles.examQueueBtn} ${selectedReleasedExam === exam.nome ? styles.activeExamQueue : ''}`} 
                onClick={() => setSelectedReleasedExam(exam.nome)}
              >
                Liberados de {exam.nome} <span className={styles.badgeCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* BARRA DE EXPORTAÇÃO DE LIBERADOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Selecionados: <strong>{selectedReleasedIds.length}</strong>
          </span>
          <button 
            type="button"
            onClick={handleExportToExcelReleased}
            className={styles.secondaryBtn}
            style={{ backgroundColor: '#107c41', color: '#ffffff', borderColor: '#107c41' }}
          >
            📊 Exportar Excel (.xlsx)
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>Carregando histórico do banco de dados...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllVisibleReleasedSelected}
                    onChange={handleSelectAllReleased}
                    title="Selecionar todos visíveis"
                  />
                </th>
                <th>PACIENTE</th>
                <th>PROCEDIMENTO</th>
                <th>DATA DA LIBERAÇÃO</th>
                <th>COTA</th>
                <th>DATA FATURADO</th>
                <th>COMPETÊNCIA</th>
                <th>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {visibleReleasedItems.map((item) => {
                const isSelected = selectedReleasedIds.includes(item.id);

                return (
                  <tr key={item.id} style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOneReleased(item.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.patientBlock}>
                        <strong>{item.patientName}</strong>
                        <small className={styles.motherText}>CPF: {item.cpf}</small>
                      </div>
                    </td>

                    <td>
                      <div className={styles.patientInfo}>
                        <strong>[{item.examType}]</strong>
                        <span>{item.procedure}</span>
                      </div>
                    </td>

                    <td className={styles.dateCell}>{item.releaseDate || 'Não informada'}</td>
                    <td><span className={styles.quotaBadge}>{item.quota || 'N/A'}</span></td>

                    <td className={styles.editDateCell}>
                      <input 
                        type="date" 
                        value={item.billingDate || ''} 
                        onChange={(e) => handleUpdateBillingDate(item.id, e.target.value)}
                        className={styles.inlineDateInput}
                      />
                    </td>

                    <td>
                      <span className={styles.competenceBadge}>
                        {item.quotaCompetenceMonth && item.quotaCompetenceYear 
                          ? `${item.quotaCompetenceMonth}/${item.quotaCompetenceYear}` 
                          : 'N/A'}
                      </span>
                    </td>

                    <td>
                      <button 
                        type="button" 
                        onClick={() => setEditingItem({ ...item })} 
                        className={styles.smallActionBtn}
                      >
                        ✏ Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}   