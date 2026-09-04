"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

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

    // 1. Busca o usuário diretamente na tabela User pelo CPF
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

    // 3. Gera JWT assinado com informações do usuário
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas de sessão
    
    const token = await new SignJWT({
      userId: user.cpf,
      role: user.role,
      nome: user.nome,
      cargo: user.cargo
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    // 4. Salva a sessão no banco
    await prisma.session.create({
      data: {
        userId: user.cpf,
        token,
        expiresAt,
      },
    });

    // 5. Atualiza o registro do último acesso
    await prisma.user.update({
      where: { cpf: user.cpf },
      data: { ultimoAcesso: new Date() },
    });

    // 6. Salva o Cookie HTTP-Only com o JWT
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