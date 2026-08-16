"use client";

import { useEffect, useState } from "react";
import styles from "./ModalTetoFinanceiro.module.css";

// Formata para moeda BRL (ex: 2500000 -> "R$ 25.000,00")
const formatCurrencyBRL = (value) => {
  if (value === undefined || value === null || value === "") return "R$ 0,00";
  
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const cleanValue = String(value).replace(/\D/g, "");
  if (!cleanValue) return "R$ 0,00";

  const numberValue = Number(cleanValue) / 100;
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const parseBRLToNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  const cleanValue = String(formattedValue).replace(/\D/g, "");
  return Number(cleanValue) / 100;
};

export default function ModalTetoFinanceiro({
  editCotaModal,
  setEditCotaModal,
  handleSaveTetoCota,
  finMonth,
  finYear,
}) {
  const [displayValue, setDisplayValue] = useState("R$ 0,00");

  useEffect(() => {
    if (editCotaModal && editCotaModal.valor !== undefined) {
      const initialCents = Math.round(Number(editCotaModal.valor) * 100);
      setDisplayValue(formatCurrencyBRL(initialCents));
    }
  }, [editCotaModal]);

  if (!editCotaModal) return null;

  const handleChange = (e) => {
    const rawInput = e.target.value;
    const formatted = formatCurrencyBRL(rawInput);
    setDisplayValue(formatted);

    setEditCotaModal({
      ...editCotaModal,
      valor: parseBRLToNumber(formatted),
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Definir Teto Financeiro ({editCotaModal.tipoCota})</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setEditCotaModal(null)}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.competenceInfo}>
            Competência: <strong>{finMonth}/{finYear}</strong>
          </p>

          <div className={styles.fieldGroup}>
            <label>Valor Limite Orçado (R$)</label>
            <input
              type="text"
              value={displayValue}
              onChange={handleChange}
              placeholder="R$ 0,00"
              className={styles.currencyInput}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setEditCotaModal(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSaveTetoCota}
          >
            Salvar Teto
          </button>
        </div>
      </div>
    </div>
  );
}