FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages/ui ./packages/ui
COPY packages/database ./packages/database

RUN cd packages/database && npx prisma generate

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}

RUN cd apps/web && pnpm build

EXPOSE 3000

CMD ["pnpm", "--filter", "@portal/web", "start"]
