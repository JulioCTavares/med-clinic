# Med Clinic — Client (Paciente)

App web para pacientes da clínica médica, construído com **Vue 3 + Quasar + Tailwind CSS**.

---

## Stack

| Camada        | Tecnologia                                |
|---------------|-------------------------------------------|
| Framework UI  | Quasar 2 (componentes, plugins, ícones)   |
| Utilitários   | Tailwind CSS 3 (sem preflight — convive com Quasar) |
| Estado        | Pinia                                     |
| Roteamento    | Vue Router 4 (hash mode)                  |
| HTTP          | Axios com interceptor de refresh token    |
| Linguagem     | TypeScript 5 (strict)                     |
| Build         | Vite (via @quasar/app-vite)               |

---

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- API rodando em `http://localhost:4000` (ver `api/`)

---

## Setup

```bash
# Na pasta client/
cp .env.example .env
pnpm install
pnpm dev         # Inicia em http://localhost:3000
```

### Variáveis de ambiente

| Variável           | Descrição              | Padrão                    |
|--------------------|------------------------|---------------------------|
| `VITE_API_BASE_URL` | URL base da API        | `http://localhost:4000`   |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── router/       # Vue Router + guards de autenticação
│   └── stores/       # Pinia: auth.store, theme.store
├── boot/
│   └── axios.ts      # Init: interceptors, router guards, theme
├── entities/         # Tipos DTO espelhando a API
├── features/
│   ├── auth/         # Serviço de autenticação
│   ├── appointments/ # API de consultas
│   ├── profile/      # API de perfil
│   └── health-plans/ # API de planos de saúde
├── layouts/
│   ├── AuthLayout.vue  # Layout para telas de login/cadastro
│   └── MainLayout.vue  # Layout principal com drawer + header
├── pages/            # Páginas (uma por rota)
├── shared/
│   ├── lib/          # api.ts (axios), error-mapper.ts, catalog-api.ts
│   └── ui/           # Design system: AppButton, AppCard, etc.
└── css/
    └── app.scss      # Tailwind + tokens CSS semânticos
```

---

## Rotas

| Rota                    | Página                    | Auth |
|-------------------------|---------------------------|------|
| `/auth/login`           | Login                     | ❌    |
| `/auth/register`        | Cadastro de paciente      | ❌    |
| `/dashboard`            | Início / Resumo           | ✅    |
| `/appointments`         | Lista de consultas        | ✅    |
| `/appointments/new`     | Agendar nova consulta     | ✅    |
| `/appointments/:id`     | Detalhe da consulta       | ✅    |
| `/profile`              | Meu perfil                | ✅    |
| `/health-plans`         | Planos de saúde           | ✅    |

---

## Design system

Componentes base reutilizáveis em `src/shared/ui/`:

| Componente        | Uso                                   |
|-------------------|---------------------------------------|
| `AppButton`       | Botão com estados loading/disabled    |
| `AppTextField`    | Input de texto                        |
| `AppSelect`       | Select/dropdown                       |
| `AppCard`         | Card com título, subtítulo e ações    |
| `AppPageHeader`   | Cabeçalho de página com breadcrumb    |
| `AppEmptyState`   | Estado vazio com ação opcional        |
| `AppErrorBanner`  | Banner de erro com retry              |
| `AppSkeletonList` | Skeleton de lista durante carregamento|

---

## Dark / Light mode

Toggle **Claro / Escuro / Sistema** disponível no header e na tela de auth. A preferência é persistida em `localStorage` e aplicada via Quasar Dark plugin + variáveis CSS semânticas (`--color-surface`, `--color-text-primary`, etc.).

---

## Seed do banco (dados de teste)

Execute na pasta `api/` após migrations:

```bash
cd api/
pnpm seed
```

**Credenciais criadas:**

| Role     | E-mail                      | Senha      |
|----------|-----------------------------|------------|
| Paciente | maria.silva@test.com        | Senha@123  |
| Paciente | pedro.lima@test.com         | Senha@123  |
| Admin    | admin@medclinic.com         | Admin@123  |

O seed é idempotente — pode ser executado múltiplas vezes sem duplicar dados.

---

## CORS

Na `api/.env`, configure:

```env
CORS_ORIGIN=http://localhost:3000
```

---

## Build de produção

```bash
pnpm build    # Gera dist/ em client/dist/
```
