import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Validação de Acesso
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

    const eAdministrador = session?.user && rolesAdministrativas.includes(session.user.role);

    if (!session || !eAdministrador) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // 2. Consulta o Tamanho Real do PostgreSQL
    const dbSizeResult = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `;
    const tamanhoBanco = dbSizeResult[0]?.size || 'Indisponível';

    // 3. Teste de Ping
    const startPing = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const endPing = performance.now();
    const pingMs = Math.round(endPing - startPing);

    // 4. Contagem de Sessões Ativas e Válidas
    const sessoesAtivas = await prisma.session.count({
      where: {
        expiresAt: { gt: new Date() },
      },
    });

    // 5. Total de Usuários Cadastrados
    const totalUsuarios = await prisma.user.count();

    // 6. Últimas Sessões Criadas no Sistema (Corrigido para usar campos reais da model User)
    const ultimosAcessos = await prisma.session.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nome: true,
            cpf: true,
            role: true,
            cargo: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 'OK',
        database: {
          status: 'ONLINE',
          pingMs,
          tamanhoBanco,
        },
        metrics: {
          sessoesAtivas,
          totalUsuarios,
        },
        logs: ultimosAcessos.map((s) => ({
          id: s.id,
          usuario: s.user?.nome || 'Usuário Sem Nome',
          role: s.user?.role || 'N/A',
          data: new Date(s.createdAt).toLocaleTimeString('pt-BR', {
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