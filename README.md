# Portal Imobiliário Premium — Portugal & Angola

Monorepo da plataforma PropTech transfronteiriça focada no mercado de luxo de Portugal e Angola.

## Arquitetura do Monorepo

```
portal-imobiliario-premium/
├── apps/
│   ├── web/                 # Next.js 14 — Frontend B2C & Dashboards
│   └── api/                 # Node.js + Express + Prisma — REST API
├── packages/
│   ├── ui/                  # Design System compartilhado
│   └── database/            # Prisma ORM + Schema PostgreSQL/PostGIS
├── docker-compose.yml       # Orquestração completa (Postgres + Redis + API + Web)
├── turbo.json
└── pnpm-workspace.yaml
```

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS |
| **Mapas** | Mapbox GL JS / react-map-gl |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL 16 + PostGIS (Docker) / SQLite (dev local) |
| **Cache** | Redis 7 |
| **ORM** | Prisma |
| **Auth** | JWT (preparado para OAuth2) |
| **Validação** | Zod |

## Paleta Visual — Quiet Luxury (60/30/10)

- **60%** `cream-100` (#FAFAF8) — superfície, respiro editorial
- **30%** `olive-500` (#3D4A3A) — estrutura, navegação, autoridade
- **10%** `accent` (#CC7722) — CTAs, conversão, destaques

## Como Executar

### Opção 1: Docker Compose (Recomendado — Produção-like)

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado

```bash
# 1. Configurar variáveis
 cp apps/web/.env.example apps/web/.env.local
# Editar NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN se necessário

# 2. Subir toda a stack
 docker-compose up --build

# 3. Em outro terminal, gerar schema e seed
 docker exec -it portal-api sh
 cd packages/database && npx prisma migrate dev --name init && npx prisma db seed
```

Acessar:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- API Metadata: `http://localhost:3001/api/$metadata`
- Prisma Studio: `docker exec -it portal-api sh -c "cd packages/database && npx prisma studio"`

### Opção 2: Desenvolvimento Local (SQLite — rápido)

```bash
# 1. Instalar dependências
 pnpm install

# 2. Gerar Prisma Client
 pnpm db:generate

# 3. Criar base SQLite e aplicar schema
 cd packages/database
 npx prisma migrate dev --name init

# 4. Popular com dados
 pnpm db:seed

# 5. Terminal 1 — Backend API
 cd apps/api
 pnpm dev              # http://localhost:3001

# 6. Terminal 2 — Frontend
 cd apps/web
 pnpm dev              # http://localhost:3000
```

### Scripts Úteis

```bash
pnpm dev              # Turbo: sobe tudo em paralelo (requer configuração)
pnpm api:dev          # Apenas backend
pnpm web:dev          # Apenas frontend
pnpm db:generate      # Gerar cliente Prisma
pnpm db:migrate       # Criar migração
pnpm db:seed          # Popular dados
pnpm db:studio        # Prisma Studio GUI
```

## Funcionalidades Implementadas

### Fase 1 — Núcleo Transacional & Visual ✅

| Módulo | Status |
|--------|--------|
| Landing Page (Z-pattern) | ✅ Hero, diferenciais, simuladores |
| Map-First Interativo | ✅ Mapbox GL, split-screen, mobile drawer |
| PDP com Z-pattern | ✅ Galeria, features, agente, simulador integrado |
| Simuladores Fiscais | ✅ IMT Jovem (PT) + IPU/Sisa (AO) via API |
| Lead Generation | ✅ Simulações convertem em leads automaticamente |
| Autenticação JWT | ✅ Login/registo/me com roles |
| Painéis RBAC | ✅ Admin, Agente, Proprietário protegidos |
| Design System | ✅ Quiet Luxury, Tailwind, tipografia editorial |

### Fase 1.5 — Infraestrutura de Dados ✅

| Módulo | Status |
|--------|--------|
| Prisma ORM | ✅ Schema completo (User, Property, Lead, Simulation, Document, Valuation) |
| PostgreSQL + PostGIS | ✅ Preparado via Docker Compose |
| Redis | ✅ Cache/session preparado |
| Serialização BigInt | ✅ Middleware global para PostgreSQL |
| Seed Automático | ✅ Dados de demo PT + AO |

## Roadmap

### Fase 2 — Disrupção Algorítmica (Próximo trimestre)
- [ ] Motor NLP/NER (AMÁLIA/EuroLLM) para pesquisa semântica
- [ ] AVM — Automated Valuation Model com regressão hedónica real
- [ ] Deteção de deepfakes e fraudes documentais
- [ ] Digital Twins (Matterport/Floorfy) na PDP
- [ ] Walk Score API + Análise de Sentimento de bairro
- [ ] Upload de documentos (S3/MinIO) no Property Passport

### Fase 3 — PropTech Avançado & Monetização
- [ ] Agentic AI — assistente autónomo
- [ ] Blockchain — registo de títulos (Angola)
- [ ] Open Finance / PSD2 — scoring transfronteiriço
- [ ] Escrow fiduciário — retenção de fundos
- [ ] DaaS (Data as a Service) — relatórios para instituições

---

**Nota:** Este projeto está em desenvolvimento ativo. A estrutura segue as especificações do Relatório Exaustivo de Viabilidade, Arquitetura Tecnológica e UX/UI (2026-2027).
