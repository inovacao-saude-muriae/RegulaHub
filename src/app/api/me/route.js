import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: { pessoa: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        nomeCompleto: session.user.pessoa.nomeCompleto,
        role: session.user.role,
        cargo: session.user.cargo || session.user.role,
        cpf: session.user.pessoaCpf,
      },
    });
  } catch (error) {
    console.error("Erro na rota /api/auth/me:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}