# 👥 Estrutura de Cargos e Permissões - RegulaHub

## 📋 Visão Geral

Sistema de permissões baseado em **cargos (roles)** onde cada usuário tem um cargo específico que determina quais módulos ele pode acessar.

---

## 🎯 Princípios

1. **Isolamento por Módulo**: Usuários de um módulo NÃO veem outros módulos
2. **Hierarquia Clara**: Cada módulo tem admin e usuários comuns
3. **Gestor Universal**: Cargo especial que acessa TUDO
4. **CPF como Login**: Identificação única por CPF

---

## 👔 Cargos Disponíveis

### 🌟 GESTOR (Acesso Total)
**Cargo:** `GESTOR`  
**Acesso:** TODOS os módulos do sistema  
**Descrição:** Superintendente ou gestor geral da secretaria

```
✅ Regulação (tudo, incluindo financeiro)
✅ Câmara Técnica - Farmácia
✅ Câmara Técnica - Processos
✅ Junta Reguladora (todos os serviços)
✅ CCZ
✅ Dashboard
```

---

### 💉 MÓDULO REGULAÇÃO

#### 👨‍💼 Admin da Regulação
**Cargo:** `REGULACAO_ADMIN`  
**Acesso:**
- ✅ Todas as funcionalidades da Regulação
- ✅ **Financeiro** (cotas, teto financeiro)
- ✅ Pacientes, Médicos, UBS
- ✅ Pedidos de exames
- ✅ Dashboard

#### 👤 Usuário Comum da Regulação
**Cargo:** `REGULACAO_COMUM`  
**Acesso:**
- ✅ Funcionalidades básicas da Regulação
- ❌ **NÃO acessa Financeiro**
- ✅ Pacientes, Médicos, UBS
- ✅ Pedidos de exames
- ✅ Dashboard

**Diferença:** Comum não vê `/regulacao/financeiro`

---

### 🏛️ MÓDULO CÂMARA TÉCNICA

#### 💊 Farmácia Judicial
**Cargo:** `FARMACIA_ADMIN`  
**Acesso:**
- ✅ **APENAS** módulo de Farmácia Judicial
- ❌ NÃO acessa outros módulos
- ✅ Pacientes judiciais
- ✅ Medicamentos e lotes
- ✅ Dispensação
- ✅ Dashboard

#### 📄 Processos
**Cargo:** `PROCESSO_ADMIN`  
**Acesso:**
- ✅ **APENAS** módulo de Processos
- ❌ NÃO acessa outros módulos
- ✅ Gestão de processos administrativos
- ✅ Dashboard

---

### 👨‍⚕️ MÓDULO JUNTA REGULADORA

#### 🔧 Admin da Junta
**Cargo:** `JUNTA_ADMIN`  
**Acesso:**
- ✅ **TODOS** os serviços da Junta
- ✅ CAEE
- ✅ Educação
- ✅ Saúde
- ✅ Assistência Social
- ✅ Outros serviços
- ✅ Dashboard

#### 🎓 Serviço CAEE
**Cargo:** `JUNTA_CAEE`  
**Acesso:**
- ✅ **APENAS** serviço CAEE
- ❌ NÃO acessa outros serviços
- ✅ Pacientes do CAEE
- ✅ Atendimentos do CAEE
- ✅ Dashboard

#### 📚 Serviço Educação
**Cargo:** `JUNTA_EDUCACAO`  
**Acesso:**
- ✅ **APENAS** serviço Educação
- ❌ NÃO acessa outros serviços
- ✅ Pacientes da Educação
- ✅ Atendimentos da Educação
- ✅ Dashboard

#### 🏥 Serviço Saúde
**Cargo:** `JUNTA_SAUDE`  
**Acesso:**
- ✅ **APENAS** serviço Saúde
- ❌ NÃO acessa outros serviços
- ✅ Pacientes da Saúde
- ✅ Atendimentos da Saúde
- ✅ Dashboard

#### 🤝 Serviço Assistência Social
**Cargo:** `JUNTA_ASSISTENCIA`  
**Acesso:**
- ✅ **APENAS** serviço Assistência
- ❌ NÃO acessa outros serviços
- ✅ Pacientes da Assistência
- ✅ Atendimentos da Assistência
- ✅ Dashboard

---

### 🐕 MÓDULO CCZ

#### 🔬 Admin do CCZ
**Cargo:** `CCZ_ADMIN`  
**Acesso:**
- ✅ **APENAS** módulo CCZ
- ❌ NÃO acessa outros módulos
- ✅ Tutores e Animais
- ✅ Procedimentos veterinários
- ✅ Notificações de zoonoses
- ✅ Denúncias
- ✅ Esporotricose
- ✅ Dashboard

---

## 📊 Tabela Resumo de Permissões

| Cargo | Regulação | Financeiro | Farmácia | Processos | Junta | CCZ | Dashboard |
|-------|-----------|------------|----------|-----------|-------|-----|-----------|
| **GESTOR** | ✅ | ✅ | ✅ | ✅ | ✅ Todos | ✅ | ✅ |
| **REGULACAO_ADMIN** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **REGULACAO_COMUM** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **FARMACIA_ADMIN** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **PROCESSO_ADMIN** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **JUNTA_ADMIN** | ❌ | ❌ | ❌ | ❌ | ✅ Todos | ❌ | ✅ |
| **JUNTA_CAEE** | ❌ | ❌ | ❌ | ❌ | ✅ CAEE | ❌ | ✅ |
| **JUNTA_EDUCACAO** | ❌ | ❌ | ❌ | ❌ | ✅ Educação | ❌ | ✅ |
| **JUNTA_SAUDE** | ❌ | ❌ | ❌ | ❌ | ✅ Saúde | ❌ | ✅ |
| **JUNTA_ASSISTENCIA** | ❌ | ❌ | ❌ | ❌ | ✅ Assistência | ❌ | ✅ |
| **CCZ_ADMIN** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 💡 Exemplos Práticos

### Exemplo 1: Maria - Regulação Comum
```
CPF: 12345678901
Nome: Maria Silva
Cargo: REGULACAO_COMUM

✅ PODE:
- Acessar /regulacao
- Cadastrar pacientes
- Criar pedidos de exames
- Ver médicos e UBS
- Ver dashboard

❌ NÃO PODE:
- Acessar /regulacao/financeiro
- Ver cotas financeiras
- Acessar CCZ, Farmácia, Junta, etc.
```

### Exemplo 2: João - Admin da Regulação
```
CPF: 98765432100
Nome: João Santos
Cargo: REGULACAO_ADMIN

✅ PODE:
- TUDO que Maria pode
- Acessar /regulacao/financeiro
- Gerenciar cotas financeiras
- Ver relatórios financeiros

❌ NÃO PODE:
- Acessar CCZ, Farmácia, Junta, etc.
```

### Exemplo 3: Ana - CAEE (Junta)
```
CPF: 11122233344
Nome: Ana Costa
Cargo: JUNTA_CAEE

✅ PODE:
- Acessar /junta-reguladora
- Acessar /junta-reguladora/caee
- Ver pacientes do CAEE
- Registrar atendimentos do CAEE
- Ver dashboard

❌ NÃO PODE:
- Acessar /junta-reguladora/educacao
- Acessar /junta-reguladora/saude
- Acessar outros serviços
- Acessar Regulação, CCZ, etc.
```

### Exemplo 4: Carlos - Gestor
```
CPF: 55566677788
Nome: Carlos Oliveira
Cargo: GESTOR

✅ PODE:
- ACESSAR TUDO!
- Todos os módulos
- Todas as funcionalidades
- Ver tudo de todos os setores
```

---

## 🔒 Implementação de Segurança

### No Middleware (`src/middleware.js`)
```javascript
// Rotas específicas com permissões
PERMISSOES_ROTAS = {
  "/regulacao": ["GESTOR", "REGULACAO_ADMIN", "REGULACAO_COMUM"],
  "/regulacao/financeiro": ["GESTOR", "REGULACAO_ADMIN"],
  "/camara-tecnica/farmacia": ["GESTOR", "FARMACIA_ADMIN"],
  "/junta-reguladora/caee": ["GESTOR", "JUNTA_ADMIN", "JUNTA_CAEE"],
  // etc...
}
```

### No Banco de Dados (`prisma/schema.prisma`)
```prisma
enum Role {
  GESTOR
  REGULACAO_ADMIN
  REGULACAO_COMUM
  FARMACIA_ADMIN
  PROCESSO_ADMIN
  JUNTA_ADMIN
  JUNTA_CAEE
  JUNTA_EDUCACAO
  JUNTA_SAUDE
  JUNTA_ASSISTENCIA
  CCZ_ADMIN
}
```

---

## 🚀 Como Criar Usuários

### Via Seed (prisma/seed.js)
```javascript
// Gestor
await prisma.user.create({
  data: {
    cpf: "12345678901",
    nome: "Gestor Geral",
    senhaHash: await bcrypt.hash("senha123", 10),
    cargo: "Gestor da Secretaria",
    role: "GESTOR",
  }
});

// Admin Regulação
await prisma.user.create({
  data: {
    cpf: "98765432100",
    nome: "Admin Regulação",
    senhaHash: await bcrypt.hash("senha123", 10),
    cargo: "Coordenador de Regulação",
    role: "REGULACAO_ADMIN",
  }
});

// Comum Regulação
await prisma.user.create({
  data: {
    cpf: "11122233344",
    nome: "Operador Regulação",
    senhaHash: await bcrypt.hash("senha123", 10),
    cargo: "Auxiliar de Regulação",
    role: "REGULACAO_COMUM",
  }
});

// CAEE
await prisma.user.create({
  data: {
    cpf: "55566677788",
    nome: "Coordenador CAEE",
    senhaHash: await bcrypt.hash("senha123", 10),
    cargo: "Coordenador do CAEE",
    role: "JUNTA_CAEE",
  }
});
```

---

## 🔄 Migração do Banco

Após atualizar o schema:

```powershell
# 1. Gerar migration
npx prisma migrate dev --name atualiza_roles

# 2. Aplicar no banco
npx prisma migrate deploy

# 3. Gerar Prisma Client
npx prisma generate

# 4. Rodar seed (opcional)
npx prisma db seed
```

---

## ⚠️ IMPORTANTE

### Atualizar Usuários Existentes

Se você já tem usuários no banco com roles antigas:

```sql
-- Executar no Supabase SQL Editor:

-- Atualizar roles antigas para novas
UPDATE users SET role = 'REGULACAO_ADMIN' WHERE role = 'ADMIN_REGULA';
UPDATE users SET role = 'REGULACAO_COMUM' WHERE role = 'OPERADOR_REGULA';
UPDATE users SET role = 'JUNTA_ADMIN' WHERE role = 'ADMIN_JUNTA';
UPDATE users SET role = 'CCZ_ADMIN' WHERE role = 'VETERINARIO';
UPDATE users SET role = 'FARMACIA_ADMIN' WHERE role = 'ADMIN_FARMACIA';
UPDATE users SET role = 'PROCESSO_ADMIN' WHERE role = 'ADMIN_PROCESSO';

-- Criar usuário GESTOR se não existir
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '00000000000',
  'Gestor do Sistema',
  '$2a$10$...', -- hash da senha
  'Gestor Geral',
  'GESTOR',
  true
);
```

---

## 📞 Dúvidas Comuns

### P: Um usuário pode ter múltiplos cargos?
**R:** Não. Cada usuário tem apenas 1 cargo. Se precisar acessar múltiplos módulos, use o cargo GESTOR.

### P: Como adicionar um novo serviço na Junta?
**R:** 
1. Adicionar role no enum (ex: `JUNTA_TRANSPORTE`)
2. Adicionar rota no middleware
3. Criar rota específica no app

### P: Usuário comum da regulação pode virar admin?
**R:** Sim, basta atualizar o campo `role` no banco de dados.

### P: O que acontece se tentar acessar sem permissão?
**R:** Redireciona para `/acesso-negado` mostrando mensagem apropriada.

---

**Criado em:** Setembro 3, 2026  
**Última atualização:** Setembro 3, 2026  
**Versão:** 2.0.0 (Nova estrutura de cargos)
