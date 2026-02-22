---
sop: "SOP-004"
title: "Environment Setup"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-002"
    output: "README.md"
  - sop: "SOP-003"
    output: "/docs/architecture/project-structure.md"
outputs:
  - ".env.example"
  - "/docs/environment-variables.md"
  - "docker-compose.yml"
  - ".vscode/settings.json"
  - "/docs/development-setup.md"
related: ["SOP-002", "SOP-003", "SOP-006"]
---

# SOP-004: Environment Setup

## Purpose

Establish a consistent, secure, and reproducible development environment so all team members can run the project locally with identical settings.

## Scope

- **Covers:** Environment variables, local development setup, Docker, IDE settings
- **Excludes:** CI/CD (SOP-601), production deployment (SOP-600)

## Prerequisites

- [ ] SOP-002 completed — repository initialized
- [ ] SOP-003 completed — project structure exists
- [ ] Dev tools installed (Node.js/Python, Docker, etc.)

## Procedure

### 1. Identify Required Environment Variables

Categorize by: Database (`DATABASE_URL`, `DB_PASSWORD`), Authentication (`JWT_SECRET`, `NEXTAUTH_SECRET`), Third-party APIs, Application config (`NODE_ENV`, `PORT`, `APP_URL`), Feature Flags.

### 2. Create `.env.example`

Rules: no real secrets, include generation instructions as comments (e.g., `# Generate: openssl rand -base64 32`), group by category with comment headers.

### 3. Document Environment Variables

Create `/docs/environment-variables.md` with: required variables table (name/description/example/required), optional variables table (name/description/default), how to generate secrets, environment-specific value differences (dev/staging/prod).

### 4. Set Up Local Development Database

**Option A (Recommended) — Docker Compose:**

→ template: `.sops/templates/code/docker-compose.yml.template`

**Option B — Cloud dev database:** Supabase, Railway, or PlanetScale free tiers.

### 5. Create Setup Script

Script must: check required tools are installed, copy `.env.example` → `.env` if missing, install dependencies, start database, run migrations, optionally seed.

### 6. Add Dev Scripts to `package.json`

Required scripts: `dev`, `build`, `start`, `lint`, `setup`, `db:migrate`, `db:push`, `db:seed`, `db:studio`, `docker:up`, `docker:down`.

### 7. Configure IDE Settings

→ template: `.sops/templates/code/vscode-settings.json.template`

### 8. Document Local Setup in `docs/development-setup.md`

Include: prerequisites, quick start (clone → `pnpm setup` → `pnpm dev`), manual step-by-step, common issues.

## Review Checklist

- [ ] `.env.example` created with all variables
- [ ] Environment variables documented
- [ ] Docker Compose configured
- [ ] Setup script created
- [ ] Package.json scripts defined
- [ ] VS Code settings configured
- [ ] Development setup documented
- [ ] No real secrets committed to repository

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/tech-stack.md` for service choices (auth provider, database, etc.) before creating `.env.example`.

## Outputs

- [ ] `.env.example`
- [ ] `/docs/environment-variables.md`
- [ ] `docker-compose.yml`
- [ ] `.vscode/settings.json` and `.vscode/extensions.json`
- [ ] `/docs/development-setup.md`
- [ ] Setup scripts in `package.json`

## Related SOPs

- **SOP-002:** Repository Setup
- **SOP-003:** Project Structure
- **SOP-006:** Code Style Standards
