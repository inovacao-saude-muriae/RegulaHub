"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getPacientesJudiciais,
  createPacienteJudicial,
  getMedicamentosEEstoque,
  getCatalogoMedicamentos,
  createMedicamento,
  createLoteMedicamento,
  registrarDispensacao,
  getDashboardMetrics,
  getRelatorioEntradas,
  getRelatorioSaidas,
} from "./actions";

import TabDashboard from "./views/Dashboard";
import TabPacientesJudiciais from "./components/PacientesJudiciais";
import TabDispensacao from "./views/Dispensacao";
import TabRelatorios from "./views/Relatorios";

// 🎯 COMPONENTES DE ESTOQUE SEPARADOS E INDEPENDENTES
import TabSaldoEstoque from "./components/SaldoEstoque";
import TabRegistrarEntrada from "./components/RegistrarEntrada";
import TabCadastrarMedicamento from "./components/CadastrarMedicamentos";

import styles from "./page.module.css";

function FarmaciaJudicialPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get("tab") || "DASHBOARD";
  const activeSubTab = searchParams.get("subTab") || "SALDO";

  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [estoqueLotes, setEstoqueLotes] = useState([]);
  const [relatorioEntradas, setRelatorioEntradas] = useState([]);
  const [relatorioSaidas, setRelatorioSaidas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [metrics, setMetrics] = useState({});

  const reloadData = async () => {
    setLoading(true);
    try {
      const [pacData, estData, catData, metData, entData, saiData] =
        await Promise.all([
          getPacientesJudiciais(),
          getMedicamentosEEstoque(),
          getCatalogoMedicamentos(),
          getDashboardMetrics(),
          getRelatorioEntradas(),
          getRelatorioSaidas(),
        ]);
      setPacientes(pacData || []);
      setEstoqueLotes(estData || []);
      setCatalogo(catData || []);
      setMetrics(metData || {});
      setRelatorioEntradas(entData || []);
      setRelatorioSaidas(saiData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleNavigate = (tab, subTab) => {
    if (subTab) {
      router.push(
        `/camara-tecnica/farmacia-judicial?tab=${tab}&subTab=${subTab}`,
      );
    } else {
      router.push(`/camara-tecnica/farmacia-judicial?tab=${tab}`);
    }
  };

  const handleCreatePaciente = async (formData) => {
    const res = await createPacienteJudicial(formData);
    if (res.success) await reloadData();
    else alert("Erro: " + res.error);
  };

  const handleCreateMedicamento = async (formData) => {
    const res = await createMedicamento(formData);
    if (res.success) {
      if (formData.darEntradaEstoque) {
        await createLoteMedicamento({
          medicamentoId: res.id || res.medicamentoId,
          numeroLote: formData.numeroLote,
          fornecedor: formData.fornecedor,
          qtdInicial: formData.qtdInicial,
          valorUnitario: formData.valorUnitario,
          dataEntrada: formData.dataEntrada,
          dataValidade: formData.dataValidade,
        });
      }
      await reloadData();
      handleNavigate("ESTOQUE", "SALDO");
    } else alert("Erro: " + res.error);
  };

  const handleCreateLote = async (formData) => {
    const res = await createLoteMedicamento(formData);
    if (res.success) {
      await reloadData();
      handleNavigate("ESTOQUE", "SALDO");
    } else alert("Erro: " + res.error);
  };

  const handleConfirmarDispensacao = async (dispensacaoData) => {
    const res = await registrarDispensacao(dispensacaoData);
    if (res.success) await reloadData();
    else alert("Erro: " + res.error);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Farmácia Judicial</h1>
          <p>Visão geral, processos judiciais, estoque e dispensação</p>
        </div>
      </header>

      {/* ROUTING DIRETO POR COMPONENTE */}
      {activeTab === "DASHBOARD" && (
        <TabDashboard
          metrics={metrics}
          onNavigate={handleNavigate}
          loading={loading}
          medicamentosList={estoqueLotes}
        />
      )}

      {activeTab === "PACIENTES" && (
        <TabPacientesJudiciais
          pacientes={pacientes}
          catalogo={catalogo}
          onCreatePaciente={handleCreatePaciente}
          loading={loading}
        />
      )}

      {activeTab === "DISPENSACAO" && (
        <TabDispensacao
          pacientes={pacientes}
          estoqueLotes={estoqueLotes}
          onConfirmarDispensacao={handleConfirmarDispensacao}
        />
      )}

      {/* ROTEAMENTO DE ESTOQUE DEDICADO */}
      {activeTab === "ESTOQUE" && activeSubTab === "SALDO" && (
        <TabSaldoEstoque estoqueLotes={estoqueLotes} loading={loading} />
      )}

      {activeTab === "ESTOQUE" && activeSubTab === "ENTRADA" && (
        <TabRegistrarEntrada
          catalogo={catalogo}
          onCreateLote={handleCreateLote}
        />
      )}

      {activeTab === "ESTOQUE" && activeSubTab === "CADASTRAR" && (
        <TabCadastrarMedicamento
          onCreateMedicamento={handleCreateMedicamento}
        />
      )}

      {activeTab === "RELATORIOS" && (
        <TabRelatorios entradas={relatorioEntradas} saidas={relatorioSaidas} />
      )}
    </div>
  );
}

export default function FarmaciaJudicialPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Carregando página...
        </div>
      }
    >
      <FarmaciaJudicialPageContent />
    </Suspense>
  );
}
