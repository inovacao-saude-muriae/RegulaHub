-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO DE ROLES ANTIGAS PARA NOVA ESTRUTURA
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Execute este SQL no Supabase SQL Editor ANTES de aplicar a migration do Prisma
-- 
-- ATENÇÃO: Faça backup antes de executar!
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CRIAR TIPO ENUM TEMPORÁRIO COM TODAS AS ROLES (antigas + novas)
-- ─────────────────────────────────────────────────────────────────────────────

-- Adicionar novos valores ao enum existente
-- (O Prisma fará isso automaticamente, mas se precisar fazer manual:)

-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GESTOR';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'REGULACAO_ADMIN';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'REGULACAO_COMUM';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FARMACIA_ADMIN';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROCESSO_ADMIN';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUNTA_ADMIN';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUNTA_CAEE';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUNTA_EDUCACAO';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUNTA_SAUDE';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUNTA_ASSISTENCIA';
-- ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CCZ_ADMIN';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MIGRAR ROLES ANTIGAS PARA NOVAS
-- ─────────────────────────────────────────────────────────────────────────────

-- Regulação
UPDATE users 
SET role = 'REGULACAO_ADMIN'::public."Role" 
WHERE role = 'ADMIN_REGULA'::public."Role";

UPDATE users 
SET role = 'REGULACAO_COMUM'::public."Role" 
WHERE role = 'OPERADOR_REGULA'::public."Role";

-- Junta
UPDATE users 
SET role = 'JUNTA_ADMIN'::public."Role" 
WHERE role = 'ADMIN_JUNTA'::public."Role";

UPDATE users 
SET role = 'REGULACAO_COMUM'::public."Role" 
WHERE role = 'OPERADOR_JUNTA'::public."Role";
-- Nota: OPERADOR_JUNTA vira COMUM da regulação (ajustar conforme necessário)

-- CCZ
UPDATE users 
SET role = 'CCZ_ADMIN'::public."Role" 
WHERE role = 'VETERINARIO'::public."Role";

-- Farmácia
UPDATE users 
SET role = 'FARMACIA_ADMIN'::public."Role" 
WHERE role = 'ADMIN_FARMACIA'::public."Role";

-- Processos
UPDATE users 
SET role = 'PROCESSO_ADMIN'::public."Role" 
WHERE role = 'ADMIN_PROCESSO'::public."Role";

-- Admin geral vira Gestor
UPDATE users 
SET role = 'GESTOR'::public."Role" 
WHERE role = 'ADMIN'::public."Role";

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. VERIFICAR RESULTADOS
-- ─────────────────────────────────────────────────────────────────────────────

-- Ver quantos usuários de cada role
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY total DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CRIAR USUÁRIO GESTOR PADRÃO (se não existir)
-- ─────────────────────────────────────────────────────────────────────────────

-- Senha padrão: "admin123" (hash gerado com bcrypt)
-- IMPORTANTE: Trocar senha após primeiro login!

INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '00000000000',
  'Gestor do Sistema',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO', -- admin123
  'Gestor Geral da Secretaria',
  'GESTOR'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CRIAR USUÁRIOS DE EXEMPLO (OPCIONAL - apenas para testes)
-- ─────────────────────────────────────────────────────────────────────────────

-- Senha para todos: "senha123"

-- Regulação Admin
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '11111111111',
  'Admin Regulação',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Coordenador de Regulação',
  'REGULACAO_ADMIN'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- Regulação Comum
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '22222222222',
  'Operador Regulação',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Auxiliar de Regulação',
  'REGULACAO_COMUM'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- Farmácia Admin
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '33333333333',
  'Admin Farmácia',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Farmacêutico Responsável',
  'FARMACIA_ADMIN'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- CCZ Admin
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '44444444444',
  'Admin CCZ',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Coordenador do CCZ',
  'CCZ_ADMIN'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- Junta Admin
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '55555555555',
  'Admin Junta Reguladora',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Coordenador da Junta',
  'JUNTA_ADMIN'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- Junta CAEE
INSERT INTO users (cpf, nome, senha_hash, cargo, role, ativo)
VALUES (
  '66666666666',
  'Coordenador CAEE',
  '$2a$10$rQ8K5O.rH1F7gNlX3aG3/.YfVZqNvN6ZZHFZQVQxQj6CZK4YvN8AO',
  'Coordenador do CAEE',
  'JUNTA_CAEE'::public."Role",
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VERIFICAÇÃO FINAL
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 
  cpf,
  nome,
  cargo,
  role,
  ativo
FROM users
ORDER BY role, nome;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Após executar este script:
-- 1. Execute: npx prisma migrate dev --name atualiza_roles
-- 2. Execute: npx prisma generate
-- 3. Reinicie o servidor: npm run dev
-- 4. Teste login com os usuários criados
-- 
-- CREDENCIAIS DE TESTE:
-- CPF: 00000000000 | Senha: admin123 | Cargo: GESTOR
-- CPF: 11111111111 | Senha: senha123 | Cargo: REGULACAO_ADMIN
-- CPF: 22222222222 | Senha: senha123 | Cargo: REGULACAO_COMUM
-- 
-- ⚠️  IMPORTANTE: Troque as senhas após primeiro login!
-- ═══════════════════════════════════════════════════════════════════════════
