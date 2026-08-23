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
  const NOVA_SENHA = "regula@saude_2026";

  // 1. Busca ou cria a Pessoa
  let pessoa = await prisma.pessoa.findUnique({ where: { cpf: cpfAdmin } });

  if (!pessoa) {
    pessoa = await prisma.pessoa.create({
      data: {
        cpf: cpfAdmin,
        nomeCompleto: "Jefinny de Paula Dias Souza",
        dataNascimento: new Date("1993-12-26"),
        nomeMae: "Sirlei Maria de Paula",
        telefone: "32998265629",
        sexo: "Feminino",
      },
    });
    console.log("👤 Cadastro de Pessoa criado.");
  }

  // 2. Criptografa a nova senha
  const senhaHash = await bcrypt.hash(NOVA_SENHA, 10);

  // 3. Mapeia a tabela 'user' ou 'users' de forma segura
  const userModel = prisma.user || prisma.users;

  if (!userModel) {
    throw new Error(
      "O modelo User não foi encontrado no Prisma Client. Execute 'npx prisma generate'."
    );
  }

  // 4. Atualiza ou cria o Usuário com a nova senha
  await userModel.upsert({
    where: { pessoaCpf: cpfAdmin },
    update: {
      senhaHash: senhaHash,
    },
    create: {
      pessoaCpf: pessoa.cpf,
      senhaHash: senhaHash,
      cargo: "Gestor do Sistema",
      role: "ADMIN",
      ativo: true,
    },
  });

  console.log("✅ Usuário ADMIN configurado/atualizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao atualizar senha:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });