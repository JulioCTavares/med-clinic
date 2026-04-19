# Med-Clinic API

API REST para gestão de clínica médica, desenvolvida com **NestJS + Fastify**, seguindo **Clean Architecture**, princípios **SOLID** e **Design Patterns**.

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 11 + Fastify 5 |
| Linguagem | TypeScript 5.7 |
| Banco de Dados | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Validação | Zod + nestjs-zod |
| Autenticação | JWT (Access + Refresh Token) |
| Hash de Senha | Argon2 |
| Cache | Redis (ioredis) |
| Rate Limiting | @nestjs/throttler + Redis |
| Testes | Vitest (unitários + E2E) |
| Infraestrutura | Docker + Docker Compose |

---

## Funcionalidades

- Cadastro e gestão de **pacientes**, **médicos**, **especialidades**, **planos de saúde** e **procedimentos**
- **Agendamento de consultas** com detecção de conflitos de horário
- **Autenticação JWT** com refresh token, rotação e logout com blacklist
- **Controle de acesso por papéis** (admin, doctor, patient)
- **Cache com Redis** via Proxy Pattern nos repositórios
- **Rate limiting distribuído** por Redis (anti-brute-force nas rotas de auth)
- **Soft delete** em todas as entidades
- **Documentação Swagger** em `/api/docs`
- Logs estruturados com Pino e rastreamento por `x-request-id`

---

## Papéis de Usuário

| Role | Permissões |
|------|------------|
| `admin` | Acesso total ao sistema |
| `doctor` | Gerencia consultas e procedimentos |
| `patient` | Visualiza próprias consultas e planos |

---

## Rotas

| Prefixo | Recurso |
|---------|---------|
| `POST /auth/register` | Cadastro de usuário |
| `POST /auth/login` | Login (retorna access + refresh token) |
| `POST /auth/refresh` | Renovação do access token |
| `POST /auth/logout` | Logout (revoga tokens) |
| `/doctors` | Gestão de médicos |
| `/patients` | Gestão de pacientes |
| `/appointments` | Agendamento de consultas |
| `/specialties` | Catálogo de especialidades |
| `/health-plans` | Catálogo de planos de saúde |
| `/procedures` | Catálogo de procedimentos |
| `/patients/:id/health-plans` | Vínculo paciente ↔ plano |

A documentação completa das rotas está disponível em `/api/docs` (Swagger UI).

---

## Requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

---

## Configuração do Ambiente

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta da API | `4000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `LOG_LEVEL` | Nível de log (pino) | `info` |
| `CORS_ORIGIN` | URL do frontend permitida | `http://localhost:3000` |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgres://user:pass@localhost:5432/db` |
| `POSTGRES_USER` | Usuário do banco (Docker) | `postgres` |
| `POSTGRES_PASSWORD` | Senha do banco (Docker) | `postgres` |
| `POSTGRES_DB` | Nome do banco (Docker) | `med_clinic` |
| `POSTGRES_PORT` | Porta do banco (Docker) | `5432` |
| `JWT_SECRET` | Segredo do access token | *(string aleatória forte)* |
| `JWT_EXPIRES_IN` | Expiração do access token | `15m` |
| `REFRESH_TOKEN_SECRET` | Segredo do refresh token | *(string aleatória forte)* |
| `REFRESH_TOKEN_EXPIRES_IN` | Expiração do refresh token | `7d` |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `COOKIE_SECRET` | Segredo dos cookies Fastify | *(string aleatória forte)* |

---

## Instalação e Execução

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Subir PostgreSQL e Redis via Docker
docker-compose --profile db up -d

# Gerar e aplicar migrations
pnpm drizzle:generate
pnpm drizzle:migrate

# Iniciar servidor com hot-reload
pnpm start:dev
```

A API estará disponível em `http://localhost:4000`.

### Produção

```bash
# Build
pnpm build

# Iniciar
pnpm start:prod
```

### Docker (stack completa)

```bash
# Subir API + PostgreSQL + Redis
docker-compose --profile app up -d

# Acompanhar logs
docker-compose logs -f api
```

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm start:dev` | Servidor de desenvolvimento (hot-reload) |
| `pnpm start:debug` | Modo debug |
| `pnpm start:prod` | Servidor de produção (a partir do `dist/`) |
| `pnpm build` | Compilação TypeScript |
| `pnpm test` | Testes unitários |
| `pnpm test:watch` | Testes unitários em modo watch |
| `pnpm test:cov` | Testes com relatório de cobertura |
| `pnpm test:e2e` | Testes end-to-end |
| `pnpm lint` | ESLint com auto-fix |
| `pnpm format` | Prettier |
| `pnpm drizzle:generate` | Gerar arquivos de migration |
| `pnpm drizzle:migrate` | Aplicar migrations |
| `pnpm drizzle:studio` | Interface visual do banco (Drizzle Studio) |

---

## Testes

O projeto possui cobertura completa via **Vitest**:

- **40+ testes unitários** — use cases, repositórios, proxies de cache
- **12 suites E2E** — fluxo de auth, RBAC, CRUD completo, validações e contratos de erro
- `pnpm test` e `pnpm test:e2e` carregam automaticamente `.env.test` (ou `.env.test.example` como fallback).
- `pnpm test:e2e` prepara o ambiente, roda os testes e remove o banco E2E ao final (mesmo em caso de falha).

```bash
# Unitários
pnpm test

# E2E
cp .env.test.example .env.test
pnpm test:e2e

# Cobertura
pnpm test:cov
```

### Setup E2E automatizado

Se quiser preparar o ambiente sem rodar os testes:

```bash
pnpm test:e2e:setup
```

Esse comando:
- sobe `postgres` e `redis` via Docker Compose (`--profile db`);
- cria o banco `med_clinic_e2e` se ele ainda não existir.

Para remover manualmente o banco E2E:

```bash
pnpm test:e2e:teardown
```

---

## Arquitetura

O projeto segue **Clean Architecture** com separação em três camadas:

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/        # Modelos de domínio com builder pattern
│   │   ├── enums/           # Role, AppointmentStatus
│   │   └── interfaces/      # Contratos de repositórios e serviços
│   └── application/
│       ├── use-cases/       # 72 casos de uso (regras de negócio)
│       ├── dtos/            # Data Transfer Objects com validação Zod
│       └── errors/          # Exceções de aplicação
├── infrastructure/
│   ├── database/
│   │   ├── drizzle/         # Schemas, migrations, factory
│   │   └── repositories/    # Implementações com Drizzle ORM
│   ├── cache/
│   │   ├── proxies/         # Proxy Pattern para cache nos repositórios
│   │   └── redis/           # Módulo e serviço Redis
│   └── security/
│       ├── jwt/             # Adapter JWT + estratégia Passport
│       ├── hashing/         # Adapter Argon2
│       └── guards/          # JwtAuthGuard, RolesGuard
└── presentation/
    ├── modules/             # Módulos NestJS (um por domínio)
    └── http/
        ├── controllers/     # Controllers HTTP
        └── filters/         # Filtro global de exceções
```

**Design Patterns aplicados:** Repository, Factory, Adapter, Proxy, Strategy.
