'use client';

import { useState } from 'react';
import styles from './TabRelatorios.module.css';

export default function TabRelatorios({ 
  estoqueLotes = [], 
  historicoDispensacoes = [] 
}) {
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const [mes, setMes] = useState(String(mesAtual));
  const [ano, setAno] = useState(String(anoAtual));

  // 🎯 FILTRAGEM POR MÊS E ANO
  const filtrarPorData = (dataString) => {
    if (!dataString) return false;
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return false;

    const mesData = data.getMonth() + 1;
    const anoData = data.getFullYear();

    const matchMes = mes === '' || mesData === Number(mes);
    const matchAno = ano === '' || anoData === Number(ano);

    return matchMes && matchAno;
  };

  // Filtragem das listas
  const entradasFiltradas = estoqueLotes.filter((item) =>
    filtrarPorData(item.dataEntrada || item.createdAt)
  );

  const saidasFiltradas = historicoDispensacoes.filter((item) =>
    filtrarPorData(item.dataDispensacao || item.createdAt)
  );

  // 🎯 FUNÇÃO PARA EXPORTAR CSV (EXCEL)
  const exportarCSV = (dados, tipo) => {
    if (dados.length === 0) {
      return alert(`Nenhum dado de ${tipo} para exportar no período selecionado.`);
    }

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

    if (tipo === 'Entradas') {
      csvContent += 'Data Entrada;Medicamento;Dosagem;Lote;Fornecedor;Qtd Inicial;Saldo Atual;Valor Unit (R$)\n';
      dados.forEach((d) => {
        const dataFmt = d.dataEntrada ? new Date(d.dataEntrada).toLocaleDateString('pt-BR') : '—';
        csvContent += `"${dataFmt}";"${d.medicamentoNome}";"${d.dosagem}";"${d.numeroLote}";"${d.fornecedor}";"${d.qtdInicial}";"${d.qtdAtual}";"${d.valorUnitario || 0}"\n`;
      });
    } else {
      csvContent += 'Data Dispensação;Paciente;Pasta;Medicamento;Lote;Qtd Entregue;Responsável\n';
      dados.forEach((d) => {
        const dataFmt = d.dataDispensacao ? new Date(d.dataDispensacao).toLocaleDateString('pt-BR') : '—';
        csvContent += `"${dataFmt}";"${d.pacienteNome}";"${d.numeroPasta}";"${d.medicamentoNome}";"${d.numeroLote}";"${d.qtdEntregue}";"${d.responsavelEntrega}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_${tipo}_${mes || 'Todos'}_${ano || 'Todos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🎯 IMPRESSÃO DIRETA VIA IFRAME SILENCIOSO
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
              <th>Data</th>
              <th>Medicamento</th>
              <th>Dosagem</th>
              <th>Lote</th>
              <th>Fornecedor</th>
              <th>Qtd Inicial</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map(
                (d) => `
              <tr>
                <td>${d.dataEntrada ? new Date(d.dataEntrada).toLocaleDateString('pt-BR') : '—'}</td>
                <td><strong>${d.medicamentoNome}</strong></td>
                <td>${d.dosagem}</td>
                <td>${d.numeroLote}</td>
                <td>${d.fornecedor}</td>
                <td>${d.qtdInicial}</td>
                <td>${d.qtdAtual}</td>
              </tr>
            `
              )
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
              <th>Pasta</th>
              <th>Medicamento</th>
              <th>Lote</th>
              <th>Qtd Entregue</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map(
                (d) => `
              <tr>
                <td>${d.dataDispensacao ? new Date(d.dataDispensacao).toLocaleDateString('pt-BR') : '—'}</td>
                <td><strong>${d.pacienteNome}</strong></td>
                <td>${d.numeroPasta}</td>
                <td>${d.medicamentoNome}</td>
                <td>${d.numeroLote}</td>
                <td>${d.qtdEntregue}</td>
                <td>${d.responsavelEntrega}</td>
              </tr>
            `
              )
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
        <p>Período: ${mes ? `Mês ${mes}` : 'Todos os meses'} / ${ano || 'Todos os anos'} | Emissão: ${new Date().toLocaleString('pt-BR')}</p>
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
      {/* BARRA DE FILTROS MÊS E ANO */}
      <div className={styles.filterCard}>
        <h3 className={styles.filterTitle}>🔍 Filtro por Período das Entradas e Saídas</h3>

        <div className={styles.filterGrid}>
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
        </div>
      </div>

      {/* SEÇÃO 1: RELATÓRIO DE ENTRADAS (LOTES) */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h4>📥 Entradas de Medicamentos (Lotes)</h4>
            <small>{entradasFiltradas.length} registro(s) encontrado(s)</small>
          </div>

          <div className={styles.actionsGroup}>
            <button
              type="button"
              onClick={() => exportarCSV(entradasFiltradas, 'Entradas')}
              className={styles.excelBtn}
            >
              📊 Exportar Excel (CSV)
            </button>
            <button
              type="button"
              onClick={() => imprimirRelatorio('Entradas')}
              className={styles.printBtn}
            >
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data Entrada</th>
                <th>Medicamento</th>
                <th>Dosagem</th>
                <th>Nº Lote</th>
                <th>Fornecedor</th>
                <th>Qtd Inicial</th>
                <th>Saldo Atual</th>
              </tr>
            </thead>
            <tbody>
              {entradasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTd}>
                    Nenhuma entrada de lote registrada no período selecionado.
                  </td>
                </tr>
              ) : (
                entradasFiltradas.map((item, idx) => (
                  <tr key={item.loteId || idx}>
                    <td>
                      {item.dataEntrada
                        ? new Date(item.dataEntrada).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td><strong>{item.medicamentoNome}</strong></td>
                    <td>{item.dosagem}</td>
                    <td>{item.numeroLote}</td>
                    <td>{item.fornecedor}</td>
                    <td>{item.qtdInicial}</td>
                    <td><strong>{item.qtdAtual}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO 2: RELATÓRIO DE SAÍDAS (DISPENSAÇÕES) */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h4>📤 Saídas de Medicamentos (Dispensações)</h4>
            <small>{saidasFiltradas.length} registro(s) encontrado(s)</small>
          </div>

          <div className={styles.actionsGroup}>
            <button
              type="button"
              onClick={() => exportarCSV(saidasFiltradas, 'Saidas')}
              className={styles.excelBtn}
            >
              📊 Exportar Excel (CSV)
            </button>
            <button
              type="button"
              onClick={() => imprimirRelatorio('Saidas')}
              className={styles.printBtn}
            >
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data Dispensação</th>
                <th>Paciente</th>
                <th>Pasta</th>
                <th>Medicamento</th>
                <th>Nº Lote</th>
                <th>Qtd Entregue</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {saidasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTd}>
                    Nenhuma saída/dispensação registrada no período selecionado.
                  </td>
                </tr>
              ) : (
                saidasFiltradas.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.dataDispensacao
                        ? new Date(item.dataDispensacao).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td><strong>{item.pacienteNome}</strong></td>
                    <td>Pasta #{item.numeroPasta}</td>
                    <td>{item.medicamentoNome}</td>
                    <td>{item.numeroLote}</td>
                    <td><strong>{item.qtdEntregue}</strong></td>
                    <td>{item.responsavelEntrega}</td>
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