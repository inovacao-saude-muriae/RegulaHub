# 🔒 Segurança: Credenciais e GitHub

## ⚠️ IMPORTANTE: Arquivos e Segurança

### ✅ Arquivos SEGUROS (não vão pro GitHub)

Estes arquivos estão no `.gitignore` e **NÃO** vão para o GitHub:

```
.env              ← Suas credenciais REAIS (NUNCA commita!)
.env.local        ← Alternativa local
.env*.local       ← Qualquer .env local
```

### ⚠️ Arquivos que VÃO pro GitHub

Estes arquivos **SIM, vão** para o GitHub (mas estão seguros agora):

```
prisma/seed.js           ← USA variáveis de ambiente (seguro ✅)
.env.example             ← Template SEM valores reais (seguro ✅)
src/middleware.js        ← Sem credenciais (seguro ✅)
prisma/schema.prisma     ← Sem credenciais (seguro ✅)
```

---

## 🔐 Como Funciona Agora (Seguro)

### Arquivo `.env` (NÃO VAI PRO GITHUB)
```bash
# Suas credenciais REAIS aqui (privadas)
DATABASE_URL="postgresql://postgres:SUA_SENHA_REAL@..."
JWT_SECRET="seu-secret-real-forte-aqui"
GESTOR_CPF="12912453674"
GESTOR_NOME="Jefinny de Paula Dias Souza"
GESTOR_SENHA="regula@saude_2026"
```

### Arquivo `.env.example` (VAI PRO GITHUB)
```bash
# Template sem valores reais (público)
DATABASE_URL="postgresql://usuario:senha@host:5432/database"
JWT_SECRET="gere-um-secret-forte-aqui"
GESTOR_CPF="12912453674"
GESTOR_NOME="Jefinny de Paula Dias Souza"
GESTOR_SENHA="regula@saude_2026"
```

### Arquivo `seed.js` (VAI PRO GITHUB)
```javascript
// Lê do .env (que NÃO vai pro GitHub)
const cpfGestor = process.env.GESTOR_CPF || "00000000000";
const senhaGestor = process.env.GESTOR_SENHA || "trocar@123";
```

---

## ✅ Checklist de Segurança

Antes de fazer `git push`:

- [x] ✅ `.env` está no `.gitignore`
- [x] ✅ `seed.js` usa `process.env.*`
- [x] ✅ `.env.example` tem apenas templates
- [ ] ⚠️  Verificar se `.env` foi commitado (comando abaixo)

---

## 🔍 Como Verificar se .env Foi Commitado

```powershell
# Verificar se .env está no Git
git ls-files | Select-String ".env"

# Se aparecer ".env" (sem "example"), PROBLEMA!
# Remover com:
git rm --cached .env
git commit -m "Remove .env do repositório"
```

**Resultado esperado:** Só deve aparecer `.env.example`

---

## 🚨 E Se Eu Já Commitei o .env com Senhas?

### Opção 1: Remover do Último Commit (se não deu push)
```powershell
git rm --cached .env
git commit --amend --no-edit
```

### Opção 2: Remover do Histórico (se já deu push)
```powershell
# ⚠️  CUIDADO: Isso reescreve histórico!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (avise o time antes!)
git push origin --force --all
```

### Opção 3: Trocar TODAS as Senhas (RECOMENDADO)

Se já foi pro GitHub com senhas reais:

1. ✅ Trocar senha do banco de dados
2. ✅ Trocar JWT_SECRET
3. ✅ Trocar GESTOR_SENHA
4. ✅ Trocar chaves do Supabase
5. ✅ Remover .env do Git
6. ✅ Fazer novo commit

---

## 📝 Configuração Correta (Passo a Passo)

### 1. Adicione suas credenciais ao .env
```bash
# Edite o arquivo .env (NÃO .env.example!)
GESTOR_CPF="12912453674"
GESTOR_NOME="Jefinny de Paula Dias Souza"
GESTOR_SENHA="regula@saude_2026"
```

### 2. Rode o seed
```powershell
npx prisma db seed
```

**Saída:**
```
🌱 Iniciando seed do banco de dados...

✅ Usuário GESTOR configurado com sucesso!
👤 Nome: Jefinny de Paula Dias Souza
🆔 CPF/Login: 12912453674
🔑 Senha: regula@saude_2026
```

### 3. Verifique que .env não vai pro GitHub
```powershell
git status

# NÃO deve mostrar .env na lista
# Se mostrar, adicione ao .gitignore
```

---

## 🌐 Deploy em Produção

### Vercel / Netlify / Railway
1. Vá nas configurações do projeto
2. Adicione as variáveis de ambiente:
   ```
   DATABASE_URL=...
   JWT_SECRET=...
   GESTOR_CPF=...
   GESTOR_SENHA=...
   ```
3. Redeploy

### Docker
```dockerfile
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - GESTOR_CPF=${GESTOR_CPF}
      - GESTOR_SENHA=${GESTOR_SENHA}
```

---

## 🎯 Resumo

### ✅ O QUE ESTÁ SEGURO AGORA

1. **`.env`** não vai pro GitHub (está no `.gitignore`)
2. **`seed.js`** usa variáveis de ambiente
3. **`.env.example`** é apenas template (pode ir pro GitHub)

### ⚠️ O QUE VOCÊ PRECISA FAZER

1. **Adicionar ao .env:**
   ```bash
   GESTOR_CPF="12912453674"
   GESTOR_NOME="Jefinny de Paula Dias Souza"
   GESTOR_SENHA="regula@saude_2026"
   ```

2. **Verificar .gitignore:**
   ```bash
   cat .gitignore | grep ".env"
   # Deve ter: .env*
   ```

3. **Nunca commitar .env:**
   ```bash
   git status
   # Não deve mostrar .env
   ```

---

## 📞 Dúvidas Comuns

### P: Posso commitar .env.example?
**R:** SIM! Ele só tem templates, não valores reais.

### P: E se eu quiser valores no .env.example?
**R:** Pode, mas use valores FALSOS/EXEMPLO, não os reais!

### P: Como meu colega vai saber as credenciais?
**R:** Envie por outro canal (Slack, WhatsApp, etc), não pelo GitHub!

### P: E se eu deletar o .env por acidente?
**R:** Copie o .env.example e preencha de novo.

---

**Criado em:** Setembro 3, 2026  
**Última atualização:** Setembro 3, 2026  
**Versão:** 1.0.0
