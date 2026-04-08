# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"即刻造梦" — a multimodal creative workstation. Turborepo monorepo with pnpm workspaces.

- `apps/web` — Next.js 16 (App Router) client, port 3000
- `apps/admin` — Next.js 16 (App Router) admin dashboard, port 3001
- `apps/server` — NestJS backend API, port 3002
- `packages/ui` — Shared component library (CVA + Tailwind CSS)

## Commands

```bash
pnpm install          # install all dependencies
pnpm dev              # start all apps (via Turbo)
pnpm build            # build all apps
pnpm lint             # lint all apps
```

### Server-specific (run from apps/server)

```bash
pnpm dev                    # nest start --watch
pnpm prisma:generate        # generate Prisma client
pnpm prisma:migrate:dev     # run database migrations
pnpm prisma:seed            # seed default users
```

### Single app dev (from root)

```bash
pnpm --filter server dev
pnpm --filter web dev
pnpm --filter admin dev
```

## Architecture

### Backend (apps/server)

NestJS modular architecture with these modules:

- **AuthModule** — JWT access + refresh token auth, session-based (stored in DB). Guards: `JwtAuthGuard` (validates token + checks session), `RolesGuard` (RBAC via `@Roles()` decorator). Endpoints: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
- **UsersModule** — User CRUD, admin-only. Soft deletes via `deletedAt`. Password hashing uses scrypt (`password.util.ts`).
- **PrismaModule** — Global module wrapping PrismaClient with `@prisma/adapter-pg`. Singleton service injected everywhere.
- **HealthController** — `GET /` and `GET /health` at root.

Key patterns:
- Env validation via Zod (`src/config/env.schema.ts`), loaded through `@nestjs/config`
- Global `ValidationPipe` with whitelist + forbidNonWhitelisted + transform
- Swagger docs served at `/docs`
- Logging via `nestjs-pino` (pretty in dev, JSON in prod)
- `@CurrentUser()` decorator extracts authenticated user from request

### Database

PostgreSQL + Prisma ORM. Schema at `apps/server/prisma/schema.prisma`.

Three models: `User` (with soft delete, credit balance, role/status enums), `UserTokenQuota` (1:1 with User, tracks GPT/Gemini/JM tokens), `AuthSession` (1:N with User, refresh token sessions). All cascade delete from User.

### Shared UI (packages/ui)

Exports components via subpath: `@workspace/ui/button`, `@workspace/ui/card`, `@workspace/ui/badge`, `@workspace/ui/input`. Utility `cn()` at `@workspace/ui/lib/utils`. Both Next.js apps transpile this package.

### Environment Variables (server)

Required: `DATABASE_URL`, `JWT_ACCESS_SECRET` (min 32 chars), `JWT_REFRESH_SECRET` (min 32 chars). Optional with defaults: `NODE_ENV` (development), `PORT` (3002), `JWT_ACCESS_EXPIRES_IN` (15m), `JWT_REFRESH_EXPIRES_IN` (30d). See `apps/server/.env.example`.

## Conventions

- Language: project docs and UI text are in Chinese (简体中文)
- Prisma models include `createdAt`/`updatedAt` audit fields; `deletedAt` for soft delete when needed
- PrismaModule is global — inject `PrismaService` directly, no need to import PrismaModule per feature
- Auth flow: access token (short-lived) + refresh token (long-lived, stored as hash in AuthSession)
- RBAC: `UserRole.ADMIN` and `UserRole.USER` — protect endpoints with `@Roles(UserRole.ADMIN)`
- Turbo handles cross-app build dependencies and caching
