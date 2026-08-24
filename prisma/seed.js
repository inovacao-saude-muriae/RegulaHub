require("dotenv").config(); // Carrega o DATABASE_URL do arquivo .env
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
  const cpfAdmin = "12912453674";
  const NOME_ADMIN = "Jefinny de Paula Dias Souza";

  // 1. Criptografa a senha diretamente
  const senhaHash = await bcrypt.hash("regula@saude_2026", 10);

  // 2. Mapeia a tabela 'user' ou 'users' de forma segura
  const userModel = prisma.user || prisma.users;

  if (!userModel) {
    throw new Error(
      "O modelo User não foi encontrado no Prisma Client. Execute 'npx prisma generate'."
    );
  }

  // 3. Atualiza ou cria o Usuário ADMIN diretamente pela tabela User
  const adminUser = await userModel.upsert({
    where: { cpf: cpfAdmin },
    update: {
      nome: NOME_ADMIN,
      senhaHash: senhaHash,
      role: "ADMIN",
      cargo: "Gestor Geral do Sistema",
      ativo: true,
    },
    create: {
      cpf: cpfAdmin,
      nome: NOME_ADMIN,
      senhaHash: senhaHash,
      cargo: "Gestor Geral do Sistema",
      role: "ADMIN",
      ativo: true,
    },
  });

  console.log("✅ Usuário ADMIN configurado/atualizado com sucesso!");
  console.log(`👤 Nome: ${adminUser.nome}`);
  console.log(`🆔 CPF/Login: ${adminUser.cpf}`);
  console.log(`🔑 Permissão: ${adminUser.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao atualizar senha:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });