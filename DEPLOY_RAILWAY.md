# 🚀 Deploy no Railway — Guia Passo-a-Passo

> **Custo:** ~$0-5/mês (PostgreSQL é gratuito no Railway Starter Plan)
> **Tempo estimado:** 15-20 minutos

---

## 1. Prepara o Código (faz isto agora)

### 1.1 Commit das alterações

```bash
git add .
git commit -m "chore: configuração para deploy no Railway (PostgreSQL + Docker)"
git push origin main
```

> ⚠️ **IMPORTANTE:** O Railway faz deploy a partir do GitHub. Precisas que o código esteja no repo remoto.

---

## 2. Cria os Serviços no Railway

Vai a [railway.com](https://railway.com) → Project `upbeat-unity`

### 2.1 Adicionar PostgreSQL

1. Clica no botão **"New"** ou **"Add"**
2. Escolhe **Database** → **Add PostgreSQL**
3. Railway cria automaticamente uma base de dados PostgreSQL
4. Clica na base de dados → separador **Connect**
5. Copia a variável `DATABASE_URL` (vai precisar dela)

### 2.2 Adicionar Serviço da API

1. Clica em **New** → **GitHub Repository**
2. Seleciona o teu repo `PORTAL IMOBILIARIO`
3. Escolhe o **branch** `main`
4. Clica na engrenagem ⚙️ do serviço
5. Em **Root Directory**, deixa em branco (raiz do repo)
6. Em **Builder**, escolhe **Dockerfile**
7. Em **Dockerfile Path**, escreve: `apps/api/Dockerfile`
8. Clica em **Deploy**

### 2.3 Adicionar Serviço do Frontend (Web)

1. Clica em **New** → **GitHub Repository**
2. Seleciona o mesmo repo
3. Clica na engrenagem ⚙️ do serviço
4. Em **Root Directory**, deixa em branco
5. Em **Builder**, escolhe **Dockerfile**
6. Em **Dockerfile Path**, escreve: `apps/web/Dockerfile`
7. Clica em **Deploy**

---

## 3. Configurar Variáveis de Ambiente

### 3.1 Variáveis do Serviço API

Vai ao serviço **API** → separador **Variables** → **Raw Editor**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}   # Railway preenche automaticamente
JWT_SECRET=troca-isto-por-32-caracteres-aleatorios
FRONTEND_URL=                  # deixa vazio por agora, preenches depois
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> 💡 **Dica:** Para `JWT_SECRET`, gera uma string segura:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.2 Variáveis do Serviço Web

Vai ao serviço **Web** → separador **Variables** → **Raw Editor**

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=           # deixa vazio por agora, preenches depois
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...
```

---

## 4. Gerar URL pública e configurar CORS

### 4.1 API — Dominio público

1. Vai ao serviço **API** → separador **Settings**
2. Clica em **Generate Domain**
3. Railway gera algo como: `https://portal-api.up.railway.app`
4. Copia este URL

### 4.2 Web — Dominio público

1. Vai ao serviço **Web** → separador **Settings**
2. Clica em **Generate Domain**
3. Railway gera algo como: `https://portal-web.up.railway.app`
4. Copia este URL

### 4.3 Atualizar as variáveis cruzadas

**No serviço API:**
```env
FRONTEND_URL=https://portal-web.up.railway.app
```

**No serviço Web:**
```env
NEXT_PUBLIC_API_URL=https://portal-api.up.railway.app
```

> ⚠️ **Rebuild necessário:** Depois de alterar `NEXT_PUBLIC_*` variáveis, tens de fazer **redeploy** do serviço Web (Railway não reage automaticamente a env vars de build).

---

## 5. Migrar a Base de Dados (primeiro deploy)

### 5.1 Abrir consola no serviço API

1. Vai ao serviço **API** → separador **Deployments**
2. Clica no deploy ativo → **Logs**
3. Ou melhor: vai a **Settings** → **Deploy** → abre o **Railway CLI** ou usa o botão **"Shell"** no dashboard

### 5.2 Executar migrações e seed

Dentro do container da API:

```bash
# Gerar Prisma Client
npx prisma generate --schema=packages/database/prisma/schema.prisma

# Aplicar migrações
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

# Seed da base de dados (opcional — para ter dados demo)
npx tsx apps/api/src/lib/seed-db.ts
```

> 💡 Alternativa: Cria um script `db:migrate` no package.json da API.

---

## 6. Verificar se está tudo OK

### 6.1 Testar API

```bash
curl https://portal-api.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portalpremium.pt","password":"password123"}'
```

Deve retornar um JSON com `token`.

### 6.2 Testar Frontend

Abre `https://portal-web.up.railway.app` no browser e tenta fazer login.

---

## 7. Domínio Personalizado (opcional)

Se queres um domínio tipo `portalpremium.pt`:

1. Vai ao serviço **Web** → **Settings** → **Custom Domain**
2. Adiciona o teu domínio
3. Railway dá-te um registo CNAME — adiciona no teu DNS (Cloudflare, Namecheap, etc.)
4. Faz o mesmo para a API se quiseres separado, ou usa o mesmo domínio com `/api/*` (mas isso requer Nginx — vê VPS)

---

## 8. Stripe Webhooks (para pagamentos funcionarem)

1. Vai ao [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Cria um novo endpoint:
   - URL: `https://portal-api.up.railway.app/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`
3. Copia o **Signing secret** (`whsec_...`)
4. Coloca no serviço API como `STRIPE_WEBHOOK_SECRET`

---

## 📊 Estimativa de Custos Railway

| Serviço | Custo |
|---------|-------|
| PostgreSQL | **$0** (Starter Plan — grátis) |
| API (512MB RAM) | **~$2-3/mês** |
| Web (512MB RAM) | **~$2-3/mês** |
| **Total** | **~$5/mês** |

> Com os teus $4.06 atuais, dá para correr **~16 dias** sem pagar nada extra.

---

## 🛠 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Build failed" no Railway | Verifica os logs do build. Provavelmente falta `pnpm-lock.yaml` no repo. |
| "CORS error" no browser | Confirma que `FRONTEND_URL` está correto no serviço API. |
| "Database does not exist" | Executa `npx prisma migrate deploy` manualmente na consola da API. |
| "PORT already in use" | Railway define `PORT` automaticamente. O código já lê `process.env.PORT`. |
| Imagens/uploads não aparecem | Usa Railway Volumes ou muda para S3 (Cloudflare R2 grátis). |

---

## 🔄 Deploys Futuros

Depois de configurado, basta fazer push para o `main`:

```bash
git push origin main
```

O Railway faz deploy automático de ambos os serviços!
