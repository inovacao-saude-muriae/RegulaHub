"use client";

import styles from "./ModalConfirmacaoExclusao.module.css";

export default function ModalConfirmacaoExclusao({
  config,
  onConfirm,
  onCancel,
}) {
  if (!config) return null;

  const iconMap = {
    PESSOA: "👤",
    MEDICO: "👨‍⚕️",
    UBS: "🏥",
  };

  const colorMap = {
    PESSOA: styles.tagPaciente,
    MEDICO: styles.tagMedico,
    UBS: styles.tagUbs,
  };

  const labelMap = {
    PESSOA: "Paciente",
    MEDICO: "Médico",
    UBS: "Unidade de Saúde",
  };

  const icon = iconMap[config.tipo] ?? "🗑️";
  const tagClass = colorMap[config.tipo] ?? "";
  const label = labelMap[config.tipo] ?? "Registro";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.itemCard}>
          <span className={`${styles.tag} ${tagClass}`}>
            {icon} {label}
          </span>
          <p className={styles.itemName}>{config.nome}</p>
          {config.detalhe && (
            <p className={styles.itemDetalhe}>{config.detalhe}</p>
          )}
        </div>

        <p className={styles.warning}>
          ⚠️ Esta ação <strong>não pode ser desfeita</strong>.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
          >
            🗑️ Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
