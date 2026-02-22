---
sop: "SOP-600"
title: "Environment Configuration"
phase: 6
iterative: false
prerequisites:
  - sop: "SOP-004"
outputs:
  - ".env.example"
  - "src/lib/env.ts"
  - "src/config/index.ts"
  - "src/app/api/health/route.ts"
related: ["SOP-004", "SOP-601", "SOP-602"]
---

# SOP-600: Environment Configuration

## Purpose

Standardize environment variable management, validation, and secrets handling across dev/staging/production.

## Scope

- **Covers:** Env file structure, Zod validation, secrets management, config by environment, health check
- **Excludes:** CI/CD pipelines (SOP-601), infrastructure provisioning

## Prerequisites

- [ ] SOP-004 (Environment Setup) — local dev configured
- [ ] Deployment targets identified
- [ ] Secrets manager selected (Vercel / GitHub Actions / AWS)

## Procedure

### 1. Environment File Structure

```
.env                # Defaults (committed, no secrets)
.env.local          # Local overrides (gitignored)
.env.development    # Dev defaults (committed)
.env.production     # Production non-secrets (committed)
.env.example        # All variables documented (committed)
```

### 2. Create Comprehensive `.env.example`

Group by category with inline comments:

- **App**: `NODE_ENV`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`
- **Database**: `DATABASE_URL` with format comment (`postgresql://USER:PASS@HOST:PORT/DB`)
- **Auth**: `NEXTAUTH_SECRET` (note: generate with `openssl rand -base64 32`), `NEXTAUTH_URL`
- **OAuth**: `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` (optional)
- **External Services**: `RESEND_API_KEY`, `OPENAI_API_KEY`, `SENTRY_DSN`, S3 vars (all empty by default)
- **Feature Flags**: `ENABLE_ANALYTICS=false`, `ENABLE_AI_FEATURES=false`

### 3. Validate Environment Variables (`src/lib/env.ts`)

Use Zod to validate all variables at startup:

- Required: `DATABASE_URL`, `NEXTAUTH_SECRET` (`.min(32)`), `NEXTAUTH_URL` (`.url()`), `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL` (`.url()`)
- Optional: OAuth, external service keys (`.optional()`)
- Booleans: `.string().transform(v => v === 'true').default('false')`
- If validation fails: log `parsed.error.flatten().fieldErrors` and throw

Export `env` singleton. Create `src/lib/env.client.ts` for `NEXT_PUBLIC_` vars only.

### 4. Create Environment-Specific Config (`src/config/index.ts`)

`AppConfig` interface for: `app` (name, url, isProduction), `features` (analytics, aiFeatures), `limits` (maxUploadSize, aiDailyLimit). Export `config` selecting `productionConfig` (strict limits, real features) or `developmentConfig` (relaxed limits, all features on) based on `NODE_ENV`.

### 5. Prisma Client with Env Validation (`src/lib/db.ts`)

Add `log: ['error']` in production (add `'query'/'warn'` in dev). Use `globalThis` trick to prevent hot-reload from creating multiple Prisma client instances in development.

### 6. Environment-Specific Behavior

In email or external service calls: check `NODE_ENV`. In `'development'` → log to console instead of sending real requests. In `'production'` → use real service. Gate expensive operations on `env.NODE_ENV`.

### 7. Secrets Management

**Vercel (recommended):** `vercel env add KEY production` → `vercel env pull .env.local`.

**GitHub Actions:** Store in repository Settings → Secrets → Actions. Reference as `${{ secrets.KEY }}` in workflows.

**AWS SSM (advanced):** Use `@aws-sdk/client-ssm` `GetParametersCommand` with `WithDecryption: true`.

### 8. Create Health Check (`src/app/api/health/route.ts`)

Return: `{ status: 'healthy'|'unhealthy', checks: { database: bool }, latency: { database: ms }, version, timestamp }`. Run `prisma.$queryRaw\`SELECT 1\``with try/catch; if DB fails, mark`status: 'unhealthy'`, return 503, otherwise 200.

### 9. Document Environments (`docs/environments.md`)

Matrix table: env / URL / database / features for dev, staging, production. Variable comparison table across envs. Secret rotation schedule (what rotates and when).

## Security Best Practices

| Do                               | Don't                     |
| -------------------------------- | ------------------------- |
| Store secrets in secret manager  | Commit secrets to Git     |
| Validate all env vars at startup | Assume vars exist         |
| Use different secrets per env    | Share secrets across envs |
| Rotate secrets regularly         | Keep secrets forever      |

## Review Checklist

- [ ] `.env.example` complete with all variables and comments
- [ ] Zod validation at startup in `src/lib/env.ts`
- [ ] Secrets NOT committed to Git
- [ ] Client-safe vars isolated in `env.client.ts`
- [ ] Config object per environment
- [ ] Health check endpoint working
- [ ] Environment documentation created

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read existing `.env*` files and `package.json`. Create validation and config infrastructure, then update existing service files to use `env`.

## Outputs

- [ ] `.env.example` (updated)
- [ ] `src/lib/env.ts`
- [ ] `src/lib/env.client.ts`
- [ ] `src/config/index.ts`
- [ ] `src/app/api/health/route.ts`
- [ ] `docs/environments.md`

## Related SOPs

- **SOP-004:** Environment Setup
- **SOP-601:** CI/CD Pipelines
- **SOP-602:** Monitoring
