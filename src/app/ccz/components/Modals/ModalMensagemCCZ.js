"use client";

import styles from "./ModalMensagemCCZ.module.css";

const icons = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

export default function ModalMensagemCCZ({ config, onClose }) {
  if (!config) return null;
  const type = config.type || "info";

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ccz-message-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`${styles.iconWrap} ${styles[type]}`}>
          {icons[type]}
        </div>
        <h3 id="ccz-message-title" className={styles.title}>
          {config.title}
        </h3>
        <p className={styles.message}>{config.message}</p>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          autoFocus
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
