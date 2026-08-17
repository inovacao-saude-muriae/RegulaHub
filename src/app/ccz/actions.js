"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────
// DASHBOARD — busca tudo de uma vez
// ─────────────────────────────────────────────────────────────
export async function getCCZDashboardData() {
  try {
    const [tutores, animais, atividades, denuncias] = await Promise.all([
      prisma.cczTutor.findMany({
        where: { ativo: true },
        orderBy: { nomeCompleto: "asc" },
      }),
      prisma.cczAnimal.findMany({
        where: { ativo: true },
        include: { tutor: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cczAtividade.findMany({ orderBy: { dataAtividade: "desc" } }),
      prisma.cczDenuncia.findMany({ orderBy: { dataDenuncia: "desc" } }),
    ]);
    return { tutores, animais, atividades, denuncias };
  } catch (error) {
    console.error("Erro ao buscar dados CCZ:", error);
    return { tutores: [], animais: [], atividades: [], denuncias: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// TUTORES / USUÁRIOS
// ─────────────────────────────────────────────────────────────
export async function getTutores() {
  try {
    return await prisma.cczTutor.findMany({
      where: { ativo: true },
      include: { animais: { where: { ativo: true } } },
      orderBy: { nomeCompleto: "asc" },
    });
  } catch (error) {
    console.error("Erro ao buscar tutores:", error);
    return [];
  }
}

export async function createTutor(data) {
  try {
    const record = await prisma.cczTutor.create({
      data: {
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") || null : null,
        nomeCompleto: data.nomeCompleto,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        email: data.email || null,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || "Muriaé",
        uf: data.uf || "MG",
        cep: data.cep ? data.cep.replace(/\D/g, "") : null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao criar tutor:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTutor(id, data) {
  try {
    const record = await prisma.cczTutor.update({
      where: { id: Number(id) },
      data: {
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") || null : null,
        nomeCompleto: data.nomeCompleto,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        email: data.email || null,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || "Muriaé",
        uf: data.uf || "MG",
        cep: data.cep ? data.cep.replace(/\D/g, "") : null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar tutor:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTutor(id) {
  try {
    await prisma.cczTutor.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir tutor:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ANIMAIS
// ─────────────────────────────────────────────────────────────
export async function getAnimais() {
  try {
    return await prisma.cczAnimal.findMany({
      where: { ativo: true },
      include: { tutor: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
    return [];
  }
}

export async function createAnimal(data) {
  try {
    const record = await prisma.cczAnimal.create({
      data: {
        tutorId: Number(data.tutorId),
        nome: data.nome || null,
        especie: data.especie,
        raca: data.raca || null,
        sexo: data.sexo || null,
        cor: data.cor || null,
        dataNascimento: data.dataNascimento
          ? new Date(data.dataNascimento)
          : null,
        observacao: data.observacao || null,
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
    const record = await prisma.cczAnimal.update({
      where: { id: Number(id) },
      data: {
        tutorId: Number(data.tutorId),
        nome: data.nome || null,
        especie: data.especie,
        raca: data.raca || null,
        sexo: data.sexo || null,
        cor: data.cor || null,
        dataNascimento: data.dataNascimento
          ? new Date(data.dataNascimento)
          : null,
        observacao: data.observacao || null,
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
    await prisma.cczAnimal.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir animal:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ATIVIDADES DE CAMPO
// ─────────────────────────────────────────────────────────────
export async function createAtividade(data) {
  try {
    const record = await prisma.cczAtividade.create({
      data: {
        tipo: data.tipo,
        bairro: data.bairro,
        logradouro: data.logradouro || null,
        responsavel: data.responsavel || null,
        dataAtividade: new Date(data.dataAtividade),
        quantidadeImoveis: data.quantidadeImoveis
          ? Number(data.quantidadeImoveis)
          : null,
        status: data.status || "Concluída",
        observacao: data.observacao || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAtividade(id, data) {
  try {
    const record = await prisma.cczAtividade.update({
      where: { id: Number(id) },
      data: {
        tipo: data.tipo,
        bairro: data.bairro,
        logradouro: data.logradouro || null,
        responsavel: data.responsavel || null,
        dataAtividade: new Date(data.dataAtividade),
        quantidadeImoveis: data.quantidadeImoveis
          ? Number(data.quantidadeImoveis)
          : null,
        status: data.status,
        observacao: data.observacao || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAtividade(id) {
  try {
    await prisma.cczAtividade.delete({ where: { id: Number(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir atividade:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// VACINAÇÃO
// ─────────────────────────────────────────────────────────────
export async function createVacinacao(data) {
  try {
    const record = await prisma.cczVacinacao.create({
      data: {
        animalId: data.animalId ? Number(data.animalId) : null,
        nomeAnimal: data.nomeAnimal || null,
        especie: data.especie || null,
        tutorNome: data.tutorNome || null,
        tutorCpf: data.tutorCpf ? data.tutorCpf.replace(/\D/g, "") : null,
        bairro: data.bairro || null,
        tipoVacina: data.tipoVacina,
        dataVacinacao: new Date(data.dataVacinacao),
        proximaVacinacao: data.proximaVacinacao
          ? new Date(data.proximaVacinacao)
          : null,
        observacao: data.observacao || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao registrar vacinação:", error);
    return { success: false, error: error.message };
  }
}

export async function updateVacinacao(id, data) {
  try {
    const record = await prisma.cczVacinacao.update({
      where: { id: Number(id) },
      data: {
        animalId: data.animalId ? Number(data.animalId) : null,
        nomeAnimal: data.nomeAnimal || null,
        especie: data.especie || null,
        tutorNome: data.tutorNome || null,
        tutorCpf: data.tutorCpf ? data.tutorCpf.replace(/\D/g, "") : null,
        bairro: data.bairro || null,
        tipoVacina: data.tipoVacina,
        dataVacinacao: new Date(data.dataVacinacao),
        proximaVacinacao: data.proximaVacinacao
          ? new Date(data.proximaVacinacao)
          : null,
        observacao: data.observacao || null,
      },
    });
    revalidatePath("/ccz");
    return { success: true, data: record };
  } catch (error) {
    console.error("Erro ao atualizar vacinação:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVacinacao(id) {
  try {
    await prisma.cczVacinacao.delete({ where: { id: Number(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir vacinação:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// DENÚNCIAS
// ─────────────────────────────────────────────────────────────
export async function createDenuncia(data) {
  try {
    const record = await prisma.cczDenuncia.create({
      data: {
        tipo: data.tipo,
        descricao: data.descricao,
        bairro: data.bairro,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        denuncianteNome: data.denuncianteNome || null,
        denuncianteTelefone: data.denuncianteTelefone
          ? data.denuncianteTelefone.replace(/\D/g, "")
          : null,
        status: data.status || "Pendente",
        prioridade: data.prioridade || "Normal",
        observacao: data.observacao || null,
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
    const record = await prisma.cczDenuncia.update({
      where: { id: Number(id) },
      data: {
        tipo: data.tipo,
        descricao: data.descricao,
        bairro: data.bairro,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        denuncianteNome: data.denuncianteNome || null,
        denuncianteTelefone: data.denuncianteTelefone
          ? data.denuncianteTelefone.replace(/\D/g, "")
          : null,
        status: data.status,
        prioridade: data.prioridade,
        observacao: data.observacao || null,
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
    await prisma.cczDenuncia.delete({ where: { id: Number(id) } });
    revalidatePath("/ccz");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir denúncia:", error);
    return { success: false, error: error.message };
  }
}

