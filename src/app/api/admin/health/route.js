import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    const rolesAdministrativas = [
      'ADMIN',
      'ADMIN_JUNTA',
      'ADMIN_REGULA',
      'ADMIN_PROCESSO',
      'ADMIN_FARMACIA',
    ];

    if (!session || !rolesAdministrativas.includes(session.user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const dbSizeResult = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `;
    const tamanhoBanco = dbSizeResult[0]?.size || 'Indisponível';

    const startPing = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const endPing = performance.now();
    const pingMs = Math.round(endPing - startPing);

    const sessoesAtivas = await prisma.session.count({
      where: { expiresAt: { gt: new Date() } },
    });

    const totalUsuarios = await prisma.user.count();

    const ultimosAcessos = await prisma.session.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: {
        user: {
          select: {
            role: true,
            pessoa: { select: { nomeCompleto: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 'OK',
        database: { status: 'ONLINE', pingMs, tamanhoBanco },
        metrics: { sessoesAtivas, totalUsuarios },
        logs: ultimosAcessos.map((s) => ({
          id: s.id,
          usuario: s.user.pessoa.nomeCompleto,
          role: s.user.role,
          data: new Date(s.expiresAt.getTime() - 8 * 60 * 60 * 1000).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro na rota de telemetria:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        database: { status: 'OFFLINE', pingMs: 0, tamanhoBanco: 'Indisponível' },
        error: error.message,
      },
      { status: 500 }
    );
  }
}