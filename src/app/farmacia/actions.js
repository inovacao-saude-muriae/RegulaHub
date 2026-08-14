'use server';

import { prisma } from '@/lib/prisma';

export async function getPacientesJudiciais() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pfj.numero_pasta AS numeroPasta,
        pfj.numero_processo AS numeroProcesso,
        pfj.status,
        p.Cpf AS cpf,
        p.nome_completo AS patientName,
        p.nome_mae AS motherName,
        p.telefone,
        DATE_FORMAT(p.data_nascimento, '%Y-%m-%d') AS dataNascimento,
        GROUP_CONCAT(CONCAT(m.nome, ' (', m.dosagem, ') - Qtd: ', tp.qtd_prescrita_mensal) SEPARATOR '; ') AS medicamentosTratamento
      FROM paciente_farmacia_judicial pfj
      JOIN pessoa p ON pfj.pessoa_cpf = p.Cpf
      LEFT JOIN tratamento_paciente tp ON pfj.numero_pasta = tp.paciente_pasta AND tp.ativo = 1
      LEFT JOIN medicamento m ON tp.medicamento_id = m.id
      GROUP BY pfj.numero_pasta
      ORDER BY p.nome_completo ASC
    `);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar pacientes judiciais:', error);
    return [];
  }
}

export async function createPacienteJudicial(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO pessoa (Cpf, nome_completo, data_nascimento, nome_mae, telefone)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome_completo = VALUES(nome_completo),
        data_nascimento = VALUES(data_nascimento),
        nome_mae = VALUES(nome_mae),
        telefone = VALUES(telefone)
    `, [data.cpf, data.nomeCompleto, data.dataNascimento, data.nomeMae, data.telefone || '']);

    await connection.query(`
      INSERT INTO paciente_farmacia_judicial (numero_pasta, pessoa_cpf, numero_processo, status)
      VALUES (?, ?, ?, ?)
    `, [data.numeroPasta, data.cpf, data.numeroProcesso, 'Ativo']);

    if (data.medicamentos && data.medicamentos.length > 0) {
      for (const med of data.medicamentos) {
        if (med.medicamentoId && med.qtdMensal) {
          await connection.query(`
            INSERT INTO tratamento_paciente (paciente_pasta, medicamento_id, qtd_prescrita_mensal, ativo)
            VALUES (?, ?, ?, 1)
          `, [data.numeroPasta, med.medicamentoId, med.qtdMensal]);
        }
      }
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao cadastrar paciente judicial:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function getMedicamentosEEstoque() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        lm.id AS loteId,
        m.id AS medicamentoId,
        m.nome AS medicamentoNome,
        m.tipo,
        m.dosagem,
        lm.numero_lote AS numeroLote,
        lm.fornecedor,
        lm.qtd_inicial AS qtdInicial,
        lm.valor_unitario AS valorUnitario,
        DATE_FORMAT(lm.data_entrada, '%Y-%m-%d') AS dataEntrada,
        DATE_FORMAT(lm.data_validade, '%Y-%m-%d') AS dataValidade,
        (lm.qtd_inicial - COALESCE(SUM(dm.qtd_entregue), 0)) AS qtdAtual
      FROM lote_medicamento lm
      JOIN medicamento m ON lm.medicamento_id = m.id
      LEFT JOIN dispensacao_medicamento dm ON lm.id = dm.lote_medicamento_id
      GROUP BY lm.id
      ORDER BY m.nome ASC, lm.data_validade ASC
    `);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar estoque de medicamentos:', error);
    return [];
  }
}

export async function getCatalogoMedicamentos() {
  try {
    const [rows] = await pool.query(`
      SELECT id, nome, tipo, dosagem, ativo 
      FROM medicamento 
      WHERE ativo = 1 
      ORDER BY nome ASC
    `);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar catálogo de medicamentos:', error);
    return [];
  }
}

export async function createMedicamento(data) {
  try {
    const [res] = await pool.query(`
      INSERT INTO medicamento (nome, tipo, dosagem, ativo)
      VALUES (?, ?, ?, 1)
    `, [data.nome, data.tipo, data.dosagem]);
    return { success: true, id: res.insertId };
  } catch (error) {
    console.error('Erro ao cadastrar medicamento:', error);
    return { success: false, error: error.message };
  }
}

export async function createLoteMedicamento(data) {
  try {
    await pool.query(`
      INSERT INTO lote_medicamento 
        (medicamento_id, numero_lote, fornecedor, qtd_inicial, valor_unitario, data_entrada, data_validade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.medicamentoId,
      data.numeroLote,
      data.fornecedor,
      data.qtdInicial,
      data.valorUnitario,
      data.dataEntrada,
      data.dataValidade
    ]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao dar entrada no lote:', error);
    return { success: false, error: error.message };
  }
}

export async function registrarDispensacao(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const dataHoraDispensacao = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const item of data.itens) {
      const obsFinal = `Responsável pela Entrega: ${data.responsavelEntrega}${data.observacao ? ' | Obs: ' + data.observacao : ''}`;

      await connection.query(`
        INSERT INTO dispensacao_medicamento 
          (paciente_pasta, lote_medicamento_id, qtd_entregue, data_dispensacao, observacao)
        VALUES (?, ?, ?, ?, ?)
      `, [data.numeroPasta, item.loteId, item.qtdEntregue, dataHoraDispensacao, obsFinal]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao registrar dispensação:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function getRelatorioEntradas() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        lm.id AS loteId,
        m.nome AS medicamentoNome,
        m.dosagem,
        m.tipo,
        lm.numero_lote AS numeroLote,
        lm.fornecedor,
        lm.qtd_inicial AS quantidade,
        lm.valor_unitario AS valorUnitario,
        (lm.qtd_inicial * lm.valor_unitario) AS valorTotal,
        DATE_FORMAT(lm.data_entrada, '%d/%m/%Y') AS dataEntrada,
        DATE_FORMAT(lm.data_validade, '%d/%m/%Y') AS dataValidade
      FROM lote_medicamento lm
      JOIN medicamento m ON lm.medicamento_id = m.id
      ORDER BY lm.data_entrada DESC
    `);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar relatório de entradas:', error);
    return [];
  }
}

export async function getRelatorioSaidas() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        dm.id AS dispensacaoId,
        pfj.numero_pasta AS numeroPasta,
        p.nome_completo AS pacienteNome,
        p.Cpf AS cpf,
        m.nome AS medicamentoNome,
        m.dosagem,
        lm.numero_lote AS numeroLote,
        dm.qtd_entregue AS quantidade,
        DATE_FORMAT(dm.data_dispensacao, '%d/%m/%Y %H:%i') AS dataDispensacao,
        dm.observacao
      FROM dispensacao_medicamento dm
      JOIN paciente_farmacia_judicial pfj ON dm.paciente_pasta = pfj.numero_pasta
      JOIN pessoa p ON pfj.pessoa_cpf = p.Cpf
      JOIN lote_medicamento lm ON dm.lote_medicamento_id = lm.id
      JOIN medicamento m ON lm.medicamento_id = m.id
      ORDER BY dm.data_dispensacao DESC
    `);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar relatório de saídas:', error);
    return [];
  }
}
// ==========================================
// 5. MÉTRICAS DO DASHBOARD
// ==========================================

export async function getDashboardMetrics() {
  try {
    const [resMedsCat] = await prisma.$queryRaw`
      SELECT COUNT(*) AS total FROM medicamento WHERE ativo = 1
    `;

    const [resEstoque] = await prisma.$queryRaw`
      SELECT COALESCE(SUM(lm.qtd_inicial - COALESCE(sub.total_entregue, 0)), 0) AS total
      FROM lote_medicamento lm
      LEFT JOIN (
        SELECT lote_medicamento_id, SUM(qtd_entregue) AS total_entregue
        FROM dispensacao_medicamento
        GROUP BY lote_medicamento_id
      ) sub ON lm.id = sub.lote_medicamento_id
    `;

    const resPacientes = await prisma.$queryRaw`
      SELECT status, COUNT(*) AS total
      FROM paciente_farmacia_judicial
      GROUP BY status
    `;

    let ativos = 0;
    let inativos = 0;
    let obitos = 0;

    resPacientes.forEach((row) => {
      const st = (row.status || '').toLowerCase();
      if (st.includes('ativo') && !st.includes('inativo')) ativos += Number(row.total);
      else if (st.includes('inativo')) inativos += Number(row.total);
      else if (st.includes('óbito') || st.includes('obito')) obitos += Number(row.total);
      else ativos += Number(row.total); // Padrão
    });

    return {
      totalMedicamentosCadastrados: Number(resMedsCat[0]?.total || 0),
      totalEstoqueUnidades: Number(resEstoque[0]?.total || 0),
      pacientesAtivos: ativos,
      pacientesInativos: inativos,
      pacientesObito: obitos
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return {
      totalMedicamentosCadastrados: 0,
      totalEstoqueUnidades: 0,
      pacientesAtivos: 0,
      pacientesInativos: 0,
      pacientesObito: 0
    };
  }
}
// ==========================================
// BUSCAR PESSOA/PACIENTE EXISTENTE NO BANCO
// ==========================================

export async function buscarPessoaExistente(termo) {
  if (!termo || termo.length < 2) return [];

  try {
    const rows = await prisma.$queryRaw`
      SELECT 
        p.Cpf AS cpf,
        p.nome_completo AS nomeCompleto,
        DATE_FORMAT(p.data_nascimento, '%Y-%m-%d') AS dataNascimento,
        p.nome_mae AS nomeMae,
        p.telefone,
        e.logradouro,
        e.numero,
        e.complemento,
        e.bairro,
        e.cidade,
        e.uf,
        e.cep
      FROM pessoa p
      LEFT JOIN endereco e ON p.Cpf = e.pessoa_cpf AND e.endereco_atual = 1
      WHERE p.Cpf LIKE ${'%' + termo + '%'} 
         OR p.nome_completo LIKE ${'%' + termo + '%'}
      LIMIT 10
    `;
    return rows;
  } catch (error) {
    console.error('Erro ao buscar pessoa existente:', error);
    return [];
  }
}