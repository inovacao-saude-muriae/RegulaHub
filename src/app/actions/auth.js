"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function loginAction(formData) {
  try {
    const cpf = formData.get("cpf")?.replace(/\D/g, "");
    const senha = formData.get("senha");

    if (!cpf || cpf.length !== 11) {
      return { error: "Informe um CPF válido com 11 dígitos." };
    }

    if (!senha) {
      return { error: "Informe a sua senha de acesso." };
    }

    // 1. Busca o operador diretamente na tabela User
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    if (!user || !user.ativo) {
      return { error: "Usuário não encontrado ou inativo no sistema." };
    }

    // 2. Valida o hash da senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return { error: "Senha incorreta. Tente novamente." };
    }

    // 3. Gera o token e cria a sessão no banco
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas de sessão

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 4. Atualiza o registro do último acesso
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    });

    // 5. Salva o Cookie HTTP-Only
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Erro na ação de login:", error);
    return { error: "Erro interno ao tentar realizar login." };
  }
}
