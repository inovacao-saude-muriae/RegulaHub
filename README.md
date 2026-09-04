# 🏥 RegulaHub - ERP para Saúde Pública

Sistema integrado de gestão para saúde pública, desenvolvido com Next.js 16 e React 19, integrando múltiplos módulos essenciais para a administração municipal.

## 🎯 Módulos do Sistema

- **💉 Regulação de Exames** - Gerenciamento de pedidos e regulação de procedimentos médicos
- **💊 Farmácia Judicial** - Controle de medicamentos e dispensação por ordem judicial
- **👨‍⚕️ Junta Médica** - Gestão de pacientes com deficiência e atendimentos especializados
- **🐕 CCZ (Centro de Controle de Zoonoses)** - Controle de animais, tutores e doenças zoonóticas

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Copie .env.example para .env e preencha com suas credenciais

# 3. Sincronizar banco de dados
npx prisma db push

# 4. Popular com dados iniciais
npx prisma db seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📚 Documentação Completa

### 🎯 Comece Aqui
- **[INDEX_DOCUMENTACAO.md](./INDEX_DOCUMENTACAO.md)** - 📑 Índice geral (comece por aqui!)
- **[RESUMO_ANALISE.md](./RESUMO_ANALISE.md)** - 📊 Visão executiva do projeto
- **[GUIA_RAPIDO.md](./GUIA_RAPIDO.md)** - ⚡ Referência rápida para desenvolvimento

### 📖 Documentação Detalhada
- **[DOCUMENTACAO_PROJETO.md](./DOCUMENTACAO_PROJETO.md)** - 📘 Documentação completa (800+ linhas)
- **[ARQUITETURA_SISTEMA.md](./ARQUITETURA_SISTEMA.md)** - 🏗️ Arquitetura e diagramas
- **[ACOES_CORRETIVAS.md](./ACOES_CORRETIVAS.md)** - 🛠️ Plano de correções

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16.3.0 (App Router)
- **UI:** React 19.2.8
- **Linguagem:** JavaScript
- **Banco de Dados:** PostgreSQL (via Supabase)
- **ORM:** Prisma 7.9.1
- **Autenticação:** JWT (jose) + bcryptjs
- **Estilização:** CSS Modules

## 📋 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build de produção
npm start        # Servidor de produção
npm run lint     # Executar ESLint
```

### Scripts Prisma
```bash
npx prisma studio       # Interface visual do banco
npx prisma generate     # Gerar Prisma Client
npx prisma db push      # Sincronizar schema (dev)
npx prisma migrate dev  # Criar migration
npx prisma db seed      # Popular banco com dados
```

## 🔑 Perfis de Usuário

| Role | Descrição | Módulos de Acesso |
|------|-----------|-------------------|
| `ADMIN` | Administrador Geral | Todos |
| `ADMIN_REGULA` | Admin Regulação | Regulação (completo) |
| `OPERADOR_REGULA` | Operador Regulação | Regulação (operacional) |
| `VETERINARIO` | Veterinário | CCZ |
| `ADMIN_JUNTA` | Admin Junta Médica | Junta Médica (completo) |
| `OPERADOR_JUNTA` | Operador Junta | Junta Médica (operacional) |
| `ADMIN_PROCESSO` | Admin Processos | Câmara Técnica/Processos |
| `ADMIN_FARMACIA` | Admin Farmácia | Farmácia Judicial |

## ⚠️ Problemas Conhecidos

**Antes de começar a desenvolver, consulte [ACOES_CORRETIVAS.md](./ACOES_CORRETIVAS.md) para resolver:**

1. 🔐 **Middleware de autenticação incompleto** (CRÍTICO)
2. ❌ Pastas duplicadas (.claude/, .windsurf/)
3. 📛 Inconsistência de nomenclatura (junta-reguladora)
4. 🔄 Dependências duplicadas (bcrypt)

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados (obrigatório)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# JWT (obrigatório)
JWT_SECRET="seu-secret-super-seguro-aqui"

# Supabase (se usar)
NEXT_PUBLIC_SUPABASE_URL="https://projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# Ambiente
NODE_ENV="development"
```

## 📁 Estrutura do Projeto

```
RegulaHub/
├── prisma/              # Schema e migrations
├── src/
│   ├── app/            # Rotas e páginas (App Router)
│   │   ├── actions/    # Server Actions
│   │   ├── regulacao/  # Módulo Regulação
│   │   ├── ccz/        # Módulo CCZ
│   │   ├── junta-medica/ # Módulo Junta
│   │   └── camara-tecnica/ # Câmara Técnica
│   ├── components/     # Componentes React
│   ├── lib/           # Bibliotecas (Prisma, Supabase)
│   └── middleware.js  # Autenticação
├── public/            # Assets estáticos
└── .env              # Variáveis de ambiente
```

## 🧑‍💻 Desenvolvimento

### Criar Nova Página
```javascript
// src/app/minha-rota/page.js
export default function MinhaPage() {
  return <h1>Minha Página</h1>;
}
```

### Criar Server Action
```javascript
// src/app/actions/minhaAction.js
'use server';
import { prisma } from '@/lib/prisma';

export async function minhaAction(formData) {
  const data = await prisma.modelo.findMany();
  return { success: true, data };
}
```

Consulte [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) para mais exemplos.

## 🐛 Problemas Comuns

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Port 3000 already in use"
```powershell
# Matar processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Erro: "DATABASE_URL not found"
```bash
# Verificar se .env existe e está configurado
```

Mais soluções em [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) → "Resolver Problemas Comuns"

## 📖 Recursos de Aprendizado

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Como Contribuir

1. Clone o repositório
2. Leia [DOCUMENTACAO_PROJETO.md](./DOCUMENTACAO_PROJETO.md)
3. Crie uma branch: `git checkout -b feature/minha-feature`
4. Commit suas mudanças: `git commit -m 'feat: adiciona feature X'`
5. Push para a branch: `git push origin feature/minha-feature`
6. Abra um Pull Request

## 📊 Status do Projeto

- ✅ **Arquitetura:** Sólida e bem estruturada
- ✅ **Banco de Dados:** Schema completo (26 tabelas)
- ⚠️ **Segurança:** Middleware precisa ser completado
- ✅ **Documentação:** Completa (~3.100 linhas)

## 📞 Suporte

- 📚 Consulte a [documentação completa](./INDEX_DOCUMENTACAO.md)
- ⚡ Use o [guia rápido](./GUIA_RAPIDO.md) para referências
- 🔧 Veja [ações corretivas](./ACOES_CORRETIVAS.md) para problemas conhecidos

---

**Versão:** 0.1.0  
**Última atualização:** Setembro 2026  
**Licença:** Privado
