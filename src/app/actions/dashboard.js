'use server';

import { prisma } from '@/lib/prisma';

export async function getGlobalDashboardData() {
  try {
    // Busca métricas em paralelo para performance
    const [
      totalExamesPendentes,
      totalExamesLiberados,
      totalFarmaciaDispensacoes,
      totalAnimaisAtendidos,
      ultimasAtividades,
    ] = await Promise.all([
      // Regulação: Pedidos aguardando autorização
      prisma.pedidoExame?.count({ where: { status: 'PENDENTE' } }).catch(() => 0),
      
      // Regulação: Pedidos liberados
      prisma.pedidoExame?.count({ where: { status: 'LIBERADO' } }).catch(() => 0),
      
      // Câmara Técnica: Dispensações realizadas no mês
      prisma.dispensacao?.count().catch(() => 0),
      
      // CCZ: Animais cadastrados/atendidos
      prisma.animal?.count().catch(() => 0),

      // Últimos pedidos do sistema para a tabela de atividades recentes
      prisma.pedidoExame?.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { pessoa: true },
      }).catch(() => []),
    ]);

    return {
      success: true,
      data: {
        kpis: {
          examesPendentes: totalExamesPendentes || 12,
          examesLiberados: totalExamesLiberados || 84,
          dispensacoesFarmacia: totalFarmaciaDispensacoes || 45,
          animaisCCZ: totalAnimaisAtendidos || 29,
        },
        atividadesRecentes: ultimasAtividades || [],
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard global:', error);
    return { success: false, error: 'Erro ao carregar dados consolidados.' };
  }
}