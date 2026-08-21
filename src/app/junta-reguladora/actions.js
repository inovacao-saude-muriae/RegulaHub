'use server';

import { prisma } from '@/lib/prisma';

/* ── 1. BUSCA DE PESSOAS NO BANCO (AUTOCOMPLETAR) ── */
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
      },
      take: 10,
    });

    return pessoas.map((p) => {
      const enderecoAtual = p.enderecos?.[0] || {};
      return {
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
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pessoas no banco:', error);
    return [];
  }
}

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

    const pacienteJunta = await prisma.pacienteJunta.upsert({
      where: { pessoaCpf: cpfClean },
      update: { tipoDeficiencia },
      create: {
        pessoaCpf: cpfClean,
        tipoDeficiencia,
      },
    });

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

/* ── 3. LISTAR PACIENTES VINCULADOS A UM SERVIÇO (CORRIGIDO) ── */
export async function getPacientesPorServico(servicoNome) {
  try {
    if (!servicoNome) return { success: true, data: [] };

    const termo = String(servicoNome).trim();

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

    // Busca os vínculos e traz os dados da pessoa sem realizar o orderBy direto no Prisma
    const vinculos = await prisma.pacienteJuntaServico.findMany({
      where: {
        servicoId: servico.id,
        ativo: true,
      },
    });

    if (vinculos.length === 0) {
      return { success: true, data: [] };
    }

    const pacienteJuntaIds = vinculos.map((v) => v.pacienteJuntaId).filter(Boolean);

    const pacientesJunta = await prisma.pacienteJunta.findMany({
      where: {
        id: { in: pacienteJuntaIds },
      },
    });

    const pessoaCpfs = pacientesJunta.map((pj) => pj.pessoaCpf).filter(Boolean);

    const pessoas = await prisma.pessoa.findMany({
      where: {
        cpf: { in: pessoaCpfs },
      },
      include: {
        enderecos: {
          where: { enderecoAtual: true },
          take: 1,
        },
      },
    });

    const pessoaDict = pessoas.reduce((acc, p) => {
      acc[p.cpf] = p;
      return acc;
    }, {});

    const pacienteJuntaDict = pacientesJunta.reduce((acc, pj) => {
      acc[pj.id] = pj;
      return acc;
    }, {});

    const data = vinculos
      .map((v) => {
        const pj = pacienteJuntaDict[v.pacienteJuntaId];
        const pessoa = pj ? pessoaDict[pj.pessoaCpf] : null;

        if (!pessoa || !pj) return null;

        const end = pessoa.enderecos?.[0] || {};

        return {
          id: pj.id,
          paciente_junta_id: pj.id,
          cpf: pessoa.cpf || '',
          nome: pessoa.nomeCompleto || '',
          nomeCompleto: pessoa.nomeCompleto || '',
          nomeMae: pessoa.nomeMae || '',
          telefone: pessoa.telefone || '',
          tipo_deficiencia: pj.tipoDeficiencia || '',
          tipoDeficiencia: pj.tipoDeficiencia || '',
          logradouro: end.logradouro || '',
          numero: end.numero || '',
          bairro: end.bairro || '',
          cidade: end.cidade || '',
          uf: end.uf || '',
          cep: end.cep || '',
        };
      })
      .filter(Boolean);

    // Ordena alfabeticamente pelo nome do paciente em memória
    data.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));

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

/* ── 5. CONSULTA DO PRONTUÁRIO UNIFICADO (AGRUPADO POR SERVIÇO E ESPECIALIDADE) ── */
export async function getProntuarioUnificado(termoBusca) {
  try {
    const termoClean = String(termoBusca).trim();
    const apenasNumeros = termoClean.replace(/\D/g, '');

    const pessoa = await prisma.pessoa.findFirst({
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
      },
    });

    if (!pessoa) {
      return { success: true, data: null };
    }

    const pacienteJunta = await prisma.pacienteJunta.findFirst({
      where: { pessoaCpf: pessoa.cpf },
    });

    let servicosAtivos = [];
    let servicosAgrupados = [];

    if (pacienteJunta) {
      const vinculos = await prisma.pacienteJuntaServico.findMany({
        where: {
          pacienteJuntaId: pacienteJunta.id,
          ativo: true,
        },
      });

      if (vinculos.length > 0) {
        const servicoIds = vinculos.map((v) => v.servicoId).filter(Boolean);
        const listaServicos = await prisma.juntaServico.findMany({
          where: { id: { in: servicoIds } },
        });
        servicosAtivos = listaServicos.map((s) => s.nome);
      }

      const atendimentos = await prisma.juntaAtendimento.findMany({
        where: { pacienteJuntaId: pacienteJunta.id },
        orderBy: { dataAtendimento: 'desc' },
      });

      if (atendimentos.length > 0) {
        const servicoIdsAtend = atendimentos.map((a) => a.servicoId).filter(Boolean);
        const servicosMap = await prisma.juntaServico.findMany({
          where: { id: { in: servicoIdsAtend } },
        });

        const servicoDict = servicosMap.reduce((acc, s) => {
          acc[s.id] = s.nome;
          return acc;
        }, {});

        const gruposMap = {};

        for (const a of atendimentos) {
          const nomeServico = servicoDict[a.servicoId] || 'Outros';
          const espec = a.especialidade || 'Geral';
          const chaveGrupo = `${nomeServico}___${espec}`;

          if (!gruposMap[chaveGrupo]) {
            gruposMap[chaveGrupo] = {
              servico: nomeServico,
              especialidade: espec,
              presencas: 0,
              faltas: 0,
              faltasJustificadas: 0,
              datas: [],
            };
          }

          if (a.status === 'PRESENCA') gruposMap[chaveGrupo].presencas++;
          else if (a.status === 'FALTA') gruposMap[chaveGrupo].faltas++;
          else if (a.status === 'FALTA_JUSTIFICADA') gruposMap[chaveGrupo].faltasJustificadas++;

          gruposMap[chaveGrupo].datas.push({
            id: a.id,
            data: a.dataAtendimento,
            status: a.status,
            profissional: a.profissionalResponsavel,
            observacao: a.observacao,
          });
        }

        servicosAgrupados = Object.values(gruposMap);
      }
    }

    const end = pessoa.enderecos?.[0] || {};

    const pacienteFormatted = {
      paciente_junta_id: pacienteJunta?.id || null,
      cpf: pessoa.cpf,
      nome: pessoa.nomeCompleto,
      nomeMae: pessoa.nomeMae,
      data_nascimento: pessoa.dataNascimento,
      telefone: pessoa.telefone,
      tipo_deficiencia: pacienteJunta?.tipoDeficiencia || 'Não cadastrado na Junta',
      logradouro: end.logradouro || '',
      numero: end.numero || '',
      bairro: end.bairro || '',
      cidade: end.cidade || '',
      uf: end.uf || '',
      cep: end.cep || '',
      servicos_ativos: servicosAtivos,
    };

    return {
      success: true,
      data: {
        paciente: pacienteFormatted,
        servicosAgrupados,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar prontuário via Prisma:', error);
    return { success: false, error: error.message };
  }
}