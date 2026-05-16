FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@9.0.0

# Copiar arquivos de configuração
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Gerar Prisma Client
RUN cd packages/database && npx prisma generate

# Build da API
RUN cd apps/api && pnpm build

EXPOSE 3001

ENV PORT=3001
CMD ["sh", "-c", "node apps/api/dist/index.js"]
