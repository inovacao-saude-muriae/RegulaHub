import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pessoaCpf, role, cargo, senha } = body;

    if (!pessoaCpf || !senha || !role) {
      return NextResponse.json(
        { error: 'CPF, Senha e Perfil são obrigatórios.' },
        { status: 400 }
      );
    }

    // Criptografa a senha do operador
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria ou atualiza a conta de usuário vinculada ao CPF
    const user = await prisma.user.upsert({
      where: { pessoaCpf },
      update: {
        role,
        cargo,
        senhaHash,
        ativo: true,
      },
      create: {
        pessoaCpf,
        role,
        cargo,
        senhaHash,
        ativo: true,
      },
    });

    return NextResponse.json(
      { message: 'Usuário cadastrado com sucesso!', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar conta de usuário' },
      { status: 500 }
    );
  }
}