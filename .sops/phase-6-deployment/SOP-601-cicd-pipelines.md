---
sop: "SOP-601"
title: "CI/CD Pipelines"
phase: 6
iterative: false
prerequisites:
  - sop: "SOP-500"
  - sop: "SOP-501"
  - sop: "SOP-600"
outputs:
  - ".github/workflows/ci.yml"
  - ".github/workflows/deploy.yml"
  - ".github/workflows/preview.yml"
  - ".github/workflows/migrate.yml"
related: ["SOP-500", "SOP-501", "SOP-600", "SOP-602"]
---

# SOP-601: CI/CD Pipelines

## Purpose

Automate testing, building, and deploying the application via GitHub Actions.

## Scope

- **Covers:** CI workflow, preview deployments, production deployment, DB migrations, Docker builds, release notes
- **Excludes:** Infrastructure provisioning, Kubernetes

## Prerequisites

- [ ] SOP-500/501 testing configured
- [ ] SOP-600 environments defined
- [ ] Repository on GitHub
- [ ] Deployment target selected (Vercel, Railway, etc.)

## Pipeline Overview

`Push → Lint + Type Check → Unit Tests → Integration Tests (with Postgres DB) → Build → Deploy`

All jobs run in parallel where possible. Build is gated on lint + unit tests passing.

## Procedure

### 1. Main CI Workflow (`.github/workflows/ci.yml`)

Triggers: `push` to `main`/`develop`, PRs to `main`/`develop`. Set `concurrency` with `cancel-in-progress: true` to drop stale runs.

**Jobs (all run `ubuntu-latest`):**

| Job                | Steps                                                                                                                                  | Needs               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `lint`             | checkout, setup pnpm+node (cache), install, `pnpm lint`, `pnpm type-check`                                                             | —                   |
| `test-unit`        | checkout, setup, install, `pnpm test:run`, upload coverage to Codecov                                                                  | —                   |
| `test-integration` | `services: postgres:15` (with health check), checkout, setup, install, `pnpm prisma db push`, `pnpm test:integration` with DB env vars | —                   |
| `build`            | checkout, setup, install, `pnpm build` (with dummy env vars), upload `.next/` artifact                                                 | `lint`, `test-unit` |

### 2. Production Deployment (`.github/workflows/deploy.yml`)

Triggers: `push` to `main`, `workflow_dispatch`.

**For Vercel:**

- Use `amondnet/vercel-action@v25` with `vercel-args: '--prod'`
- Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Post-deploy step: `npx prisma migrate deploy` with `DATABASE_URL` secret

### 3. Preview Deployments (`.github/workflows/preview.yml`)

Triggers: `pull_request` types `[opened, synchronize, reopened]`.

- Deploy to Vercel without `--prod` flag → gets unique preview URL
- Comment preview URL on PR using `actions/github-script@v7`

### 4. Database Migration Workflow (`.github/workflows/migrate.yml`)

Trigger: `workflow_dispatch` with `environment` input (`staging` or `production`).

- Run `pnpm prisma migrate deploy` with `DATABASE_URL` from environment secret
- Log success/failure

### 5. Docker Build (`.github/workflows/docker.yml`) — _optional_

Triggers: push to `main`, `v*` tags.

Multi-stage Dockerfile:

1. **base**: `node:20-alpine`, enable pnpm via `corepack`
2. **deps**: copy `package.json` + lockfile, `pnpm install --frozen-lockfile`
3. **builder**: copy `node_modules`, copy source, `pnpm prisma generate`, `pnpm build`
4. **runner**: `NODE_ENV=production`, non-root `nextjs` user, copy `.next/standalone` + `.next/static` + `public`, expose 3000, `CMD ["node", "server.js"]`

Push to GitHub Container Registry (`ghcr.io`) with build cache (`type=gha`).

### 6. Scheduled Jobs (`.github/workflows/scheduled.yml`)

- **Daily at 3 AM UTC:** DB backup (call backup script)
- **Weekly:** `npx npm-check-updates -u --target minor` — report if updates exist
- **On schedule:** `pnpm audit --audit-level=moderate` — security scan

### 7. Release Workflow (`.github/workflows/release.yml`)

Trigger: push `v*` tags. Use `orhun/git-cliff-action` for changelog, then `softprops/action-gh-release` to create GitHub release. Mark as pre-release if tag contains `alpha` or `beta`.

### 8. Branch Protection (configure in GitHub UI)

For `main`: require status checks (`lint`, `test-unit`, `build`), require 1 approving review, dismiss stale reviews, linear history.

## Pipeline Optimization

| Technique                        | Benefit              |
| -------------------------------- | -------------------- |
| Parallel jobs                    | Faster total time    |
| pnpm cache                       | Faster installs      |
| Concurrency + cancel-in-progress | Drop stale runs      |
| Build artifacts                  | Reuse across jobs    |
| Conditional jobs                 | Skip when not needed |

## Review Checklist

- [ ] CI runs lint, tests, build on every PR
- [ ] Integration tests use local Postgres service
- [ ] Coverage uploaded to Codecov
- [ ] Preview deployments comment on PRs
- [ ] Production deploys from `main` only
- [ ] DB migrations run post-deploy
- [ ] Secrets stored in GitHub Secrets (not hardcoded)
- [ ] Branch protection rules configured

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `package.json` for script names and `.github/` for any existing workflows. Create CI and deploy workflows matching the test scripts.

## Outputs

- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/deploy.yml`
- [ ] `.github/workflows/preview.yml`
- [ ] `.github/workflows/migrate.yml`
- [ ] `.github/workflows/scheduled.yml`
- [ ] `Dockerfile` (if using Docker)

## Related SOPs

- **SOP-500/501:** Testing
- **SOP-600:** Environment Config
- **SOP-602:** Monitoring
