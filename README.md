# Med Clinic

Plataforma para gestao de clinica medica com backend REST e frontend web para pacientes.

O projeto cobre autenticacao JWT (access + refresh token), RBAC, cadastro de pacientes, listagem/agendamento de consultas e gerenciamento de dados clinicos.

## Visao geral

- `api/`: backend NestJS + Fastify seguindo Clean Architecture.
- `client/`: SPA em Vue 3 + Quasar para fluxo do paciente.
- Banco e cache locais via Docker (`PostgreSQL` + `Redis`).

## Stack tecnologica

### Backend (`api/`)

- NestJS 11 + Fastify 5
- TypeScript 5
- PostgreSQL 16 + Drizzle ORM
- Redis (cache e rate limiting distribuido)
- JWT + Argon2
- Zod + nestjs-zod
- Vitest (unitarios + E2E)

### Frontend (`client/`)

- Vue 3 + Quasar 2
- TypeScript 5
- Pinia
- Vue Router 4
- Axios
- Tailwind CSS 3

## Requisitos recomendados

- Node.js `22+` 
- pnpm `9+`
- Docker + Docker Compose

## Setup completo (API + Client)

## 1) Subir API

```bash
cd api
cp .env.example .env
pnpm install
docker-compose --profile db up -d
pnpm drizzle:generate
pnpm drizzle:migrate
pnpm seed
pnpm start:dev
```

Endpoints principais locais:

- API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/docs`

Importante: a rota `http://localhost:4000/api/docs` esta incorreta para esta aplicacao.

## 2) Subir Client

Em outro terminal:

```bash
cd client
cp .env.example .env
pnpm install
pnpm dev
```

Frontend local: `http://localhost:3000`.

## Fluxo pronto para paciente (cadastro e login)

Com API e Client rodando:

1. Acesse `http://localhost:3000/auth/register`.
2. Crie uma conta de paciente.
3. Faca login em `http://localhost:3000/auth/login`.
4. Navegue por dashboard, consultas, perfil e planos.

O backend tambem expoe endpoints de autenticacao no Swagger:

- `POST /auth/register/patient`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Seed de dados

Execute na pasta `api/`:

```bash
pnpm seed
```

Credenciais criadas pelo seed:

- Paciente: `maria.silva@test.com` / `Senha@123`
- Paciente: `pedro.lima@test.com` / `Senha@123`
- Admin: `admin@medclinic.com` / `Admin@123`

Observacoes:

- O seed e idempotente (pode rodar mais de uma vez sem duplicar dados principais).
- O seed facilita validar login e fluxos da UI sem cadastro manual.

## Compatibilidade e problemas comuns (frontend)

Para evitar erros de build e dependencias:

- Use Node `22+` e pnpm `9+`.
- Nao misture `npm install` com `pnpm install` neste projeto.
- Se houver inconsistencias (especialmente apos trocar versao do Node), rode:

```bash
cd client
rm -rf node_modules
pnpm install
pnpm dev
```

Se aparecer erro de CORS no login:

- Confirme em `api/.env` que `CORS_ORIGIN=http://localhost:3000`.
- Reinicie a API apos alterar variaveis.

## Testes e cobertura da API

Na pasta `api/`:

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

Cobertura atual (Vitest + V8):

- Statements: `83.21%` (471/566)
- Branches: `79.22%` (122/154)
- Functions: `77.77%` (154/198)
- Lines: `87.22%` (437/501)

## Estrutura do repositorio

```text
med-clinic/
├── api/      # Backend NestJS
└── client/   # Frontend Vue/Quasar
```

## Fluxo recomendado de desenvolvimento

1. Criar branch a partir de `dev`.
2. Fazer commits pequenos e descritivos por contexto.
3. Rodar testes da API antes do push.
4. Abrir PR para `dev` com resumo funcional e plano de teste.

