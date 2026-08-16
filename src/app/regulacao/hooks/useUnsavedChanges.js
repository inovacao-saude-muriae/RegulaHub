"use client";

import { useEffect } from "react";

/**
 * Hook para alertar sobre alterações não salvas.
 * @param {boolean} isDirty - Deve ser `true` quando houver dados preenchidos/alterados no formulário.
 */
export function useUnsavedChanges(isDirty) {
  useEffect(() => {
    // Escuta o evento de recarregar a página (F5) ou fechar a aba do navegador
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        // O navegador exige atribuir um valor para exibir a mensagem nativa de confirmação
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
}