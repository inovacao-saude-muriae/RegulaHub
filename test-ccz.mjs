import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  // Testa a query exata do getCCZDashboardData
  const pessoasTutoras = await prisma.pessoa.findMany({
    where: { tutor: { isNot: null } },
    include: {
      tutor: true,
      enderecos: { where: { enderecoAtual: true } },
    },
    orderBy: { nomeCompleto: 'asc' },
  });

  console.log('Pessoas com tutor encontradas:', pessoasTutoras.length);
  pessoasTutoras.forEach(p => {
    console.log(' -', p.nomeCompleto, '| CPF:', p.cpf, '| tutor:', !!p.tutor);
  });

} catch(e) {
  console.error('ERRO na query:', e.message);
} finally {
  await prisma.$disconnect();
  pool.end();
}
