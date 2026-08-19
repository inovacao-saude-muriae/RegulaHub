"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  cadastrarPacienteJunta,
  getPacientesPorServico,
  registrarAtendimentoServico,
  getProntuarioUnificado,
} from "./actions";

import CadastroPacienteJunta from "./components/CadastroPacienteJunta";
import AtendimentoServico from "./components/AtendimentoServico";
import ProntuarioRelatorio from "./components/ProntuarioRelatorio";

import styles from "./page.module.css";

function JuntaReguladoraPageContent() {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "CADASTRO";
  const activeSubTab = searchParams.get("subTab") || "CAEE";

  const [pacientesServico, setPacientesServico] = useState([]);
  const [prontuarioData, setProntuarioData] = useState(null);

  // Carrega os pacientes vinculados ao serviço selecionado no menu da Sidebar
  useEffect(() => {
    if (activeTab === "SERVICOS") {
      getPacientesPorServico(activeSubTab).then((res) => {
        if (res.success) setPacientesServico(res.data);
      });
    }
  }, [activeTab, activeSubTab]);

  const handleCadastrarPaciente = async (formData) => {
    const res = await cadastrarPacienteJunta(formData);
    if (res.success) {
      alert("Paciente cadastrado/atualizado no banco RegulaHub com sucesso!");
    } else {
      alert("Erro ao salvar: " + res.error);
    }
  };

  const handleRegistrarAtendimento = async (atendimentoData) => {
    const res = await registrarAtendimentoServico(atendimentoData);
    if (res.success) {
      alert("Registro de presença/frequência gravado com sucesso!");
    } else {
      alert("Erro ao registrar: " + res.error);
    }
  };

  const handleBuscarProntuario = async (termo) => {
    const res = await getProntuarioUnificado(termo);
    if (res.success) {
      setProntuarioData(res.data);
    } else {
      alert("Erro na busca: " + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Junta Reguladora</h1>
          <p>
            Gestão Multidisciplinar, Recepção de Serviços e Prontuário Unificado
          </p>
        </div>
      </header>

      {activeTab === "CADASTRO" && (
        <CadastroPacienteJunta onCadastrar={handleCadastrarPaciente} />
      )}

      {activeTab === "SERVICOS" && (
        <AtendimentoServico
          servicoNome={activeSubTab}
          pacientes={pacientesServico}
          onRegistrar={handleRegistrarAtendimento}
        />
      )}

      {activeTab === "RELATORIO" && (
        <ProntuarioRelatorio
          prontuarioData={prontuarioData}
          onBuscar={handleBuscarProntuario}
        />
      )}
    </div>
  );
}

export default function JuntaReguladoraPage() {
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
      <JuntaReguladoraPageContent />
    </Suspense>
  );
}
