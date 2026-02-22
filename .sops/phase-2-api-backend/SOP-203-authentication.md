---
sop: "SOP-203"
title: "Authentication"
phase: 2
iterative: false
prerequisites:
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
  - sop: "SOP-202"
    output: "/docs/api/openapi.yaml"
outputs:
  - "src/lib/auth.ts"
  - "src/middleware/auth.ts"
  - "/docs/architecture/auth-flow.md"
related: ["SOP-202", "SOP-204", "SOP-203"]
---

# SOP-203: Authentication

## Purpose

Implement a secure, consistent authentication mechanism protecting all relevant API endpoints.

## Scope

- **Covers:** Auth strategy selection, token/session setup, protected route middleware, auth flow documentation
- **Excludes:** Authorization/permissions (SOP-204), user profile management

## Prerequisites

- [ ] SOP-001 completed — auth provider decided in `/docs/tech-stack.md`
- [ ] SOP-202 completed — which endpoints require authentication is known

## Procedure

### 1. Confirm Auth Strategy from Tech Stack

Read `/docs/tech-stack.md`. Common strategies:

| Strategy             | When to Use                 | Implementation                      |
| -------------------- | --------------------------- | ----------------------------------- |
| **NextAuth.js**      | Next.js + OAuth/credentials | `src/lib/auth.ts` (NextAuth config) |
| **Supabase Auth**    | Supabase stack              | Use Supabase client's `auth` module |
| **JWT (custom)**     | Non-Next.js APIs            | Access + refresh token pair         |
| **Session (custom)** | Server-rendered apps        | Cookie-based session store          |

### 2. Implement Auth Configuration

For **NextAuth:** configure providers, session strategy (`jwt` or `database`), callbacks (`session`, `jwt`), adapter if using database sessions.

For **Supabase Auth:** configure client in `src/lib/supabase.ts`, enable required providers in Supabase dashboard.

For **Custom JWT:** implement `generateTokens(userId)`, `verifyAccessToken(token)`, `verifyRefreshToken(token)`, token rotation on refresh.

### 3. Implement Auth Middleware

Protect routes by validating the token/session on each request. The middleware must:

1. Extract token from `Authorization: Bearer ...` header or session cookie
2. Verify token validity and expiry
3. Attach the authenticated user object to the request context
4. Return `401 Unauthorized` if token is missing or invalid

### 4. Implement Auth Endpoints

Required endpoints (map to service + route handler):

- `POST /api/auth/register` — create user, hash password, issue tokens
- `POST /api/auth/login` — verify credentials, issue tokens
- `POST /api/auth/logout` — invalidate session/token
- `POST /api/auth/refresh` — rotate refresh token, issue new access token

For NextAuth/Supabase: these are handled by the library; configure callbacks instead.

### 5. Protect Routes

Apply auth middleware to all routes that require authentication. Document which endpoints are public vs. protected in `/docs/api/endpoints.md`.

### 6. Document Auth Flow

Create `/docs/architecture/auth-flow.md` with: sequence diagram (Mermaid) of login/refresh flow, token lifetime values, session configuration, security considerations.

## Review Checklist

- [ ] Auth strategy matches tech stack choice
- [ ] Tokens/sessions issued on successful login
- [ ] Passwords hashed (bcrypt, Argon2) — never plain text
- [ ] Auth middleware protects all private routes
- [ ] `401` returned for missing/invalid tokens
- [ ] Refresh token rotation implemented
- [ ] Auth flow documented

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/tech-stack.md` to determine the auth provider before implementing.

## Outputs

- [ ] `src/lib/auth.ts` (or equivalent auth config)
- [ ] `src/middleware/auth.ts`
- [ ] `/docs/architecture/auth-flow.md`

## Related SOPs

- **SOP-202:** API Design
- **SOP-204:** Authorization
