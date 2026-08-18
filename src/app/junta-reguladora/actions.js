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
    const {
      cpf,
      nomeCompleto,
      dataNascimento,
      nomeMae,
      telefone,
      tipoDeficiencia,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      locaisEncaminhados = [],
    } = data;

    const cpfClean = (cpf || '').replace(/\D/g, '').slice(0, 11);

    if (!cpfClean || cpfClean.length !== 11) {
      return { success: false, error: 'CPF inválido. Deve conter 11 dígitos.' };
    }

    // 1. Cria ou atualiza a Pessoa
    await prisma.pessoa.upsert({
      where: { cpf: cpfClean },
      update: {
        nomeCompleto: nomeCompleto ? nomeCompleto.slice(0, 150) : undefined,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        nomeMae: nomeMae ? nomeMae.slice(0, 150) : undefined,
        telefone: telefone ? telefone.slice(0, 20) : undefined,
      },
      create: {
        cpf: cpfClean,
        nomeCompleto: (nomeCompleto || '').slice(0, 150),
        dataNascimento: dataNascimento ? new Date(dataNascimento) : new Date(),
        nomeMae: (nomeMae || 'NÃO INFORMADO').slice(0, 150),
        telefone: telefone ? telefone.slice(0, 20) : '',
      },
    });

    // 2. Cria ou atualiza o Endereço Residencial
    if (logradouro || bairro || cep) {
      const enderecoExistente = await prisma.endereco.findFirst({
        where: { pessoaCpf: cpfClean, enderecoAtual: true },
      });

      if (enderecoExistente) {
        await prisma.endereco.update({
          where: { id: enderecoExistente.id },
          data: {
            cep: cep ? cep.replace(/\D/g, '').slice(0, 8) : null,
            logradouro: logradouro ? logradouro.slice(0, 150) : '',
            numero: numero ? numero.slice(0, 20) : '',
            complemento: complemento ? complemento.slice(0, 50) : null,
            bairro: bairro ? bairro.slice(0, 100) : '',
            cidade: cidade ? cidade.slice(0, 100) : 'Muriaé',
            uf: uf ? uf.slice(0, 2) : 'MG',
          },
        });
      } else {
        await prisma.endereco.create({
          data: {
            pessoaCpf: cpfClean,
            cep: cep ? cep.replace(/\D/g, '').slice(0, 8) : null,
            logradouro: logradouro ? logradouro.slice(0, 150) : '',
            numero: numero ? numero.slice(0, 20) : '',
            complemento: complemento ? complemento.slice(0, 50) : null,
            bairro: bairro ? bairro.slice(0, 100) : '',
            cidade: cidade ? cidade.slice(0, 100) : 'Muriaé',
            uf: uf ? uf.slice(0, 2) : 'MG',
            enderecoAtual: true,
          },
        });
      }
    }

    // 3. Cria ou atualiza Paciente na Junta
    const pacienteJunta = await prisma.pacienteJunta.upsert({
      where: { pessoaCpf: cpfClean },
      update: { tipoDeficiencia },
      create: {
        pessoaCpf: cpfClean,
        tipoDeficiencia,
      },
    });

    // 4. Atualiza os Serviços Vinculados
    await prisma.pacienteJuntaServico.deleteMany({
      where: { pacienteJuntaId: pacienteJunta.id },
    });

    if (locaisEncaminhados.length > 0) {
      const servicoIds = [];

      for (const localNome of locaisEncaminhados) {
        let servico = await prisma.juntaServico.findFirst({
          where: { nome: { equals: localNome.trim(), mode: 'insensitive' } },
        });

        if (!servico) {
          servico = await prisma.juntaServico.create({
            data: { nome: localNome.trim(), ativo: true },
          });
        }

        servicoIds.push(servico.id);
      }

      const novosVinculos = servicoIds.map((sId) => ({
        pacienteJuntaId: pacienteJunta.id,
        servicoId: sId,
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
    if (!servicoNome) return { success: true, data: [] };

    const termo = String(servicoNome).trim();

    // Encontra o serviço no banco com busca flexível
    const servico = await prisma.juntaServico.findFirst({
      where: {
        OR: [
          { nome: { equals: termo, mode: 'insensitive' } },
          { nome: { contains: termo, mode: 'insensitive' } },
        ],
      },
    });

    if (!servico) {
      return { success: true, data: [] };
    }

    const vinculos = await prisma.pacienteJuntaServico.findMany({
      where: {
        servicoId: servico.id,
        ativo: true,
      },
      include: {
        pacienteJunta: {
          include: {
            pessoa: {
              include: {
                enderecos: {
                  where: { enderecoAtual: true },
                  take: 1,
                },
              },
            },
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

    const data = vinculos.map((v) => {
      const p = v.pacienteJunta;
      const pessoa = p?.pessoa || {};
      const end = pessoa?.enderecos?.[0] || {};

      return {
        id: p.id,
        paciente_junta_id: p.id,
        cpf: pessoa.cpf || '',
        nome: pessoa.nomeCompleto || '',
        nomeCompleto: pessoa.nomeCompleto || '',
        nomeMae: pessoa.nomeMae || '',
        telefone: pessoa.telefone || '',
        tipo_deficiencia: p.tipoDeficiencia || '',
        tipoDeficiencia: p.tipoDeficiencia || '',
        logradouro: end.logradouro || '',
        numero: end.numero || '',
        bairro: end.bairro || '',
        cidade: end.cidade || '',
        uf: end.uf || '',
        cep: end.cep || '',
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao listar pacientes do serviço:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/* ── 4. REGISTRAR PRESENÇA / ATENDIMENTO NO SERVIÇO ── */
export async function registrarAtendimentoServico(data) {
  try {
    const { 
      pacienteJuntaId, 
      pacienteId,
      servico, 
      servicoNome, 
      especialidade, 
      dataAtendimento, 
      data: dataForm, 
      status, 
      observacao, 
      profissional 
    } = data;

    // Aceita tanto servicoNome quanto servico e evita erro de 'trim' em undefined
    const nomeDoServico = (servicoNome || servico || '').trim();
    const idDoPaciente = pacienteJuntaId || pacienteId;

    if (!nomeDoServico) {
      return { success: false, error: 'Nome do serviço não foi informado.' };
    }

    if (!idDoPaciente) {
      return { success: false, error: 'Paciente não foi selecionado.' };
    }

    let juntaServico = await prisma.juntaServico.findFirst({
      where: { nome: { equals: nomeDoServico, mode: 'insensitive' } },
    });

    if (!juntaServico) {
      juntaServico = await prisma.juntaServico.create({
        data: { nome: nomeDoServico, ativo: true },
      });
    }

    const dataFinal = dataAtendimento || dataForm ? new Date(dataAtendimento || dataForm) : new Date();

    await prisma.juntaAtendimento.create({
      data: {
        pacienteJuntaId: Number(idDoPaciente),
        servicoId: juntaServico.id,
        especialidade: especialidade || 'Geral',
        dataAtendimento: dataFinal,
        status: status || 'PRESENCA',
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
        pessoa: {
          include: {
            enderecos: {
              where: { enderecoAtual: true },
              take: 1,
            },
          },
        },
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

    const end = pacienteJunta.pessoa?.enderecos?.[0] || {};

    const pacienteFormatted = {
      paciente_junta_id: pacienteJunta.id,
      cpf: pacienteJunta.pessoa.cpf,
      nome: pacienteJunta.pessoa.nomeCompleto,
      nomeMae: pacienteJunta.pessoa.nomeMae,
      data_nascimento: pacienteJunta.pessoa.dataNascimento,
      telefone: pacienteJunta.pessoa.telefone,
      tipo_deficiencia: pacienteJunta.tipoDeficiencia,
      logradouro: end.logradouro || '',
      numero: end.numero || '',
      bairro: end.bairro || '',
      cidade: end.cidade || '',
      uf: end.uf || '',
      cep: end.cep || '',
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