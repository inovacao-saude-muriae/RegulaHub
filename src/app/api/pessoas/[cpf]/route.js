import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ou o caminho da sua instância do Prisma

export async function GET(request, { params }) {
  try {
    const { cpf } = await params;

    const pessoa = await prisma.pessoa.findUnique({
      where: { cpf },
      select: {
        cpf: true,
        nomeCompleto: true,
        dataNascimento: true,
        nomeMae: true,
        telefone: true,
        sexo: true,
      },
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada no banco de dados' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pessoa }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}