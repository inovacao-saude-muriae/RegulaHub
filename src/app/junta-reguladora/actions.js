'use server';

import { prisma } from '@/lib/prisma';

/* ── 1. BUSCA DE PESSOAS NO BANCO (BUSCAR PESSOA EXISTENTE) ── */
export async function buscarPessoaExistente(termo) {
  if (!termo || String(termo).trim().length < 2) {
    return [];
  }

  try {
    const termoClean = String(termo).trim();
    const apenasNumeros = termoClean.replace(/\D/g, '');

    const pessoas = await prisma.pessoa.findMany({
      where: {
        OR: [
          { nomeCompleto: { contains: termoClean, mode: 'insensitive' } },
          ...(apenasNumeros.length > 0 ? [{ cpf: { contains: apenasNumeros } }] : []),
        ],
      },
      include: {
        enderecos: {
          where: { enderecoAtual: true },
          take: 1,
        },
        pacienteJunta: {
          include: {
            servicos: {
              where: { ativo: true },
              include: { servico: true },
            },
          },
        },
      },
      take: 10,
    });

    return pessoas.map((p) => {
      const enderecoAtual = p.enderecos?.[0] || {};
      return {
        id: p.pacienteJunta?.id || null,
        cpf: p.cpf,
        nomeCompleto: p.nomeCompleto,
        nome: p.nomeCompleto,
        dataNascimento: p.dataNascimento,
        nomeMae: p.nomeMae,
        telefone: p.telefone,
        logradouro: enderecoAtual.logradouro || '',
        numero: enderecoAtual.numero || '',
        complemento: enderecoAtual.complemento || '',
        bairro: enderecoAtual.bairro || '',
        cidade: enderecoAtual.cidade || 'Muriaé',
        uf: enderecoAtual.uf || 'MG',
        cep: enderecoAtual.cep || '',
        tipoDeficiencia: p.pacienteJunta?.tipoDeficiencia || '',
        servicosAtivos: p.pacienteJunta?.servicos
          ? p.pacienteJunta.servicos.map((s) => s.servico.nome)
          : [],
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pessoas no banco:', error);
    return [];
  }
}

/* ── ALIASES DE COMPATIBILIDADE ── */
export async function buscarPessoaPorCpfOuNome(termo) {
  return buscarPessoaExistente(termo);
}

export async function buscarPessoaPorNomeOuCpf(termo) {
  return buscarPessoaExistente(termo);
}

/* ── 2. CADASTRAR OU ATUALIZAR PACIENTE NA JUNTA REGULADORA ── */
export async function cadastrarPacienteJunta(data) {
  try {
    const { cpf, nomeCompleto, dataNascimento, telefone, tipoDeficiencia, locaisEncaminhados = [] } = data;
    const cpfClean = (cpf || '').replace(/\D/g, '').slice(0, 11);

    if (!cpfClean || cpfClean.length !== 11) {
      return { success: false, error: 'CPF inválido. Deve conter 11 dígitos.' };
    }

    // 1. Garante que a pessoa exista/seja atualizada na tabela pessoa
    await prisma.pessoa.upsert({
      where: { cpf: cpfClean },
      update: {
        nomeCompleto: nomeCompleto ? nomeCompleto.slice(0, 150) : undefined,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        telefone: telefone ? telefone.slice(0, 20) : undefined,
      },
      create: {
        cpf: cpfClean,
        nomeCompleto: (nomeCompleto || '').slice(0, 150),
        dataNascimento: dataNascimento ? new Date(dataNascimento) : new Date(),
        nomeMae: 'NÃO INFORMADO',
        telefone: telefone ? telefone.slice(0, 20) : '',
      },
    });

    // 2. Insere/Atualiza paciente_junta
    const pacienteJunta = await prisma.pacienteJunta.upsert({
      where: { pessoaCpf: cpfClean },
      update: { tipoDeficiencia },
      create: {
        pessoaCpf: cpfClean,
        tipoDeficiencia,
      },
    });

    // 3. Atualiza serviços vinculados
    await prisma.pacienteJuntaServico.deleteMany({
      where: { pacienteJuntaId: pacienteJunta.id },
    });

    if (locaisEncaminhados.length > 0) {
      for (const localNome of locaisEncaminhados) {
        await prisma.juntaServico.upsert({
          where: { nome: localNome },
          update: {},
          create: { nome: localNome },
        });
      }

      const servicosEncontrados = await prisma.juntaServico.findMany({
        where: { nome: { in: locaisEncaminhados } },
      });

      const novosVinculos = servicosEncontrados.map((servico) => ({
        pacienteJuntaId: pacienteJunta.id,
        servicoId: servico.id,
        ativo: true,
      }));

      await prisma.pacienteJuntaServico.createMany({
        data: novosVinculos,
      });
    }

    return { success: true, id: pacienteJunta.id };
  } catch (error) {
    console.error('Erro ao cadastrar paciente na Junta via Prisma:', error);
    return { success: false, error: error.message };
  }
}

/* ── 3. LISTAR PACIENTES VINCULADOS A UM SERVIÇO (RECEPÇÃO) ── */
export async function getPacientesPorServico(servicoNome) {
  try {
    const vinculos = await prisma.pacienteJuntaServico.findMany({
      where: {
        ativo: true,
        servico: {
          nome: { equals: servicoNome, mode: 'insensitive' },
        },
      },
      include: {
        pacienteJunta: {
          include: {
            pessoa: true,
          },
        },
      },
      orderBy: {
        pacienteJunta: {
          pessoa: {
            nomeCompleto: 'asc',
          },
        },
      },
    });

    const data = vinculos.map((v) => ({
      paciente_junta_id: v.pacienteJunta.id,
      cpf: v.pacienteJunta.pessoa.cpf,
      nome: v.pacienteJunta.pessoa.nomeCompleto,
      tipo_deficiencia: v.pacienteJunta.tipoDeficiencia,
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao listar pacientes do serviço:', error);
    return { success: false, error: error.message };
  }
}

/* ── 4. REGISTRAR PRESENÇA / ATENDIMENTO NO SERVIÇO ── */
export async function registrarAtendimentoServico(data) {
  try {
    const { pacienteJuntaId, servicoNome, especialidade, dataAtendimento, status, observacao, profissional } = data;

    const servico = await prisma.juntaServico.upsert({
      where: { nome: servicoNome },
      update: {},
      create: { nome: servicoNome },
    });

    await prisma.juntaAtendimento.create({
      data: {
        pacienteJuntaId: Number(pacienteJuntaId),
        servicoId: servico.id,
        especialidade,
        dataAtendimento: new Date(dataAtendimento),
        status,
        observacao: observacao || null,
        profissionalResponsavel: profissional || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar atendimento via Prisma:', error);
    return { success: false, error: error.message };
  }
}

/* ── 5. CONSULTA DO PRONTUÁRIO UNIFICADO ── */
export async function getProntuarioUnificado(termoBusca) {
  try {
    const termoClean = String(termoBusca).trim();
    const cpfClean = termoClean.replace(/\D/g, '').slice(0, 11);

    const pacienteJunta = await prisma.pacienteJunta.findFirst({
      where: {
        OR: [
          { pessoa: { nomeCompleto: { contains: termoClean, mode: 'insensitive' } } },
          ...(cpfClean.length > 0 ? [{ pessoaCpf: cpfClean }] : []),
        ],
      },
      include: {
        pessoa: true,
        servicos: {
          where: { ativo: true },
          include: { servico: true },
        },
        atendimentos: {
          include: { servico: true },
          orderBy: { dataAtendimento: 'desc' },
        },
      },
    });

    if (!pacienteJunta) {
      return { success: true, data: null };
    }

    const pacienteFormatted = {
      paciente_junta_id: pacienteJunta.id,
      cpf: pacienteJunta.pessoa.cpf,
      nome: pacienteJunta.pessoa.nomeCompleto,
      data_nascimento: pacienteJunta.pessoa.dataNascimento,
      telefone: pacienteJunta.pessoa.telefone,
      tipo_deficiencia: pacienteJunta.tipoDeficiencia,
      servicos_ativos: pacienteJunta.servicos.map((s) => s.servico.nome),
    };

    const historicoFormatted = pacienteJunta.atendimentos.map((a) => ({
      id: a.id,
      data: a.dataAtendimento,
      servico: a.servico.nome,
      especialidade: a.especialidade,
      status: a.status,
      observacao: a.observacao,
      profissional: a.profissionalResponsavel,
    }));

    return {
      success: true,
      data: {
        paciente: pacienteFormatted,
        historico: historicoFormatted,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar prontuário via Prisma:', error);
    return { success: false, error: error.message };
  }
}