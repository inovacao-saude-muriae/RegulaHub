'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Buscar todos os pedidos relacionando as tabelas pessoa, procedimento, ubs e medicos
export async function getPedidosExames() {
  try {
    const data = await prisma.pedidoExame.findMany({
      include: {
        pessoa: true,
        procedimento: {
          include: { tipoExame: true }
        },
        ubs: true,
        medicoSolicitante: true,
        medicoResponsavel: true,
      },
      orderBy: { dataSolicitacao: 'desc' },
    });

    return data.map((item) => {
      const dataLiberacaoStr = item.dataLiberacao ? item.dataLiberacao.toISOString().split('T')[0] : null;
      return {
        id: `REG-${item.id}`,
        dbId: item.id,
        examType: item.procedimento?.tipoExame?.nome || '',
        examTypeId: item.procedimento?.tipoExameId || null,
        procedure: item.procedimento?.nome || '',
        procedureId: item.procedimentoId,
        estimatedCost: item.procedimento ? Number(item.procedimento.valor) : 0,
        patientName: item.pessoa?.nomeCompleto || '',
        motherName: item.pessoa?.nomeMae || '',
        cpf: item.pessoaCpf,
        susCard: item.cnsPaciente || '',
        requestDate: item.dataSolicitacao ? item.dataSolicitacao.toISOString().split('T')[0] : '',
        classification: item.classificacaoRisco || 'Verde',
        competence: dataLiberacaoStr ? `${dataLiberacaoStr.slice(5, 7)}/${dataLiberacaoStr.slice(0, 4)}` : '',
        quotaCompetenceMonth: dataLiberacaoStr ? dataLiberacaoStr.slice(5, 7) : '',
        quotaCompetenceYear: dataLiberacaoStr ? dataLiberacaoStr.slice(0, 4) : '',
        requestDoctor: item.medicoSolicitante?.nome || '',
        requestUbs: item.ubs?.nome || '',
        justification: item.observacao || '',
        status: item.status,
        communicationDate: item.dataComunicacao ? item.dataComunicacao.toISOString().split('T')[0] : '',
        quota: item.tipoCota || '',
        generalObservation: item.observacao || '',
        regulatorDoctor: item.medicoResponsavel?.nome || null,
        releaseDate: dataLiberacaoStr,
        billingDate: dataLiberacaoStr
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos no banco:', error);
    return [];
  }
}

// 2. Buscar Dados Auxiliares (Tipos de Exames e Procedimentos cadastrados no Banco)
export async function getAuxiliaryData() {
  try {
    const [tiposExame, procedimentos] = await Promise.all([
      prisma.tipoExame.findMany({ orderBy: { nome: 'asc' } }),
      prisma.procedimento.findMany({
        include: { tipoExame: true },
        orderBy: { nome: 'asc' }
      })
    ]);

    return {
      tiposExame: tiposExame.map(t => ({ id: t.id, nome: t.nome })),
      procedimentos: procedimentos.map(p => ({
        id: p.id,
        nome: p.nome,
        valor: Number(p.valor),
        tipoExameId: p.tipoExameId,
        tipoExameNome: p.tipoExame.nome
      }))
    };
  } catch (error) {
    console.error('Erro ao carregar dados auxiliares:', error);
    return { tiposExame: [], procedimentos: [] };
  }
}

// 3. Buscar uma pessoa especifica por CPF ou Nome
export async function searchPessoa(term) {
  try {
    return await prisma.pessoa.findFirst({
      where: {
        OR: [
          { cpf: term },
          { nomeCompleto: { contains: term, mode: 'insensitive' } },
        ],
      },
    });
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    return null;
  }
}

// 4. Autocomplete de Pessoas para o campo de busca com dropdown
export async function searchPessoasAutocomplete(term) {
  if (!term || term.trim().length < 2) return [];

  try {
    const pessoas = await prisma.pessoa.findMany({
      where: {
        OR: [
          { cpf: { contains: term } },
          { nomeCompleto: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    return pessoas.map((p) => ({
      cpf: p.cpf,
      nomeCompleto: p.nomeCompleto,
      nomeMae: p.nomeMae,
    }));
  } catch (error) {
    console.error('Erro no autocomplete de pessoa:', error);
    return [];
  }
}

// 5. Salvar Novo Pedido no PostgreSQL
export async function createPedidoExame(data) {
  try {
    const newRecord = await prisma.pedidoExame.create({
      data: {
        pessoaCpf: data.cpf,
        cnsPaciente: data.susCard || null,
        procedimentoId: Number(data.procedureId),
        classificacaoRisco: data.classification,
        observacao: data.justification,
        status: 'Aguardando',
      },
    });

    revalidatePath('/regulacao');
    return { success: true, data: newRecord };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, error: error.message };
  }
}

// 6. Atualizar Data da Comunicação na Tabela
export async function updateCommunicationDate(idStr, dateStr) {
  try {
    const numericId = Number(String(idStr).replace('REG-', ''));
    await prisma.pedidoExame.update({
      where: { id: numericId },
      data: {
        dataComunicacao: dateStr ? new Date(dateStr) : null,
        statusComunicacao: dateStr ? 'ENVIADO' : 'PENDENTE',
      },
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar comunicação:', error);
    return { success: false };
  }
}

// 7. Liberar Paciente (Atualiza Cota, Status e Data de Liberação)
export async function releasePaciente(idStr, releaseData) {
  try {
    const numericId = Number(String(idStr).replace('REG-', ''));
    await prisma.pedidoExame.update({
      where: { id: numericId },
      data: {
        status: 'Liberado',
        tipoCota: releaseData.quota,
        dataLiberacao: new Date(releaseData.releaseDate),
        observacao: releaseData.generalObservation,
      },
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao liberar paciente:', error);
    return { success: false };
  }
}