"use client";

import styles from "./ModalConfirmacaoCCZ.module.css";

export default function ModalConfirmacaoCCZ({ config, onConfirm, onCancel }) {
  if (!config) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>🗑️</div>
        <h3 className={styles.title}>Confirmar Exclusão</h3>
        <p className={styles.description}>
          Você está prestes a excluir permanentemente o seguinte registro:
        </p>
        <div className={styles.itemCard}>
          <p className={styles.itemName}>{config.nome}</p>
          {config.detalhe && <p className={styles.itemDetalhe}>{config.detalhe}</p>}
        </div>
        <p className={styles.warning}>
          ⚠️ Esta ação <strong>não pode ser desfeita</strong>.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            🗑️ Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
