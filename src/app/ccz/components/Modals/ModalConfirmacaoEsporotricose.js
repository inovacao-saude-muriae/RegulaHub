"use client";

import styles from "./ModalConfirmacaoCCZ.module.css";

export default function ModalConfirmacaoEsporotricose({
  config,
  onConfirm,
  onCancel,
  deleting = false,
}) {
  if (!config) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.itemCard}>
          <p className={styles.itemName}>
            {config.protocolo || config.nome || "Vistoria de Esporotricose"}
          </p>
          {config.detalhe && (
            <p className={styles.itemDetalhe}>{config.detalhe}</p>
          )}
        </div>
        <p className={styles.warning}>
          ⚠️ Esta ação <strong>não pode ser desfeita</strong>. O registro de
          vistoria e histórico sanitário serão removidos permanentemente.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "🗑️ Sim, Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
