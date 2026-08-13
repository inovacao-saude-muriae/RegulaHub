'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Função auxiliar para formatar YYYY-MM-DD em DD/MM/YYYY
function formatDateToBR(dateObjOrString) {
  if (!dateObjOrString) return '';
  const isoStr = dateObjOrString instanceof Date 
    ? dateObjOrString.toISOString().split('T')[0] 
    : String(dateObjOrString).split('T')[0];
    
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

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
      const dataSolicitacaoRaw = item.dataSolicitacao ? item.dataSolicitacao.toISOString().split('T')[0] : '';

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
        
        // Data formatada para DD/MM/YYYY e a original ISO para inputs/filtros
        requestDate: formatDateToBR(dataSolicitacaoRaw),
        requestDateRaw: dataSolicitacaoRaw,
        
        classification: item.classificacaoRisco || 'Verde',
        competence: dataLiberacaoStr ? `${dataLiberacaoStr.slice(5, 7)}/${dataLiberacaoStr.slice(0, 4)}` : '',
        quotaCompetenceMonth: dataLiberacaoStr ? dataLiberacaoStr.slice(5, 7) : '',
        quotaCompetenceYear: dataLiberacaoStr ? dataLiberacaoStr.slice(0, 4) : '',
        requestDoctor: item.medicoSolicitante?.nome || '',
        requestDoctorId: item.medicoSolicitanteId || '',
        requestUbs: item.ubs?.nome || '',
        requestUbsId: item.ubsResponsavelId || '',
        justification: item.observacao || '',
        status: item.status,
        communicationDate: item.dataComunicacao ? item.dataComunicacao.toISOString().split('T')[0] : '',
        quota: item.tipoCota || '',
        generalObservation: item.observacao || '',
        regulatorDoctor: item.medicoResponsavel?.nome || null,
        regulatorDoctorId: item.medicoResponsavelId || '',
        releaseDate: formatDateToBR(dataLiberacaoStr),
        releaseDateRaw: dataLiberacaoStr,
        billingDate: ''
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos no banco:', error);
    return [];
  }
}

// 2. Buscar Dados Auxiliares
export async function getAuxiliaryData() {
  try {
    const [tiposExame, procedimentos, medicos, ubsList, pessoas] = await Promise.all([
      prisma.tipoExame.findMany({ orderBy: { nome: 'asc' } }),
      prisma.procedimento.findMany({
        include: { tipoExame: true },
        orderBy: { nome: 'asc' }
      }),
      prisma.medico.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      prisma.ubs.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      prisma.pessoa.findMany({ orderBy: { nomeCompleto: 'asc' }, take: 50 })
    ]);

    return {
      tiposExame: tiposExame.map(t => ({ id: t.id, nome: t.nome })),
      procedimentos: procedimentos.map(p => ({
        id: p.id,
        nome: p.nome,
        valor: Number(p.valor),
        tipoExameId: p.tipoExameId,
        tipoExameNome: p.tipoExame.nome
      })),
      medicos: medicos.map(m => ({ 
        id: m.id, 
        nome: m.nome, 
        crm: m.crm, 
        ufCrm: m.ufCrm, 
        especialidade: m.especialidade,
        tipo: m.tipo || 'Solicitante' 
      })),
      ubsList: ubsList.map(u => ({ id: u.id, nome: u.nome, cnes: u.cnes })),
      pessoas: pessoas.map(p => ({
        cpf: p.cpf,
        nomeCompleto: p.nomeCompleto,
        nomeMae: p.nomeMae,
        telefone: p.telefone,
        dataNascimento: p.dataNascimento ? formatDateToBR(p.dataNascimento) : ''
      }))
    };
  } catch (error) {
    console.error('Erro ao carregar dados auxiliares:', error);
    return { tiposExame: [], procedimentos: [], medicos: [], ubsList: [], pessoas: [] };
  }
}

// 3. Buscar uma pessoa específica por CPF ou Nome
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

// 4. Autocomplete de Pessoas
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

// 5. Salvar Novo Pedido
export async function createPedidoExame(data) {
  try {
    const newRecord = await prisma.pedidoExame.create({
      data: {
        pessoaCpf: data.cpf,
        cnsPaciente: data.susCard || null,
        procedimentoId: Number(data.procedureId),
        medicoSolicitanteId: data.medicoSolicitanteId ? Number(data.medicoSolicitanteId) : null,
        ubsResponsavelId: data.ubsResponsavelId ? Number(data.ubsResponsavelId) : null,
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

// 6. Atualizar Data da Comunicação
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

// 7. Liberar Paciente
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
        medicoResponsavelId: releaseData.regulatorDoctorId ? Number(releaseData.regulatorDoctorId) : null,
      },
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao liberar paciente:', error);
    return { success: false };
  }
}

// 8. Cadastrar Nova Pessoa / Paciente
export async function createPessoa(data) {
  try {
    const cleanCpf = data.cpf.replace(/\D/g, '');
    const cleanCep = data.cep ? data.cep.replace(/\D/g, '') : null;

    const result = await prisma.$transaction(async (tx) => {
      const pessoa = await tx.pessoa.create({
        data: {
          cpf: cleanCpf,
          nomeCompleto: data.nomeCompleto,
          dataNascimento: new Date(data.dataNascimento),
          nomeMae: data.nomeMae,
          telefone: data.telefone,
        },
      });

      if (data.logradouro) {
        await tx.endereco.create({
          data: {
            pessoaCpf: cleanCpf,
            logradouro: data.logradouro,
            numero: data.numero || 'S/N',
            complemento: data.complemento || null,
            bairro: data.bairro || 'Centro',
            cidade: data.cidade || 'Muriaé',
            uf: data.uf || 'MG',
            cep: cleanCep,
            enderecoAtual: true,
          },
        });
      }

      return pessoa;
    });

    revalidatePath('/regulacao');
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao cadastrar pessoa:', error);
    return { success: false, error: error.message };
  }
}

// 9. Cadastrar Novo Médico
export async function createMedico(data) {
  try {
    const medico = await prisma.medico.create({
      data: {
        nome: data.nome,
        crm: data.crm,
        ufCrm: data.ufCrm.toUpperCase(),
        especialidade: data.especialidade,
        tipo: data.tipo || 'Solicitante',
      },
    });

    revalidatePath('/regulacao');
    return { success: true, data: medico };
  } catch (error) {
    console.error('Erro ao cadastrar médico:', error);
    return { success: false, error: error.message };
  }
}

// 10. Cadastrar Nova UBS
export async function createUbs(data) {
  try {
    const ubs = await prisma.ubs.create({
      data: {
        nome: data.nome,
        cnes: data.cnes,
      },
    });

    revalidatePath('/regulacao');
    return { success: true, data: ubs };
  } catch (error) {
    console.error('Erro ao cadastrar UBS:', error);
    return { success: false, error: error.message };
  }
}

// 11. Cadastrar Novo Procedimento
export async function createProcedimento(data) {
  try {
    const procedimento = await prisma.procedimento.create({
      data: {
        nome: data.nome,
        valor: parseFloat(data.valor),
        tipoExameId: Number(data.tipoExameId),
      },
    });

    revalidatePath('/regulacao');
    return { success: true, data: procedimento };
  } catch (error) {
    console.error('Erro ao cadastrar procedimento:', error);
    return { success: false, error: error.message };
  }
}

// 12. Buscar Tetos de Cotas Financeiras
export async function getCotasFinanceiras() {
  try {
    const data = await prisma.cotaFinanceira.findMany();
    return data.map(c => ({
      id: c.id,
      tipoCota: c.tipoCota,
      mes: c.mes,
      ano: c.ano,
      valorTeto: Number(c.valorTeto)
    }));
  } catch (error) {
    console.error('Erro ao buscar cotas financeiras:', error);
    return [];
  }
}

// 13. Salvar Teto de Cota
export async function saveCotaFinanceira({ tipoCota, mes, ano, valorTeto }) {
  try {
    const record = await prisma.cotaFinanceira.upsert({
      where: {
        tipoCota_mes_ano: { tipoCota, mes, ano }
      },
      update: {
        valorTeto: parseFloat(valorTeto)
      },
      create: {
        tipoCota,
        mes,
        ano,
        valorTeto: parseFloat(valorTeto)
      }
    });

    revalidatePath('/regulacao');
    return { success: true, data: record };
  } catch (error) {
    console.error('Erro ao salvar teto de cota:', error);
    return { success: false, error: error.message };
  }
}

// 14. Atualizar Data de Faturamento
export async function updateBillingDate(idStr, dateStr) {
  try {
    const numericId = Number(String(idStr).replace('REG-', ''));
    await prisma.pedidoExame.update({
      where: { id: numericId },
      data: {
        dataComunicacao: dateStr ? new Date(dateStr) : null,
      },
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar data de faturamento:', error);
    return { success: false };
  }
}

// 15. Atualizar Pedido
export async function updatePedidoExame(idStr, updateData) {
  try {
    const numericId = Number(String(idStr).replace('REG-', ''));
    const isRevertingToWaiting = updateData.status === 'Aguardando';

    const payload = {
      status: updateData.status,
      classificacaoRisco: updateData.classification,
      cnsPaciente: updateData.susCard || null,
      observacao: updateData.justification || updateData.generalObservation || null,
      medicoSolicitanteId: updateData.requestDoctorId ? Number(updateData.requestDoctorId) : null,
      ubsResponsavelId: updateData.requestUbsId ? Number(updateData.requestUbsId) : null,
    };

    if (updateData.procedureId) {
      payload.procedimentoId = Number(updateData.procedureId);
    }

    if (isRevertingToWaiting) {
      payload.tipoCota = null;
      payload.dataLiberacao = null;
      payload.medicoResponsavelId = null;
    } else {
      payload.tipoCota = updateData.quota || null;
      payload.dataLiberacao = updateData.releaseDate ? new Date(updateData.releaseDate) : null;
      payload.medicoResponsavelId = updateData.regulatorDoctorId ? Number(updateData.regulatorDoctorId) : null;
    }

    await prisma.pedidoExame.update({
      where: { id: numericId },
      data: payload,
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return { success: false, error: error.message };
  }
}

// 16. Excluir Pedido
export async function deletePedidoExame(idStr) {
  try {
    const numericId = Number(String(idStr).replace('REG-', ''));
    await prisma.pedidoExame.delete({
      where: { id: numericId },
    });

    revalidatePath('/regulacao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    return { success: false, error: error.message };
  }
}