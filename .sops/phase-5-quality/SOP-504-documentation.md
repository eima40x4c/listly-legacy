---
sop: "SOP-504"
title: "Documentation"
phase: 5
iterative: false
prerequisites:
  - sop: "SOP-003"
  - sop: "SOP-202"
outputs:
  - "README.md"
  - "CONTRIBUTING.md"
  - "docs/api/openapi.yaml"
  - "docs/architecture/"
related: ["SOP-202", "SOP-003", "SOP-002"]
---

# SOP-504: Documentation

## Purpose

Establish documentation standards so current and future developers can set up, understand, and contribute to the project.

## Scope

- **Covers:** README, TSDoc, OpenAPI spec, Architecture Decision Records, how-to guides, CONTRIBUTING
- **Excludes:** User-facing/marketing documentation

## Prerequisites

- [ ] SOP-003 (Project Structure) — project organized
- [ ] SOP-202 (API Design) — APIs defined
- [ ] Core features implemented

## Documentation Types

| Type         | Location                 | Audience       |
| ------------ | ------------------------ | -------------- |
| README       | `/README.md`             | All developers |
| API Docs     | `/docs/api/openapi.yaml` | API consumers  |
| Architecture | `/docs/architecture/`    | Senior devs    |
| Guides       | `/docs/guides/`          | All developers |
| TSDoc        | Inline                   | Contributors   |
| CONTRIBUTING | `/CONTRIBUTING.md`       | Contributors   |

## Procedure

### 1. Update README (`/README.md`)

> Enhances the skeleton created in SOP-002 with full project documentation now that features are implemented.

Required sections:

- **Project Name** + one-line description
- **Features** — bullet list with ✅/🚧 indicators
- **Tech Stack** — framework, database, auth, styling
- **Getting Started** — prerequisites (Node.js/pnpm/DB versions), installation steps (`git clone`, `pnpm install`, `cp .env.example .env`, `pnpm db:push`, `pnpm db:seed`, `pnpm dev`)
- **Environment Variables** — table with name, description, required
- **Development** — test, lint, type-check, build commands
- **Project Structure** — brief `src/` directory tree
- **API Documentation** — link to `docs/api/`
- **Contributing** — link to `CONTRIBUTING.md`
- **License**

### 2. Add TSDoc to Exported Functions

For every exported function: `@param`, `@returns`, `@example` with actual runnable usage, `@throws` if applicable, `@see` link to MDN/docs when relevant.

For exported interfaces/types: JSDoc on the type itself describing purpose, and inline `/** */` comments on each property.

### 3. Update OpenAPI Spec (`docs/api/openapi.yaml`)

> Finalizes the spec started in SOP-202, ensuring all implemented endpoints are documented.

Required sections:

- `openapi: 3.0.3`, `info` (title, version, contact)
- `servers` (development + production)
- `tags` per resource
- `paths` for every endpoint with: `summary`, `tags`, `parameters`, `requestBody` (if applicable), `responses` covering 200/201, 400, 401, 403, 404, 409

Reference shared `components/schemas`, `components/responses` (e.g., `NotFound`), and `securitySchemes` (JWT bearer).

### 4. Create Architecture Decision Records (`docs/architecture/decisions/`)

ADR format for every significant technical decision:

```markdown
# ADR [N]: [Title]

## Status: [Proposed | Accepted | Deprecated | Superseded by ADR-N]

## Context: [What forced this decision]

## Decision: [What we chose]

## Consequences:

### Positive

### Negative

### Neutral

## Related: [Links to other ADRs or docs]
```

Create at minimum: routing approach, database choice, auth library, state management.

### 5. Write How-To Guides (`docs/guides/`)

At minimum: `adding-new-feature.md` with steps: schema → migration → API → UI components → tests → documentation update.

### 6. Update `CONTRIBUTING.md`

> Enhances the initial version from SOP-002 / SOP-503 with full project contributing guidelines.

Sections: getting started (fork, clone, branch, change, test, commit, PR), code style, commit message format (conventional commits with examples), PR process, reporting issues, code of conduct reference.

### 7. Set Up Documentation Generation

```bash
pnpm add -D typedoc
```

`typedoc.json`: entryPoints `src/lib`, excludePrivate/Protected, exclude test/mock files. Add `docs:generate` script.

## Documentation Principles

| Principle           |                                      |
| ------------------- | ------------------------------------ |
| Keep it updated     | Outdated docs are worse than no docs |
| Write for newcomers | Assume no prior knowledge            |
| Show examples       | Code examples > prose                |
| Link, don't repeat  | Reference existing docs              |
| Docs live with code | Version-controlled in repo           |

## Review Checklist

- [ ] README complete with working setup instructions
- [ ] TSDoc on all exported functions and types
- [ ] OpenAPI spec covers all endpoints
- [ ] At least one ADR per major tech choice
- [ ] CONTRIBUTING guide exists
- [ ] All env variables documented
- [ ] `typedoc.json` configured

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `src/lib/` for exported functions, `src/app/api/` for routes, and existing `docs/` for context.

## Outputs

- [ ] `README.md` (update from SOP-002)
- [ ] `CONTRIBUTING.md` (update from SOP-002/SOP-503)
- [ ] `docs/api/openapi.yaml` (update from SOP-202)
- [ ] `docs/architecture/decisions/` — ADRs
- [ ] `docs/guides/adding-new-feature.md`
- [ ] TSDoc in source files
- [ ] `typedoc.json`

## Related SOPs

- **SOP-202:** API Design
- **SOP-003:** Project Structure
- **SOP-002:** Repository Setup
