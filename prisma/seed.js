require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

if (!process.env.DATABASE_URL) {
  console.error("❌ ERRO: A variável DATABASE_URL não foi encontrada no arquivo .env");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ═══════════════════════════════════════════════════════════════════════
  // USUÁRIO GESTOR PRINCIPAL (usa variáveis de ambiente)
  // ═══════════════════════════════════════════════════════════════════════
  
  const cpfGestor = process.env.GESTOR_CPF || "00000000000";
  const nomeGestor = process.env.GESTOR_NOME || "Gestor do Sistema";
  const senhaGestor = process.env.GESTOR_SENHA || "trocar@123";

  // ⚠️  AVISO DE SEGURANÇA
  if (!process.env.GESTOR_CPF || !process.env.GESTOR_SENHA) {
    console.warn("⚠️  ATENÇÃO: Usando credenciais padrão!");
    console.warn("   Configure GESTOR_CPF, GESTOR_NOME e GESTOR_SENHA no arquivo .env");
    console.warn("   para evitar usar valores padrão em produção.\n");
  }

  const senhaHashGestor = await bcrypt.hash(senhaGestor, 10);

  const userModel = prisma.user || prisma.users;

  if (!userModel) {
    throw new Error(
      "O modelo User não foi encontrado no Prisma Client. Execute 'npx prisma generate'."
    );
  }

  const gestorUser = await userModel.upsert({
    where: { cpf: cpfGestor },
    update: {
      nome: nomeGestor,
      senhaHash: senhaHashGestor,
      role: "GESTOR",  // ✅ Atualizado para novo enum
      cargo: "Gestor Geral do Sistema",
      ativo: true,
    },
    create: {
      cpf: cpfGestor,
      nome: nomeGestor,
      senhaHash: senhaHashGestor,
      cargo: "Gestor Geral do Sistema",
      role: "GESTOR",  // ✅ Atualizado para novo enum
      ativo: true,
    },
  });

  console.log("✅ Usuário GESTOR configurado com sucesso!");
  console.log(`👤 Nome: ${gestorUser.nome}`);
  console.log(`🆔 CPF/Login: ${gestorUser.cpf}`);
  console.log(`🔑 Senha: ${senhaGestor}`);
  console.log(`🎯 Permissão: ${gestorUser.role} (Acesso Total)\n`);

  // ═══════════════════════════════════════════════════════════════════════
  // USUÁRIOS DE EXEMPLO (OPCIONAL - descomentar se precisar)
  // ═══════════════════════════════════════════════════════════════════════
  
  /*
  const senhaExemplo = await bcrypt.hash("senha123", 10);

  // Regulação Admin
  await userModel.upsert({
    where: { cpf: "11111111111" },
    update: { senhaHash: senhaExemplo, role: "REGULACAO_ADMIN", ativo: true },
    create: {
      cpf: "11111111111",
      nome: "Admin Regulação Exemplo",
      senhaHash: senhaExemplo,
      cargo: "Coordenador de Regulação",
      role: "REGULACAO_ADMIN",
      ativo: true,
    },
  });

  // Regulação Comum
  await userModel.upsert({
    where: { cpf: "22222222222" },
    update: { senhaHash: senhaExemplo, role: "REGULACAO_COMUM", ativo: true },
    create: {
      cpf: "22222222222",
      nome: "Operador Regulação Exemplo",
      senhaHash: senhaExemplo,
      cargo: "Auxiliar de Regulação",
      role: "REGULACAO_COMUM",
      ativo: true,
    },
  });

  console.log("✅ Usuários de exemplo criados!");
  console.log("📝 CPF: 11111111111 | Senha: senha123 | Role: REGULACAO_ADMIN");
  console.log("📝 CPF: 22222222222 | Senha: senha123 | Role: REGULACAO_COMUM\n");
  */

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });