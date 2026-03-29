# Turnix API

NestJS backend for the Turnix monorepo. This app uses Prisma with PostgreSQL and a tenant-aware schema prepared for the first booking domain modules.

## Environment

Create a local environment file from the example:

```bash
cp .env.example .env
```

For the local Docker PostgreSQL from the monorepo root, the default value is:

```bash
DATABASE_URL="postgresql://turnix:turnix@localhost:5432/turnix?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="8h"
```

## Prisma workflow

```bash
yarn prisma:generate
yarn prisma:migrate:dev --name init
yarn prisma:seed
yarn prisma:studio
```

The auth foundation adds a password hash to `StaffUser`. After pulling these changes, create a migration for your local environment:

```bash
yarn prisma:migrate:dev --name add-staff-user-password-hash
```

To generate a bcrypt password hash for a first internal backoffice user:

```bash
node -e "const { hashSync } = require('bcryptjs'); console.log(hashSync('ChangeMe123!', 12));"
```

You can then create or update a `StaffUser` row with that value in `passwordHash` through Prisma Studio or SQL.

For credentials login, the API currently expects the email to identify exactly one active `StaffUser` across active tenants. If the same email exists in multiple active tenants, login is rejected to avoid cross-tenant ambiguity until a tenant-aware login input is introduced.

From the monorepo root you can start the local database with:

```bash
yarn db:up
yarn db:logs
yarn db:down
```

For the full Docker stack with automatic migrations and seed:

```bash
yarn docker:up
```

In development, the `api` container now:

- waits for PostgreSQL readiness using the compose healthcheck plus a small retry loop
- runs `prisma migrate deploy`
- runs the demo seed
- starts the NestJS server

The seed runs only when `NODE_ENV=development`.

That flow seeds a default development tenant and admin:

```text
tenant slug: demo
email: admin@turnix.local
password: Turnix123!
```

## Tenant resolution

Turnix now resolves tenant context primarily from the incoming request host or subdomain.

Recommended local pattern:

```text
http://demo.localhost:3001
```

Examples:

- `demo.localhost:3001`
- `demo.turnix.local`
- `municipalidad-x.turnix.local`

For Swagger or local tooling that cannot easily change the request host, you can use the trusted fallback header:

```text
x-tenant-slug: demo
```

The legacy `x-tenant-id` header is still accepted for local compatibility, but host-based resolution is the primary tenant source.

## Run the API

```bash
yarn start:dev
yarn build
yarn start
```

Swagger is available at `http://localhost:3001/docs`.

## Auth testing

1. Run `yarn docker:up` to get the seeded development tenant and admin, or create your own tenant and `StaffUser` with a populated `passwordHash`.
2. Start the API and open Swagger.
3. Call `POST /api/v1/auth/login` with the staff email and password.
4. Copy the returned access token into Swagger's `Authorize` dialog using the `Bearer` scheme.
5. Call `GET /api/v1/auth/me` and any future JWT-protected backoffice endpoint.
