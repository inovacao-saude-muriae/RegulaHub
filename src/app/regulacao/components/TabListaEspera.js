'use client';

import styles from './TabListaEspera.module.css';

export default function TabListaEspera({
  auxData,
  requests,
  selectedQueueExam,
  setSelectedQueueExam,
  selectedIds,
  handleSelectAllQueue,
  handleSelectOneQueue,
  handleExportToExcelQueue,
  applyFilters,
  handleUpdateCommunicationDate,
  handleOpenReleaseModal,
  handleDeleteOrder,
  loading
}) {
  const visibleQueueItems = applyFilters(
    requests.filter(r => r.examType === selectedQueueExam && r.status === 'Aguardando')
  );

  const isAllVisibleQueueSelected = 
    visibleQueueItems.length > 0 && 
    visibleQueueItems.every(i => selectedIds.includes(i.id));

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className={styles.examQueueNav} style={{ marginBottom: 0, borderBottom: 'none' }}>
          {auxData.tiposExame.map((exam) => {
            const count = requests.filter(i => (i.examType === exam.nome || String(i.examTypeId) === String(exam.id)) && i.status === 'Aguardando').length;
            return (
              <button 
                type="button"
                key={exam.id} 
                className={`${styles.examQueueBtn} ${selectedQueueExam === exam.nome ? styles.activeExamQueue : ''}`} 
                onClick={() => setSelectedQueueExam(exam.nome)}
              >
                Fila de {exam.nome} <span className={styles.badgeCount}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Selecionados: <strong>{selectedIds.length}</strong>
          </span>
          <button 
            type="button"
            onClick={handleExportToExcelQueue}
            className={styles.secondaryBtn}
            style={{ backgroundColor: '#107c41', color: '#ffffff', borderColor: '#107c41' }}
          >
            📊 Exportar Excel (.xlsx)
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>Carregando fila de espera do banco de dados...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllVisibleQueueSelected}
                    onChange={handleSelectAllQueue}
                    title="Selecionar todos visíveis"
                  />
                </th>
                <th>Data Entrada</th>
                <th>Data Comunicação (Editável)</th>
                <th>Paciente / Mãe / Classificação</th>
                <th>Procedimento</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {visibleQueueItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr key={item.id} style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOneQueue(item.id)}
                      />
                    </td>
                    <td className={styles.dateCell}>{item.requestDate}</td>
                    <td className={styles.editDateCell}>
                      <input 
                        type="date" 
                        value={item.communicationDate || ''} 
                        onChange={(e) => handleUpdateCommunicationDate(item.id, e.target.value)} 
                        className={styles.inlineDateInput} 
                      />
                    </td>
                    <td>
                      <div className={styles.patientBlock}>
                        <div className={styles.patientNameHeader}>
                          <strong>{item.patientName}</strong>
                          <span className={`${styles.classBadge} ${styles[item.classification.toLowerCase()]}`}>{item.classification}</span>
                        </div>
                        <small className={styles.motherText}>Mãe: {item.motherName || 'Não informada'}</small>
                      </div>
                    </td>
                    <td><strong>{item.procedure}</strong></td>
                    <td><span className={`${styles.statusBadge} ${styles[item.status.toLowerCase()]}`}>{item.status}</span></td>
                    <td>
                      <div className={styles.actionButtonGroup}>
                        <button className={styles.releaseBtn} onClick={() => handleOpenReleaseModal(item)}>
                          Liberar Paciente
                        </button>
                        <button type="button" onClick={() => handleDeleteOrder(item)} className={styles.deleteBtn}>
                          🗑 Excluir
                        </button>
                      </div>
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