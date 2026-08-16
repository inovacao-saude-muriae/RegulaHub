'use client';

import { useState, useEffect } from 'react';
import { 
  getPacientesJudiciais, 
  createPacienteJudicial, 
  getMedicamentosEEstoque, 
  getCatalogoMedicamentos,
  createMedicamento, 
  createLoteMedicamento, 
  registrarDispensacao,
  getDashboardMetrics
} from './actions';

import TabDashboard from './components/TabDashboard';
import TabPacientesJudiciais from './components/TabPacientesJudiciais';
import TabEstoqueMedicamentos from './components/TabEstoqueMedicamentos';
import TabDispensacao from './components/TabDispensacao';
import TabRelatorios from './components/TabRelatorios';

import styles from './page.module.css';

export default function FarmaciaJudicialPage() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [loading, setLoading] = useState(true);

  const [pacientes, setPacientes] = useState([]);
  const [estoqueLotes, setEstoqueLotes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [metrics, setMetrics] = useState({
    totalMedicamentosCadastrados: 0,
    totalEstoqueUnidades: 0,
    pacientesAtivos: 0,
    pacientesInativos: 0,
    pacientesObito: 0
  });

  const reloadData = async () => {
    setLoading(true);
    try {
      const [pacData, estData, catData, metData] = await Promise.all([
        getPacientesJudiciais(),
        getMedicamentosEEstoque(),
        getCatalogoMedicamentos(),
        getDashboardMetrics()
      ]);
      setPacientes(pacData || []);
      setEstoqueLotes(estData || []);
      setCatalogo(catData || []);
      setMetrics(metData || {});
    } catch (error) {
      console.error('Erro ao carregar dados da farmácia:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const [pacData, estData, catData, metData] = await Promise.all([
          getPacientesJudiciais(),
          getMedicamentosEEstoque(),
          getCatalogoMedicamentos(),
          getDashboardMetrics()
        ]);
        setPacientes(pacData || []);
        setEstoqueLotes(estData || []);
        setCatalogo(catData || []);
        setMetrics(metData || {});
      } catch (error) {
        console.error('Erro ao carregar dados da farmácia:', error);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  const handleCreatePaciente = async (formData) => {
    const res = await createPacienteJudicial(formData);
    if (res.success) {
      await reloadData();
    } else {
      alert('Erro ao cadastrar paciente: ' + res.error);
    }
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
          dataValidade: formData.dataValidade
        });
      }
      await reloadData();
    } else {
      alert('Erro ao cadastrar medicamento: ' + res.error);
    }
  };

  const handleCreateLote = async (formData) => {
    const res = await createLoteMedicamento(formData);
    if (res.success) {
      await reloadData();
    } else {
      alert('Erro ao dar entrada no lote: ' + res.error);
    }
  };

  const handleConfirmarDispensacao = async (dispensacaoData) => {
    const res = await registrarDispensacao(dispensacaoData);
    if (res.success) {
      // 🎯 REMOVIDO O ALERT NATIVO DO NAVEGADOR PARA NÃO BLOQUEAR A IMPRESSÃO E A TELA
      await reloadData();
    } else {
      alert('Erro ao registrar dispensação: ' + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Farmácia Judicial</h1>
          <p>Visão geral, processos judiciais, estoque e dispensação</p>
        </div>

        <div className={styles.tabNav}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'DASHBOARD' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('DASHBOARD')}
          >
            📊 Dashboard
          </button>

          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'PACIENTES' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('PACIENTES')}
          >
            Pacientes ({pacientes.length})
          </button>

          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'DISPENSACAO' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('DISPENSACAO')}
          >
            💊 Dispensação de Medicamentos
          </button>

          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ESTOQUE' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ESTOQUE')}
          >
            📦 Estoque e Lotes
          </button>

          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'RELATORIOS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('RELATORIOS')}
          >
            📄 Relatórios
          </button>
        </div>
      </header>

      {/* RENDERIZAÇÃO DAS ABAS */}
      {activeTab === 'DASHBOARD' && (
        <TabDashboard 
          metrics={metrics}
          onNavigate={(tab) => setActiveTab(tab)}
          loading={loading}
          medicamentosList={catalogo}
        />
      )}

      {activeTab === 'PACIENTES' && (
        <TabPacientesJudiciais 
          pacientes={pacientes}
          catalogo={catalogo}
          onCreatePaciente={handleCreatePaciente}
          loading={loading}
        />
      )}

      {activeTab === 'DISPENSACAO' && (
        <TabDispensacao 
          pacientes={pacientes}
          estoqueLotes={estoqueLotes}
          onConfirmarDispensacao={handleConfirmarDispensacao}
        />
      )}

      {activeTab === 'ESTOQUE' && (
        <TabEstoqueMedicamentos 
          estoqueLotes={estoqueLotes}
          catalogo={catalogo}
          onCreateMedicamento={handleCreateMedicamento}
          onCreateLote={handleCreateLote}
          loading={loading}
        />
      )}

      {activeTab === 'RELATORIOS' && (
        <TabRelatorios />
      )}
    </div>
  );
}