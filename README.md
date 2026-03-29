# Turnix

Turnix is a multi-tenant appointment and scheduling platform for organizations that need to manage branch operations, staff availability, and citizen-facing bookings from a single system.

It solves the operational gap between internal backoffice scheduling and public self-service booking by combining:
- protected backoffice management for services, branches, schedules, and appointments
- public booking flows for citizens
- slot generation from recurring availability rules
- appointment lifecycle handling, including cancellation and rescheduling

## Main Features

- Multi-tenant architecture with tenant-aware data isolation
- Backoffice administration for services, branches, staff, and appointments
- Scheduling foundation with recurring availability rules and generated time slots
- Public booking, lookup, cancellation, and rescheduling flows
- JWT-based backend auth for internal users
- Swagger API documentation for backend testing

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Frontend state/data: TanStack Query, TanStack Form, TanStack Table
- Frontend auth: NextAuth
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Local infrastructure: Docker and Docker Compose

## Quick Start

The fastest way to run Turnix locally is with Docker.

```bash
git clone <repo-url>
cd turnix
docker compose up --build
```

What happens on startup:
- `postgres` starts first
- the `api` container waits for the database
- Prisma migrations are applied automatically
- demo data is seeded automatically in development
- the NestJS API starts
- the Next.js frontend starts

Useful local URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- PostgreSQL: `localhost:5432`

Demo development credentials:
- Tenant slug: `demo`
- Admin email: `admin@turnix.local`
- Admin password: `Turnix123!`

Notes:
- The first boot can take a few minutes because Docker needs to build images and install dependencies.
- The development seed is idempotent, so restarting the stack or rerunning the seed will recreate the demo scenario cleanly instead of accumulating duplicates.
- After the stack is up, code changes in `apps/web` and `apps/api` are reflected automatically inside Docker because the workspace is mounted into both containers.
- You only need `docker compose up --build` again when dependencies, Dockerfiles, or environment setup change.

## Monorepo Structure

```text
turnix/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # Next.js frontend
├── packages/
│   └── shared/     # Shared workspace packages
├── docker-compose.yml
└── README.md
```

## Development Workflows

### Full stack with Docker

Recommended for most development and testing:

```bash
yarn docker:up
```

Useful commands:

```bash
yarn docker:logs
yarn docker:down
yarn docker:build
```

With the current Docker development setup:
- `web` runs `next dev` and reloads when frontend files change
- `api` runs `nest start --watch` and reloads when backend files change
- PostgreSQL data stays persisted in its named volume

The backend container automatically runs:
1. `prisma migrate deploy`
2. the demo seed
3. the NestJS server

Automatic seeding only runs when `NODE_ENV=development`.

### Database only

If you want to run the apps outside Docker but keep PostgreSQL in Docker:

```bash
yarn db:up
yarn db:logs
yarn db:down
```

### Backend and frontend outside Docker

Start with environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Generate Prisma client and run local migrations:

```bash
yarn workspace api prisma:generate
yarn workspace api prisma:migrate:dev --name init
```

Seed demo data:

```bash
yarn workspace api seed
```

Start both apps:

```bash
yarn workspace api start:dev
yarn workspace web dev
```

## Database and Prisma

Docker database URL used by the API container:

```bash
postgresql://turnix:turnix@postgres:5432/turnix?schema=public
```

Local host URL used when running the backend outside Docker:

```bash
postgresql://turnix:turnix@localhost:5432/turnix?schema=public
```

Common Prisma commands:

```bash
yarn workspace api prisma:generate
yarn workspace api prisma:migrate:dev --name your-change-name
yarn workspace api prisma:migrate:deploy
yarn workspace api prisma:studio
yarn workspace api seed
```

## Demo Data

The development seed creates a realistic demo tenant with:
- 1 demo tenant and tenant settings
- 2 branches
- 3 services
- 3 internal staff users
- recurring availability rules
- generated time slots for the next days
- demo citizens
- appointments in different lifecycle states

This gives you a working scenario for:
- backoffice login
- service and branch management
- scheduling and slot generation
- protected appointments management
- public booking flows

## API Documentation

Swagger is available at:

```text
http://localhost:3001/docs
```

You can use it to test:
- auth login
- services
- branches
- scheduling rules
- slot generation
- appointments
- public booking endpoints

## Quality Checks

Useful workspace commands:

```bash
yarn workspace api build
yarn workspace web build
yarn workspace web lint
yarn workspace web typecheck
```

## Current Product Areas

- Protected backoffice dashboard
- Services management
- Branches management
- Scheduling rules and slot generation
- Protected appointments management
- Public service browsing and booking
- Public appointment lookup, cancellation, and rescheduling

## Notes for Contributors

- Keep all backend business operations tenant-aware
- Preserve the current monorepo structure
- Do not introduce conflicting frontend state/form/table libraries
- Prefer extending the current feature-based architecture instead of rebuilding modules
