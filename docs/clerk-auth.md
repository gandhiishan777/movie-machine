# Clerk Authentication Integration

## Overview

This document describes the Clerk authentication integration added to Movie Machine. Prior to this change, the application used a hardcoded test user ID to associate database records with a user. Clerk replaces that stub with real, production-grade authentication: sign-up, sign-in, session management, and a hosted user profile UI are all delegated to Clerk, while the application retains full ownership of authorization logic (who can see and modify what).

The integration touches five layers of the stack: middleware, root layout, the home page Server Component, two API routes, and the Prisma schema.

---

## Architecture

Auth flows top-down through the request lifecycle:

```
Request
  └── Middleware (clerkMiddleware)          # attaches Clerk session to request context
        └── Root Layout (ClerkProvider)    # makes session available to all React trees
              └── Page / Server Component  # calls auth() to read userId, redirects if absent
                    └── API Route          # calls auth() again, enforces ownership
```

Each layer is independent: the middleware does not redirect — it only populates context. Redirect decisions are made explicitly in each Server Component or Route Handler that requires authentication.

---

## Files Changed

| File | What changed | Why |
|------|-------------|-----|
| `src/middleware.ts` | Added `clerkMiddleware` export and Next.js `matcher` config | Required by Clerk to intercept every request and attach session state before any route handler runs |
| `src/app/layout.tsx` | Wrapped the entire app in `<ClerkProvider>`; added a `<header>` with `<SignInButton>`, `<SignUpButton>`, and `<UserButton>` rendered conditionally via `<Show>` | `ClerkProvider` is the React context that surfaces the session to all child components and Server Components via `auth()`; the header gives unauthenticated users a way to sign in without navigating away |
| `src/app/page.tsx` | Replaced hardcoded test user ID with `auth()` call; added redirect to `/sign-in` for unauthenticated visitors; replaced `findUnique` with `upsert` for the User record | `auth()` returns the real Clerk `userId`; `upsert` ensures the local User row is created on first visit without a separate lookup-then-create round trip |
| `src/app/api/projects/route.ts` | Added `auth()` guard to both `POST` and `GET` handlers; `POST` now writes `userId` from Clerk instead of a hardcoded value; `GET` filters by `userId` | Prevents unauthenticated access; ensures users can only read and create projects that belong to them |
| `src/app/api/projects/[id]/generate/route.ts` | Added `auth()` guard; after fetching the project, checks that `project.userId === userId` before proceeding | Prevents one authenticated user from triggering generation on another user's project (ownership check) |
| `prisma/schema.prisma` | `User.id` is now a plain `String @id` (no `@default`); `User.email` is `String? @unique` (optional) | Clerk user IDs (`user_xxxxxxxx`) are assigned externally, so the database must not generate them. Email is optional because Clerk supports phone/social sign-in where email may not be available at record creation time |

---

## Environment Variables

Add the following variables to your `.env` file. They are not yet in `.env.example` and must be obtained from the [Clerk Dashboard](https://dashboard.clerk.com).

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public key used by `<ClerkProvider>` on the client. Safe to expose in browser bundles. |
| `CLERK_SECRET_KEY` | Yes | Secret key used by `auth()` and `clerkMiddleware()` on the server. Never expose this to the client. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Recommended | Path Clerk redirects to for sign-in (e.g. `/sign-in`). Defaults to Clerk's hosted UI if omitted. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Recommended | Path Clerk redirects to for sign-up (e.g. `/sign-up`). |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Recommended | Where Clerk redirects after a successful sign-in (e.g. `/`). |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Recommended | Where Clerk redirects after a successful sign-up (e.g. `/`). |

---

## Database Changes

### `User.id`

Previously `User.id` was likely a database-generated UUID (`@default(uuid())`). It is now a bare `String @id` with no default:

```prisma
model User {
  id    String  @id        // no @default — value is supplied by the caller
  email String? @unique    // optional: Clerk userId is the source of truth
  ...
}
```

**Why:** Clerk assigns its own user identifiers (e.g. `user_2abc123xyz`). Using the Clerk ID as the primary key means no translation table is needed and foreign-key relationships are trivially established by passing `userId` directly from `auth()`.

**Migration note:** If you have an existing `users` table with UUID primary keys, a migration is required to drop the default and backfill or recreate the records. New installations can apply the schema as-is via `npx prisma migrate dev`.

### `User.email` optional

`email` is nullable (`String?`) because:

1. On first visit, the page calls `upsert` with only `{ id: userId }` — email is not fetched from Clerk at this point.
2. Clerk supports sign-in methods (phone number, OAuth without email scope) where email may be absent.

Email can be written later via a separate profile-sync webhook if needed.

---

## Auth Flow

Step-by-step walkthrough of a request from an unauthenticated user:

1. **Browser sends GET /** — no session cookie present.
2. **`clerkMiddleware` runs** — detects no valid session. Because the middleware is configured as a passthrough (no `protect()` call), it does not redirect itself; it simply attaches an empty auth context and forwards the request.
3. **`Home` Server Component renders** — calls `const { userId } = await auth()`. `userId` is `null`.
4. **Redirect fires** — `redirect('/sign-in')` sends the browser to the Clerk-managed sign-in page (or your custom `/sign-in` route).
5. **User signs in** — Clerk validates credentials and sets a session cookie.
6. **Browser is redirected back to `/`** — `auth()` now returns a non-null `userId`.
7. **`prisma.user.upsert`** — creates the local `User` row on first visit; is a no-op on subsequent visits.
8. **Page renders** — `user.id` (the Clerk user ID) is passed to `CreateProjectForm` for associating new projects.

---

## API Security

All Route Handlers follow the same two-step pattern:

### Step 1 — Authentication check

```ts
const { userId } = await auth()
if (!userId) return new Response('Unauthorized', { status: 401 })
```

Returns `401` for any request that lacks a valid Clerk session (e.g. expired token, missing cookie, direct API call without auth).

### Step 2 — Ownership check (where applicable)

Applied in routes that operate on a specific resource:

```ts
const project = await prisma.project.findUnique({ where: { id } })

if (!project || project.userId !== userId) {
  return NextResponse.json({ error: 'Project not found' }, { status: 404 })
}
```

A missing project and a project owned by someone else both return `404`. This intentionally avoids leaking whether a project ID exists to users who do not own it.

### Route security summary

| Route | Auth check | Ownership check |
|-------|-----------|-----------------|
| `POST /api/projects` | Yes | N/A (creating new resource) |
| `GET /api/projects` | Yes | Implicit — query filtered by `userId` |
| `POST /api/projects/[id]/generate` | Yes | Yes — `project.userId !== userId` |

---

## Local Development

1. **Create a Clerk application** at [dashboard.clerk.com](https://dashboard.clerk.com). Choose "Next.js" as the framework.

2. **Copy API keys** from the Clerk dashboard into your local `.env`:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. **Optional — configure redirect URLs** in `.env`:

   ```env
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

   If these are omitted, Clerk falls back to its hosted Account Portal. For most local dev workflows, the defaults are fine.

4. **Run the dev server** as usual:

   ```bash
   npm run dev
   ```

5. **First sign-in** — navigate to `http://localhost:3000`. You will be redirected to the Clerk sign-in UI. After signing in, Clerk sets a session cookie and redirects back to `/`. The home page then upserts your User record in Postgres using your Clerk user ID.

> The Clerk secret key must never be committed to version control. Confirm that `.env` is listed in `.gitignore` before adding real keys.
