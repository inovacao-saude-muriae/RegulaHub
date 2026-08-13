'use client';

import styles from './ModalTetoFinanceiro.module.css';

export default function ModalTetoFinanceiro({
  editCotaModal,
  setEditCotaModal,
  handleSaveTetoCota,
  finMonth,
  finYear
}) {
  if (!editCotaModal.open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContentLarge} ${styles.modalSmallWidth}`}>
        <div className={styles.modalHeader}>
          <h3>Definir Teto - Cota {editCotaModal.tipoCota}</h3>
          <button 
            type="button"
            onClick={() => setEditCotaModal({ open: false, tipoCota: '', valor: '' })} 
            className={styles.closeBtn}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSaveTetoCota} className={styles.modalFormPadding}>
          <p>
            Competência selecionada: <strong>{finMonth}/{finYear}</strong>
          </p>

          <div className={`${styles.fieldGroup} ${styles.marginTop1}`}>
            <label>Valor do Teto para Gastos (R$) *</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="Ex: 25000.00" 
              value={editCotaModal.valor} 
              onChange={(e) => setEditCotaModal({ ...editCotaModal, valor: e.target.value })}
              required 
            />
          </div>

          <div className={`${styles.modalActions} ${styles.marginTop15}`}>
            <button 
              type="button" 
              onClick={() => setEditCotaModal({ open: false, tipoCota: '', valor: '' })} 
              className={styles.secondaryBtn}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.approveBtn}>
              Salvar Teto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}