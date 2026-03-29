# Turnix Frontend Foundation

Turnix is a multi-tenant SaaS frontend foundation for appointments, scheduling, queues, and service-attention operations. This starter supports two product surfaces from the beginning:

- Public booking for citizens, customers, and end users
- Protected backoffice for staff, operators, and administrators

The implementation is built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, NextAuth, motion, TanStack Query, TanStack Form, TanStack Table, and a minimal Zustand store for the multi-step public booking flow.

## Scripts

```bash
yarn dev
yarn lint
yarn typecheck
yarn build
```

## Architecture

### Route groups

- `src/app/(public)` for public-facing booking routes
- `src/app/(auth)` for authentication
- `src/app/(app)` for protected backoffice routes

Protected routes are guarded in two places:

- `src/proxy.ts` performs early redirects for protected paths and authenticated login redirects
- `src/modules/auth/server/session.server.ts` validates the session on the server in the protected layout

### Folder strategy

```text
src/
  app/
  components/
    ui/
      atoms/
      molecules/
      organisms/
      templates/
  config/
  lib/
  modules/
    auth/
    tenants/
    users/
    services/
    scheduling/
    appointments/
    dashboard/
    settings/
    public-booking/
  providers/
  styles/
  types/
```

- Shared, reusable design-system UI lives in `src/components/ui`
- Business UI stays inside feature modules
- Canonical domain contracts live in `src/types/domain.ts`
- Feature modules own their hooks, services, query keys, schemas, and module-specific components

### Auth design

The auth layer is intentionally split by responsibility:

- `src/modules/auth/config/auth-options.ts` for NextAuth config
- `src/modules/auth/providers/*` for provider construction
- `src/modules/auth/server/auth-callbacks.ts` for JWT/session mapping
- `src/modules/auth/server/backend-auth.server.ts` for backend login, validation, and future refresh handling
- `src/modules/auth/server/session.server.ts` for server session access
- `src/modules/auth/server/authorization.server.ts` for role-aware helpers

Implemented auth paths:

- Credentials provider connected to the NestJS backoffice login endpoint
- JWT session strategy with room for future token refresh evolution
- Server-side protected-layout validation against the backend current-user endpoint
- Tenant-aware and role-aware session mapping

### Data layer

TanStack Query is the default server-state layer.

- Query keys are defined per module
- Request functions live in module service adapters
- Protected pages prefetch data on the server and hydrate into client tables/cards
- Mock seed data is isolated behind module services and can be disabled when a real backend is connected

### Forms and tables

- TanStack Form powers the login form and public booking form
- Shared form structure is implemented with `FormField`
- TanStack Table powers reusable backoffice data tables for appointments and services

### Internationalization

The frontend now supports Spanish and English across the public booking flow and protected backoffice.

- `src/proxy.ts` resolves the locale from the `turnix-locale` cookie first and falls back to `Accept-Language`
- `src/app/layout.tsx` loads the locale-specific dictionary on the server and sets the document `lang`
- `src/i18n/dictionaries/*` centralizes copy for both languages with a shared typed shape
- `src/components/ui/molecules/locale-switcher.tsx` updates the locale cookie through `src/app/api/locale/route.ts`

This foundation uses locale-aware dictionaries without URL prefixes so the current route groups, auth redirects, and protected navigation remain stable while the product evolves.

### State management

Zustand is used only for the public booking flow because that state spans multiple public pages and should survive navigation without becoming server state.

## Environment

The foundation works without a backend by using seed data and development credentials. To connect real auth and API flows, configure:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me
TURNIX_API_URL=https://api.example.com
NEXT_PUBLIC_TURNIX_API_URL=https://api.example.com
NEXT_PUBLIC_TURNIX_USE_MOCKS=false
AUTH_USE_DEV_CREDENTIALS=false
```

When `TURNIX_API_URL` is absent or mocks are enabled, the app falls back to local seed data. In development, the credentials provider also supports:

- email: `admin@turnix.local`
- password: `Turnix123!`

## Current foundation highlights

- Public routes: `/`, `/book`, `/book/services`, `/book/appointments/new`, `/book/confirmation`
- Protected routes: `/dashboard`, `/appointments`, `/services`, `/settings`
- Theme tokens for light and dark mode in `src/styles/globals.css`
- Atomic shared UI with a motion-enhanced dashboard shell
- Query hydration on protected pages
- Parallel route slot in the booking area for future modal and intercepting-route flows

## Notes for backend integration

- The API adapters already separate frontend view composition from backend payload fetching
- NextAuth callbacks now persist the real backend access token and are ready to evolve into refresh flows
- Protected layouts already assume server validation, not client-only gating
- Route and module structure is ready for future tenant-aware URLs, nested settings areas, booking lookup, cancellation, and rescheduling flows
