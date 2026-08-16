"use client";

import { useState } from "react";

export function useRegulacaoFilters() {
  const [filters, setFilters] = useState({
    searchName: "",
    searchCpf: "",
    searchProcedure: "",
    startDate: "",
    endDate: "",
    searchUbs: "",
    searchDoctor: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchName: "",
      searchCpf: "",
      searchProcedure: "",
      startDate: "",
      endDate: "",
      searchUbs: "",
      searchDoctor: "",
    });
  };

  // Aplica os filtros sobre a lista recebida protegendo contra dados inválidos
  const applyFilters = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item) => {
      if (
        filters.searchName &&
        !item.patientName?.toLowerCase().includes(filters.searchName.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.searchCpf &&
        !item.cpf?.replace(/\D/g, "").includes(filters.searchCpf.replace(/\D/g, ""))
      ) {
        return false;
      }

      if (
        filters.searchProcedure &&
        item.procedure !== filters.searchProcedure
      ) {
        return false;
      }

      if (
        filters.searchUbs &&
        !item.requestUbs?.toLowerCase().includes(filters.searchUbs.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.searchDoctor &&
        !item.requestDoctor?.toLowerCase().includes(filters.searchDoctor.toLowerCase())
      ) {
        return false;
      }

      if (filters.startDate && item.requestDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && item.requestDate > filters.endDate) {
        return false;
      }

      return true;
    });
  };

  return {
    filters,
    handleFilterChange,
    clearFilters,
    applyFilters,
  };
}