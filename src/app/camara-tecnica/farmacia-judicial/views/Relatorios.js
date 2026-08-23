'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import styles from './TabRelatorios.module.css';

export default function TabRelatorios({ 
  entradas = [], 
  saidas = [] 
}) {
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');

  // ESTADO PARA CONTROLAR SE O BOTÃO "GERAR" FOI CLICADO
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [entradasFiltradas, setEntradasFiltradas] = useState([]);
  const [saidasFiltradas, setSaidasFiltradas] = useState([]);

  // 🎯 FILTRAGEM POR MÊS E ANO
  const filtrarPorData = (dataStr) => {
    if (!mes && !ano) return true;
    if (!dataStr) return true;

    let mesItem, anoItem;
    if (dataStr.includes('/')) {
      const partes = dataStr.split(' ')[0].split('/'); // ['DD', 'MM', 'YYYY']
      mesItem = Number(partes[1]);
      anoItem = Number(partes[2]);
    } else if (dataStr.includes('-')) {
      const partes = dataStr.split('T')[0].split('-'); // ['YYYY', 'MM', 'DD']
      mesItem = Number(partes[1]);
      anoItem = Number(partes[0]);
    } else {
      return true;
    }

    const matchMes = mes === '' || mesItem === Number(mes);
    const matchAno = ano === '' || anoItem === Number(ano);

    return matchMes && matchAno;
  };

  // 🎯 AÇÃO DO BOTÃO "GERAR RELATÓRIO"
  const handleGerarRelatorio = (e) => {
    e.preventDefault();
    
    const entFiltradas = entradas.filter(item => filtrarPorData(item.dataEntrada));
    const saiFiltradas = saidas.filter(item => filtrarPorData(item.dataDispensacao));

    setEntradasFiltradas(entFiltradas);
    setSaidasFiltradas(saiFiltradas);
    setRelatorioGerado(true);
  };

  // 🎯 EXPORTAÇÃO EXCEL NATIVA (.XLSX)
  const exportarExcel = (dados, tipo) => {
    if (dados.length === 0) {
      return alert(`Nenhum dado de ${tipo} para exportar.`);
    }

    let dadosFormatados = [];

    if (tipo === 'Entradas') {
      dadosFormatados = dados.map((d) => ({
        'Data Entrada': d.dataEntrada || '—',
        'Medicamento': d.medicamentoNome || '—',
        'Dosagem': d.dosagem || '—',
        'Quantidade': Number(d.quantidade || 0),
        'Valor Unitário (R$)': Number(d.valorUnitario || 0),
        'Valor Total (R$)': Number(d.quantidade || 0) * Number(d.valorUnitario || 0),
        'Fornecedor': d.fornecedor || '—',
        'Lote': d.numeroLote || '—',
        'Validade': d.dataValidade || '—'
      }));
    } else {
      dadosFormatados = dados.map((d) => ({
        'Data Saída': d.dataDispensacao || '—',
        'Paciente': d.pacienteNome || '—',
        'CPF': d.cpf || '—',
        'Medicamento': d.medicamentoNome || '—',
        'Dosagem': d.dosagem || '—',
        'Quantidade': Number(d.quantidade || 0),
        'Responsável / Obs': d.observacao || '—',
        'Protocolo / Pasta': `#${d.numeroPasta || '—'}`
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tipo);

    const maxCols = Object.keys(dadosFormatados[0]).map((key) => ({
      wch: Math.max(key.length + 5, 18)
    }));
    worksheet['!cols'] = maxCols;

    XLSX.writeFile(workbook, `Relatorio_${tipo}_${mes || 'Geral'}_${ano || 'Geral'}.xlsx`);
  };

  // 🎯 IMPRESSÃO EM PDF
  const imprimirRelatorio = (tipo) => {
    const dados = tipo === 'Entradas' ? entradasFiltradas : saidasFiltradas;
    if (dados.length === 0) return alert('Nenhum dado para imprimir.');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    let tabelaHtml = '';
    if (tipo === 'Entradas') {
      tabelaHtml = `
        <table>
          <thead>
            <tr>
              <th>Data Entrada</th>
              <th>Medicamento</th>
              <th>Qtd</th>
              <th>V. Unitário (R$)</th>
              <th>Fornecedor</th>
              <th>Lote</th>
              <th>Validade</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map((d) => `
                <tr>
                  <td>${d.dataEntrada || '—'}</td>
                  <td><strong>${d.medicamentoNome || '—'}</strong> (${d.dosagem || ''})</td>
                  <td>${d.quantidade || 0}</td>
                  <td>R$ ${Number(d.valorUnitario || 0).toFixed(2)}</td>
                  <td>${d.fornecedor || '—'}</td>
                  <td>${d.numeroLote || '—'}</td>
                  <td>${d.dataValidade || '—'}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      tabelaHtml = `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Medicamento</th>
              <th>Qtd</th>
              <th>Responsável</th>
              <th>Protocolo</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map((d) => `
                <tr>
                  <td>${d.dataDispensacao || '—'}</td>
                  <td><strong>${d.pacienteNome || '—'}</strong></td>
                  <td>${d.medicamentoNome || '—'} (${d.dosagem || ''})</td>
                  <td>${d.quantidade || 0}</td>
                  <td>${d.observacao || '—'}</td>
                  <td>#${d.numeroPasta || '—'}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>
      `;
    }

    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de ${tipo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; color: #0f172a; }
          h2 { margin-bottom: 4px; text-transform: uppercase; }
          p { color: #64748b; margin-top: 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background-color: #f1f5f9; text-transform: uppercase; font-size: 10px; }
        </style>
      </head>
      <body>
        <h2>Relatório de ${tipo} de Medicamentos</h2>
        <p>Emissão: ${new Date().toLocaleString('pt-BR')}</p>
        ${tabelaHtml}
      </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 400);
  };

  return (
    <div className={styles.container}>
      {/* BARRA DE FILTROS MÊS E ANO + BOTÃO GERAR */}
      <div className={styles.filterCard}>
        <h3 className={styles.filterTitle}>🔍 Filtro por Período das Entradas e Saídas</h3>

        <form onSubmit={handleGerarRelatorio} className={styles.filterGrid}>
          <div className={styles.fieldGroup}>
            <label>Mês de Referência</label>
            <select value={mes} onChange={(e) => setMes(e.target.value)}>
              <option value="">Todos os Meses</option>
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Ano</label>
            <select value={ano} onChange={(e) => setAno(e.target.value)}>
              <option value="">Todos os Anos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className={styles.btnGroup}>
            <button type="submit" className={styles.gerarBtn}>
              Gerar Relatório
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO 1: REGISTRO DE ENTRADAS (SEMPRE EXIBIDA) */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h4>Registro de Entrada de Medicamentos</h4>
            <small>
              {relatorioGerado ? `${entradasFiltradas.length} registro(s) encontrado(s)` : 'Aguardando geração do relatório'}
            </small>
          </div>

          {relatorioGerado && (
            <div className={styles.actionsGroup}>
              <button
                type="button"
                onClick={() => exportarExcel(entradasFiltradas, 'Entradas')}
                className={styles.excelBtn}
              >
                Exportar Excel
              </button>
              <button
                type="button"
                onClick={() => imprimirRelatorio('Entradas')}
                className={styles.printBtn}
              >
                🖨️ Imprimir
              </button>
            </div>
          )}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data Entrada</th>
                <th>Medicamento</th>
                <th>Qtd</th>
                <th>V. Unitário (R$)</th>
                <th>Fornecedor</th>
                <th>Lote</th>
                <th>Validade</th>
              </tr>
            </thead>
            <tbody>
              {!relatorioGerado ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTd}>
                    👉 Selecione o período acima e clique em <strong>"Gerar Relatório"</strong> para exibir os registros de entrada.
                  </td>
                </tr>
              ) : entradasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTd}>
                    Nenhum registro de entrada encontrado no período selecionado.
                  </td>
                </tr>
              ) : (
                entradasFiltradas.map((item, idx) => (
                  <tr key={item.loteId || idx}>
                    <td>{item.dataEntrada}</td>
                    <td><strong>{item.medicamentoNome}</strong> ({item.dosagem})</td>
                    <td><strong>{item.quantidade}</strong></td>
                    <td>R$ {Number(item.valorUnitario || 0).toFixed(2)}</td>
                    <td>{item.fornecedor}</td>
                    <td>{item.numeroLote}</td>
                    <td>{item.dataValidade}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO 2: REGISTRO DE SAÍDAS (SEMPRE EXIBIDA) */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h4>Registro de Saídas (Dispensações)</h4>
            <small>
              {relatorioGerado ? `${saidasFiltradas.length} registro(s) encontrado(s)` : 'Aguardando geração do relatório'}
            </small>
          </div>

          {relatorioGerado && (
            <div className={styles.actionsGroup}>
              <button
                type="button"
                onClick={() => exportarExcel(saidasFiltradas, 'Saidas')}
                className={styles.excelBtn}
              >
                Exportar Excel
              </button>
              <button
                type="button"
                onClick={() => imprimirRelatorio('Saidas')}
                className={styles.printBtn}
              >
                🖨️ Imprimir
              </button>
            </div>
          )}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Medicamento</th>
                <th>Qtd</th>
                <th>Responsável</th>
                <th>Protocolo</th>
              </tr>
            </thead>
            <tbody>
              {!relatorioGerado ? (
                <tr>
                  <td colSpan="6" className={styles.emptyTd}>
                    👉 Selecione o período acima e clique em <strong>"Gerar Relatório"</strong> para exibir os registros de saída.
                  </td>
                </tr>
              ) : saidasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyTd}>
                    Nenhum registro de saída encontrado no período selecionado.
                  </td>
                </tr>
              ) : (
                saidasFiltradas.map((item, idx) => (
                  <tr key={item.dispensacaoId || idx}>
                    <td>{item.dataDispensacao}</td>
                    <td><strong>{item.pacienteNome}</strong></td>
                    <td>{item.medicamentoNome} ({item.dosagem})</td>
                    <td><strong>{item.quantidade}</strong></td>
                    <td>{item.observacao}</td>
                    <td>#{item.numeroPasta}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}