"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData) {
  const cpf = formData.get("cpf")?.replace(/\D/g, "");
  const senha = formData.get("senha");

  if (!cpf || !senha) {
    return { success: false, error: "Preencha o CPF e a senha." };
  }

  // 1. Busca o usuário vinculado ao CPF na tabela 'pessoa'
  const user = await prisma.user.findUnique({
    where: { pessoaCpf: cpf },
    include: { pessoa: true },
  });

  if (!user || !user.ativo) {
    return { success: false, error: "Credenciais inválidas ou usuário inativo." };
  }

  // 2. Valida a senha enviada com o Hash do banco
  const senhaValida = await bcrypt.compare(senha, user.senhaHash);
  if (!senhaValida) {
    return { success: false, error: "Credenciais inválidas." };
  }

  // 3. Gera token e cria a sessão
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // Validade de 8 horas

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // 4. Registra a data/hora do último acesso
  await prisma.user.update({
    where: { id: user.id },
    data: { ultimoAcesso: new Date() },
  });

  // 5. Salva o token no Cookie HTTP-Only seguro
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return { 
    success: true, 
    role: user.role, 
    nome: user.pessoa.nomeCompleto 
  };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    cookieStore.delete("session_token");
  }

  return { success: true };
}