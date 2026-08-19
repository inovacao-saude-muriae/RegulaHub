"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatDateBR(d) {
  if (!d) return "";
  const s = d instanceof Date ? d.toISOString() : String(d);
  const parts = s.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : s;
}

// Transforma um registro Pessoa+Tutor em objeto plano para o frontend
function pessoaToTutor(pessoa) {
  const end = pessoa.enderecos?.[0];
  return {
    cpf: pessoa.cpf,
    nomeCompleto: pessoa.nomeCompleto,
    telefone: pessoa.telefone || "",
    dataNascimento: formatDateBR(pessoa.dataNascimento),
    nomeMae: pessoa.nomeMae || "",
    bairro: end?.bairro || "",
    logradouro: end?.logradouro || "",
    numero: end?.numero || "",
    complemento: end?.complemento || "",
    cidade: end?.cidade || "Muriaé",
    uf: end?.uf || "MG",
    cep: end?.cep || "",
    // Dados extras da tabela tutor
    rg: pessoa.tutor?.rg || "",
    sexo: pessoa.tutor?.sexo || "",
    profissao: pessoa.tutor?.profissao || "",
    telefoneSecundario: pessoa.tutor?.telefoneSecundario || "",
    pontoReferencia: pessoa.tutor?.pontoReferencia || "",
    observacoes: pessoa.tutor?.observacoes || "",
    isTutor: !!pessoa.tutor,
  };
}

// Transforma Animal do banco em objeto para o frontend
function animalToFront(a) {
  return {
    id: a.id,
    pessoa_cpf: a.pessoa_cpf || "",
    tutorCpf: a.pessoa_cpf || "", // alias para compatibilidade
    tutorNome: a.tutor?.pessoa?.nomeCompleto || "",
    nome: a.nome || "",
    especie: a.especie || "",
    sexo: a.sexo || "",
    porte: a.porte || "",
    idade: a.idade || "",
    castrado: a.castrado || "Não",
    fotoUrl: a.fotoUrl || null,
    doenca_cronica: a.doenca_cronica || "Não",
    sintomas_vomito_diarreia: a.sintomas_vomito_diarreia || "Não",
    apetite_normal: a.apetite_normal || "Sim",
    em_tratamento: a.em_tratamento || "Não",
    qual_tratamento: a.qual_tratamento || "",
    observacoes: a.observacoes || "",
    possui_responsavel: a.possui_responsavel || "Sim",
    endereco_recolhimento: a.endereco_recolhimento || "",
    data_cadastro: a.data_cadastro || null,
  };
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
async function getTutoresCCZ() {
  try {
    const tutoresDiretos = await prisma.tutor.findMany({
      include: {
        pessoa: {
          include: {
            enderecos: { where: { enderecoAtual: true } },
          },
        },
      },
      orderBy: {
        pessoa: { nomeCompleto: "asc" },
      },
    });

    if (tutoresDiretos.length > 0) {
      return tutoresDiretos.map((tutor) =>
        pessoaToTutor(tutor.pessoa ? { ...tutor.pessoa, tutor } : tutor),
      );
    }
  } catch (error) {
    console.warn(
      "Falha ao consultar tutores diretamente, tentando fallback:",
      error,
    );
  }

  const pessoasTutoras = await prisma.pessoa.findMany({
    where: { tutor: { isNot: null } },
    include: {
      tutor: true,
      enderecos: { where: { enderecoAtual: true } },
    },
    orderBy: { nomeCompleto: "asc" },
  });

  return pessoasTutoras.map(pessoaToTutor);
}

export async function getCCZDashboardData() {
  try {
    const [tutores, animais, denuncias] = await Promise.all([
      getTutoresCCZ(),
      prisma.animal.findMany({
        include: {
          tutor: {
            include: {
              pessoa: true,
            },
          },
        },
        orderBy: { data_cadastro: "desc" },
      }),
      prisma.denuncia_cao_agressivo.findMany({
        orderBy: { data_denuncia: "desc" },
      }),
    ]);

    return {
      tutores,
      animais: animais.map(animalToFront),
      denuncias,
    };
  } catch (error) {
    console.error("Erro ao buscar dados CCZ:", error);
    return { tutores: [], animais: [], denuncias: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// BUSCA DE PESSOAS (autocomplete)
// ─────────────────────────────────────────────────────────────
export async function searchPessoasCCZ(termo) {
  if (!termo || termo.trim().length < 2) return [];
  try {
    const digits = termo.replace(/\D/g, "");
    const pessoas = await prisma.pessoa.findMany({
      where: {
        OR: [
          { nomeCompleto: { contains: termo, mode: "insensitive" } },
          ...(digits.length >= 3 ? [{ cpf: { contains: digits } }] : []),
        ],
      },
      include: {
        enderecos: { where: { enderecoAtual: true } },
        tutor: true,
      },
      take: 8,
      orderBy: { nomeCompleto: "asc" },
    });

    const resultados = pessoas.map(pessoaToTutor);
    if (resultados.length > 0) return resultados;

    const tutores = await prisma.tutor.findMany({
      include: {
        pessoa: {
          include: {
            enderecos: { where: { enderecoAtual: true } },
          },
        },
      },
      orderBy: {
        pessoa: { nomeCompleto: "asc" },
      },
      take: 8,
    });

    return tutores
      .map((tutor) =>
        pessoaToTutor(tutor.pessoa ? { ...tutor.pessoa, tutor } : tutor),
      )
      .filter((pessoa) => {
        const nome = (pessoa.nomeCompleto || "").toLowerCase();
        const cpf = (pessoa.cpf || "").replace(/\D/g, "");
        const busca = termo.toLowerCase();
        const buscaCpf = digits;

        return nome.includes(busca) || (buscaCpf && cpf.includes(buscaCpf));
      });
  } catch (error) {
    console.error("Erro ao buscar pessoas:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// VINCULAR / DESVINCULAR TUTOR
// ─────────────────────────────────────────────────────────────
export async function vincularTutor(cpf, dados) {
  try {
    await prisma.tutor.upsert({
      where: { pessoaCpf: cpf },
      update: {
        rg: dados.rg || null,
        sexo: dados.sexo || null,
        profissao: dados.profissao || null,
        telefoneSecundario: dados.telefoneSecundario
          ? dados.telefoneSecundario.replace(/\D/g, "")
          : null,
        pontoReferencia: dados.pontoReferencia || null,
        observacoes: dados.observacoes || null,
      },
      create: {
        pessoaCpf: cpf,
        rg: dados.rg || null,
        sexo: dados.sexo || null,
        profissao: dados.profissao || null,
        telefoneSecundario: dados.telefoneSecundario
          ? dados.telefoneSecundario.replace(/\D/g, "")
          : null,
        pontoReferencia: dados.pontoReferencia || null,
        observacoes: dados.observacoes || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao vincular tutor:", error);
    return { success: false, error: error.message };
  }
}

export async function desvincularTutor(cpf) {
  try {
    await prisma.tutor.delete({ where: { pessoaCpf: cpf } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desvincular tutor:", error);
    return { success: false, error: error.message };
  }
}

export async function createAnimal(data) {
  try {
    const animalId = String(data.id || "").trim();
    if (!animalId) {
      return { success: false, error: "Informe o ID do animal." };
    }

    const record = await prisma.animal.create({
      data: {
        id: animalId,
        pessoa_cpf:
          data.possui_responsavel === "Sim" ? data.tutorCpf || null : null,
        nome: data.nome || null,
        fotoUrl: data.fotoUrl || null,
        especie: data.especie,
        sexo: (data.sexo || "M").charAt(0).toUpperCase(), // M | F | I
        porte: data.porte || "Médio",
        idade: data.idade || null,
        castrado:
          data.castrado === "Sim" || data.castrado === true ? "Sim" : "Não",
        doenca_cronica: data.doenca_cronica || "Não",
        sintomas_vomito_diarreia: data.sintomas_vomito_diarreia || "Não",
        apetite_normal: data.apetite_normal || "Sim",
        em_tratamento: data.em_tratamento || "Não",
        qual_tratamento: data.qual_tratamento || null,
        observacoes: data.observacoes || null,
        possui_responsavel: data.possui_responsavel === "Sim" ? "Sim" : "Não",
        endereco_recolhimento: data.endereco_recolhimento || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao criar animal:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAnimal(id, data) {
  try {
    const record = await prisma.animal.update({
      where: { id: String(id) },
      data: {
        pessoa_cpf:
          data.possui_responsavel === "Sim" ? data.tutorCpf || null : null,
        nome: data.nome || null,
        fotoUrl: data.fotoUrl || null,
        especie: data.especie,
        sexo: (data.sexo || "M").charAt(0).toUpperCase(),
        porte: data.porte || "Médio",
        idade: data.idade || null,
        castrado:
          data.castrado === "Sim" || data.castrado === true ? "Sim" : "Não",
        doenca_cronica: data.doenca_cronica || "Não",
        sintomas_vomito_diarreia: data.sintomas_vomito_diarreia || "Não",
        apetite_normal: data.apetite_normal || "Sim",
        em_tratamento: data.em_tratamento || "Não",
        qual_tratamento: data.qual_tratamento || null,
        observacoes: data.observacoes || null,
        possui_responsavel: data.possui_responsavel === "Sim" ? "Sim" : "Não",
        endereco_recolhimento: data.endereco_recolhimento || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar animal:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAnimal(id) {
  try {
    await prisma.animal.delete({ where: { id: String(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir animal:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// PROCEDIMENTOS  (tabela: cadastro_procedimento)
// ─────────────────────────────────────────────────────────────
export async function createProcedimento(data) {
  try {
    const record = await prisma.cadastro_procedimento.create({
      data: {
        id: randomUUID(),
        animal_id: data.animal_id,
        tipo: data.tipo,
        data_procedimento: new Date(data.data_procedimento),
        veterinario: data.veterinario || null,
        status: data.status || "Realizado",
        descricao: data.descricao || null,
        medicacao_prescrita: data.medicacao_prescrita || null,
        data_retorno: data.data_retorno ? new Date(data.data_retorno) : null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao criar procedimento:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProcedimento(id, data) {
  try {
    const record = await prisma.cadastro_procedimento.update({
      where: { id: String(id) },
      data: {
        animal_id: data.animal_id,
        tipo: data.tipo,
        data_procedimento: new Date(data.data_procedimento),
        veterinario: data.veterinario || null,
        status: data.status || "Realizado",
        descricao: data.descricao || null,
        medicacao_prescrita: data.medicacao_prescrita || null,
        data_retorno: data.data_retorno ? new Date(data.data_retorno) : null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar procedimento:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProcedimento(id) {
  try {
    await prisma.cadastro_procedimento.delete({ where: { id: String(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir procedimento:", error);
    return { success: false, error: error.message };
  }
}

export async function getProcedimentosByAnimal(animalId) {
  try {
    return await prisma.cadastro_procedimento.findMany({
      where: { animal_id: String(animalId) },
      orderBy: { data_procedimento: "desc" },
    });
  } catch (error) {
    console.error("Erro ao buscar procedimentos:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// DENÚNCIAS DE CÃO AGRESSIVO
// ─────────────────────────────────────────────────────────────
export async function createDenuncia(data) {
  try {
    const record = await prisma.denuncia_cao_agressivo.create({
      data: {
        id: randomUUID(),
        localizacao: data.localizacao,
        descricao_cao: data.descricao_cao,
        relato: data.relato,
        animal_id: data.animal_id || null,
        causou_risco: data.causou_risco || "Não",
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDenuncia(id, data) {
  try {
    const record = await prisma.denuncia_cao_agressivo.update({
      where: { id: String(id) },
      data: {
        localizacao: data.localizacao,
        descricao_cao: data.descricao_cao,
        relato: data.relato,
        animal_id: data.animal_id || null,
        causou_risco: data.causou_risco || "Não",
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDenuncia(id) {
  try {
    await prisma.denuncia_cao_agressivo.delete({ where: { id: String(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir denúncia:", error);
    return { success: false, error: error.message };
  }
}
