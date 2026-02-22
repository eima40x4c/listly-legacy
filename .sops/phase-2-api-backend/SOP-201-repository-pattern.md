---
sop: "SOP-201"
title: "Repository Pattern"
phase: 2
iterative: true
prerequisites:
  - sop: "SOP-101"
    output: "prisma/schema.prisma"
  - sop: "SOP-005"
    output: "/docs/architecture/design-patterns.md"
outputs:
  - "src/repositories/*.repository.ts"
  - "src/repositories/interfaces/*.interface.ts"
related: ["SOP-101", "SOP-200", "SOP-202"]
---

# SOP-201: Repository Pattern

## Purpose

Abstract all database access behind repository interfaces, keeping Prisma/ORM usage out of service and route layers.

## Scope

- **Covers:** Repository interfaces, Prisma implementations, data access abstraction
- **Excludes:** Business logic (SOP-200), API routing (SOP-202)

## Prerequisites

- [ ] SOP-101 completed — `prisma/schema.prisma` finalized
- [ ] SOP-005 completed — repository pattern decision documented

## Procedure

**Iterative — repeat for each Prisma model.**

### 1. Manifest All Entities

List every Prisma model that requires data access. Note: entities with complex query needs (filters, pagination, relations to eager-load).

### 2. For Each Entity — Create Interface

→ template: `.sops/templates/code/repository.ts.template`

File: `src/repositories/interfaces/[entity]-repository.interface.ts`

Define: `findById`, `findMany` (with optional filter param), `create`, `update`, `delete`. Add specialized query methods only if the service will need them (e.g., `findByEmail`, `findActive`).

### 3. For Each Entity — Implement Repository

File: `src/repositories/[entity].repository.ts`

Rules:

- Use `prisma` client only here (imported from `@/lib/db`)
- Map filter params to Prisma `where` clauses
- Include necessary relations via `include` only where needed across all callers
- Return Prisma model types (or mapped DTOs if different output types are needed)

### 4. Export Repository Singletons

In `src/lib/service-factory.ts` or a dedicated `src/lib/repositories.ts`, export each as a singleton:

```typescript
export const [entity]Repository = [entity]Repository;
```

### 5. Checkpoint After Each Entity

Verify: interface exported, repository matches interface, `findMany` handles all filter cases used by the service layer.

## Review Checklist

- [ ] Interface defined for every repository
- [ ] All Prisma usage contained within repository files
- [ ] Repository methods match what service layer needs
- [ ] Filtering/pagination handled in repository (not service)
- [ ] Singletons exported and injectable

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Implement one repository per iteration, verify it satisfies the corresponding service interface before proceeding.

## Outputs

- [ ] `src/repositories/interfaces/[entity]-repository.interface.ts` (per entity)
- [ ] `src/repositories/[entity].repository.ts` (per entity)

## Related SOPs

- **SOP-101:** Schema Design
- **SOP-200:** Service Layer
- **SOP-202:** API Design
