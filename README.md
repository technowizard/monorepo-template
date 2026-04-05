# React + Hono Monorepo Template

An opinionated full-stack monorepo template with a React frontend and a Hono API server, wired together and ready to extend

## Stack

**Frontend** (`apps/web`)

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 8](https://vite.dev) - build tool and dev server
- [TanStack Router](https://tanstack.com/router) - file-based routing
- [TanStack Query](https://tanstack.com/query) - server state and data fetching
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI variant)
- [i18next](https://www.i18next.com) - i18n with EN/ID support out of the box
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io) - unit and integration tests

**Backend** (`apps/server`)

- [Hono](https://hono.dev) - lightweight HTTP framework
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL - type-safe database access
- [Zod](https://zod.dev) - request/response validation
- OpenAPI docs via `@hono/zod-openapi` + Scalar UI
- [Vitest](https://vitest.dev) - integration tests against a real database

**Monorepo**

- [pnpm workspaces](https://pnpm.io/workspaces) - package management
- [Docker Compose](https://docs.docker.com/compose) - local dev with Postgres
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) - pre-commit hooks
- [oxlint](https://oxc.rs/docs/guide/usage/linter) + [oxfmt](https://oxc.rs) + [@fdhl/oxlint-config](https://github.com/technowizard/oxlint-config) - fast linting and formatting
- [Commitizen](https://commitizen-tools.github.io/commitizen) + [commitlint](https://commitlint.js.org) - conventional commits

## Project structure

```
monorepo-template/
├── apps/
│   ├── server/          # Hono API server
│   │   └── src/
│   │       ├── db/      # Drizzle schema and migrations
│   │       ├── routes/  # Route definitions and handlers
│   │       ├── services/
│   │       ├── repositories/
│   │       └── tests/   # Integration tests
│   └── web/             # React frontend
│       └── src/
│           ├── features/   # Feature-scoped components and API hooks
│           ├── pages/      # Page-level components
│           ├── routes/     # TanStack Router file-based routes
│           ├── components/ # Shared UI components
│           ├── lib/        # API client, query client, i18n, env
│           ├── locales/    # en / id translation files
│           └── tests/      # Test utilities, MSW handlers
└── packages/
    └── config/          # Shared TypeScript configs
```

## Prerequisites

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io) 10+
- [Docker](https://docs.docker.com/get-started) (for the recommended dev setup)

## Getting started

### With Docker (recommended)

Copy the root env file and fill in the required values:

```bash
cp .env.example .env
```

`.env` at the root is only used by Docker Compose to configure the Postgres service:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app
CORS_ORIGINS=http://localhost:3001
```

Start everything:

```bash
pnpm dev
# or: docker compose up
```

This starts Postgres, runs migrations, and serves:

- Frontend → http://localhost:3001
- Backend → http://localhost:3000
- API docs → http://localhost:3000/reference

### Without Docker (local)

1. Start a PostgreSQL instance manually

2. Copy and configure the server env file:

```bash
cp apps/server/.env.example apps/server/.env
```

3. Install dependencies and run:

```bash
pnpm install
pnpm dev:local
```

## Environment variables

### `apps/server/.env`

| Variable               | Default                 | Description                             |
| ---------------------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`             | `production`            | `development` \| `production` \| `test` |
| `PORT`                 | `3000`                  | Server port                             |
| `HOST`                 | `localhost`             | Server hostname                         |
| `DATABASE_USER`        | -                       | **Required.** Postgres user             |
| `DATABASE_PASSWORD`    | -                       | **Required.** Postgres password         |
| `DATABASE_DB`          | `postgres`              | Database name                           |
| `DATABASE_HOST`        | `localhost`             | Database host                           |
| `DATABASE_PORT`        | `5432`                  | Database port                           |
| `CORS_ORIGINS`         | `http://localhost:3001` | Allowed origins, comma-separated        |
| `RATE_LIMIT_WINDOW_MS` | `60000`                 | Rate limit window in ms                 |
| `RATE_LIMIT_MAX`       | `50`                    | Max requests per window                 |

### `apps/web/.env`

| Variable       | Description                                    |
| -------------- | ---------------------------------------------- |
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:3000` |

## Development commands

```bash
# Start everything via Docker
pnpm dev

# Start frontend and backend directly (no Docker)
pnpm dev:local

# Start individually
pnpm dev:web
pnpm dev:server
```

## Database

```bash
# Push schema changes to the database (no migration file)
pnpm db:push

# Generate and apply a migration
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## Testing

```bash
# Run all tests
pnpm test

# Run per app
pnpm test:web
pnpm test:server
```

**Frontend tests** use Vitest + Testing Library + MSW. MSW intercepts `fetch` at the network layer, so tests exercise the full component → hook → API client chain without a running server

**Backend tests** are integration tests that require a real Postgres database. The test runner automatically applies migrations before the suite runs (`pnpm db:migrate:test`). Set up `apps/server/.env.test` with a separate test database before running

## Code quality

```bash
# Lint and format all files
pnpm lint

# Type-check all packages
pnpm typecheck
```

Linting and formatting run automatically on staged files via Husky pre-commit hooks. Commit messages are enforced to follow [Conventional Commits](https://www.conventionalcommits.org)

```bash
# Interactive commit prompt
pnpm commit
```

## Deployment

### 1. Name your images

Update `docker-compose.prod.yml` with your registry and image names:

```yaml
server:
  image: your-username/my-app-server:latest

web:
  image: your-username/my-app-web:latest
```

### 2. Build the images

Run both build commands from the **monorepo root**. The web image requires `VITE_API_URL` at build time - Vite bakes it into the static bundle

```bash
docker build \
  -f apps/server/Dockerfile.prod \
  -t your-username/my-app-server:latest \
  .

docker build \
  -f apps/web/Dockerfile.prod \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  -t your-username/my-app-web:latest \
  .
```

### 3. Test locally before pushing

You can run the full production stack on your machine without pushing to any registry. Docker Compose uses locally built images if the tag already exists:

```bash
# Create a local .env with production-like values
cp .env.example .env

docker compose -f docker-compose.prod.yml up -d
```

- Frontend → http://localhost:80
- Backend → http://localhost:3000

Tear down when done:

```bash
docker compose -f docker-compose.prod.yml down -v
```

### 4. Push and deploy

Push the images to your registry:

```bash
docker push your-username/my-app-server:latest
docker push your-username/my-app-web:latest
```

On your production server, create an `.env` file and bring the stack up:

```bash
# Copy docker-compose.prod.yml and .env.example to the server, then:
cp .env.example .env
# Edit .env with real credentials

docker compose -f docker-compose.prod.yml up -d
```

The server container runs database migrations automatically on startup before accepting traffic

## Adding shadcn/ui components

```bash
pnpm --filter web shadcn:add <component>
# e.g.: pnpm --filter web shadcn:add dialog
```

## Adding a new feature

The frontend follows a feature-slice pattern. Each feature lives under `src/features/<name>/`:

```
features/tasks/
├── api/          # React Query hooks (get, create, update, delete)
└── components/   # Feature-specific UI components
```

Page-level components go in `src/pages/` and are referenced from `src/routes/`
