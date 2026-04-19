# Med Clinic

Plataforma para gestao de clinica medica com arquitetura separada entre API e aplicacao web do paciente.

O projeto cobre autenticacao JWT com refresh token, RBAC, gestao de pacientes/medicos/procedimentos/planos e fluxo de agendamentos.

## Visao Geral

- `api/`: backend REST com NestJS + Fastify, Clean Architecture e Drizzle ORM.
- `client/`: frontend SPA com Vue 3 + Quasar para uso do paciente.
- `docker-compose.yml` (na API): ambiente local com PostgreSQL e Redis.

## Stack Tecnologica

### Backend (`api/`)

- NestJS 11 + Fastify 5
- TypeScript 5
- PostgreSQL 16 + Drizzle ORM
- Redis (cache e rate limiting distribuido)
- JWT (access + refresh), Argon2
- Zod + nestjs-zod para validacao
- Vitest (unitarios + E2E)

### Frontend (`client/`)

- Vue 3 + Quasar 2
- TypeScript 5
- Pinia
- Vue Router 4
- Axios com interceptor de autenticacao/refresh
- Tailwind CSS 3

## Requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

## Como iniciar o projeto

### 1) API

```bash
cd api
cp .env.example .env
pnpm install
docker-compose --profile db up -d
pnpm drizzle:generate
pnpm drizzle:migrate
pnpm start:dev
```

API disponivel em `http://localhost:4000`  
Swagger em `http://localhost:4000/api/docs`

### 2) Client

Em outro terminal:

```bash
cd client
cp .env.example .env
pnpm install
pnpm dev
```

Client disponivel em `http://localhost:3000`.

## Testes e Qualidade

### API

```bash
cd api
pnpm test
pnpm test:e2e
pnpm test:cov
```

Cobertura atual da API (Vitest + V8):

- Statements: `83.21%` (471/566)
- Branches: `79.22%` (122/154)
- Functions: `77.77%` (154/198)
- Lines: `87.22%` (437/501)

Baseado na execucao de `pnpm test:cov` na branch `feat/create-client-integration-clean`.

## Estrutura do Repositorio

```text
med-clinic/
├── api/      # API NestJS (dominio, aplicacao, infraestrutura, apresentacao)
└── client/   # SPA Vue/Quasar para pacientes
```

## Fluxo recomendado de desenvolvimento

1. Criar branch a partir de `dev`.
2. Fazer commits pequenos e descritivos por contexto.
3. Rodar `pnpm test` e `pnpm test:e2e` na API antes do push.
4. Abrir PR para `dev` com resumo funcional e plano de teste.

## Contribuicao

Atualmente, a arvore desta branch foi padronizada para manter os commits com autor:

- `Julio Tavares <juliotavares197@gmail.com>`

