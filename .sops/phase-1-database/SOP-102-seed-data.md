---
sop: "SOP-102"
title: "Seed Data"
phase: 1
iterative: false
prerequisites:
  - sop: "SOP-101"
    output: "prisma/schema.prisma"
outputs:
  - "prisma/seed.ts"
  - "/docs/database/seed-data.md"
related: ["SOP-101", "SOP-004", "SOP-500"]
---

# SOP-102: Seed Data

## Purpose

Create realistic, consistent seed data for local development and testing. Good seed data accelerates development and ensures consistent behavior across team environments.

## Scope

- **Covers:** Development seeds, test fixtures, data generation
- **Excludes:** Production data migration, backup/restore

## Prerequisites

- [ ] SOP-101 completed — `prisma/schema.prisma` finalized, migrations applied

## Procedure

### 1. Identify Seed Data Needs

| Type           | Purpose              | Examples                                       |
| -------------- | -------------------- | ---------------------------------------------- |
| Reference data | Static lookup values | Categories, roles, countries                   |
| Test users     | Named dev accounts   | Admin, standard user, demo                     |
| Sample content | Realistic data       | Products, posts, orders                        |
| Edge cases     | Boundary testing     | Out-of-stock, max-length strings, empty states |

### 2. Create `prisma/seed.ts`

→ template: `.sops/templates/code/seed.ts.template`

Structure:

1. `clearDatabase()` — deletes in reverse FK dependency order
2. `seedReferenceData()` — static lookup tables first
3. `seedUsers()` — test accounts with known passwords (document in `/docs/database/seed-data.md`)
4. `seedSampleContent()` — realistic records, use `@faker-js/faker` for bulk generation
5. `seedEdgeCases()` — out-of-stock, empty, max-value records

### 3. Configure Seed Command in `package.json`

```json
{
  "prisma": { "seed": "tsx prisma/seed.ts" },
  "scripts": { "db:seed": "prisma db seed", "db:reset": "prisma migrate reset" }
}
```

Install executor: `pnpm add -D tsx`

### 4. Document in `/docs/database/seed-data.md`

Include: how to run (`pnpm db:seed`, `pnpm db:reset`), test accounts table (email/password/role/purpose), data quantity table (entity/count/notes).

## Review Checklist

- [ ] Seed script runs without errors
- [ ] Reference data seeded
- [ ] Test user accounts created
- [ ] Sample content with realistic data
- [ ] Edge cases included
- [ ] Seed command in `package.json`
- [ ] Test user credentials documented in `/docs/database/seed-data.md`

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `prisma/schema.prisma` and `/docs/requirements.md` to understand entities and relationships before writing seed functions.

## Outputs

- [ ] `prisma/seed.ts`
- [ ] `/docs/database/seed-data.md`

## Related SOPs

- **SOP-101:** Schema Design
- **SOP-004:** Environment Setup
- **SOP-500:** Unit Testing
