---
sop: "SOP-200"
title: "Service Layer"
phase: 2
iterative: true
prerequisites:
  - sop: "SOP-101"
    output: "prisma/schema.prisma"
  - sop: "SOP-005"
    output: "/docs/architecture/design-patterns.md"
outputs:
  - "src/services/*.service.ts"
  - "src/services/interfaces/*.interface.ts"
  - "src/lib/service-factory.ts"
  - "/docs/architecture/business-rules.md"
related: ["SOP-101", "SOP-201", "SOP-202"]
---

# SOP-200: Service Layer

## Purpose

Implement the service layer containing all business logic, keeping it separate from data access (repositories) and transport (API routes).

## Scope

- **Covers:** Service interfaces, implementations, factory, business rule documentation
- **Excludes:** Data access (SOP-201), API routing (SOP-202)

## Prerequisites

- [ ] SOP-101 completed — schema and entities known
- [ ] SOP-005 completed — service pattern chosen (function-based or class)

## Procedure

**Iterative — repeat for each entity from `prisma/schema.prisma`.**

### 1. Manifest All Entities

List every entity from the Prisma schema that requires business logic. For each, note: CRUD needs, domain operations (non-CRUD), business rules, cross-entity dependencies.

### 2. For Each Entity — Create Interface

→ template: `.sops/templates/code/service.ts.template`

File: `src/services/interfaces/[entity]-service.interface.ts`

Define: standard CRUD signatures + all domain-specific operations. Use TypeScript types from `@/types/[entity]` or inferred Prisma types.

### 3. For Each Entity — Implement Service

File: `src/services/[entity].service.ts`

Rules:

- Call repository methods only (never Prisma directly)
- Put all business rules in service functions (validation, authorization checks, cross-entity logic)
- Throw typed errors using the project error system (SOP-205)
- Validate existence before update/delete (throw `NotFoundError` if missing)

### 4. Register in Service Factory

Add each service to `src/lib/service-factory.ts` as a singleton:

```typescript
export const [entity]Service = create[Entity]Service([entity]Repository);
```

### 5. Document Business Rules

Create / update `/docs/architecture/business-rules.md` for each entity: list each rule, the rationale, and which service function enforces it.

### 6. Checkpoint After Each Entity

Verify: interface exported, service function created, factory registered, business rules documented. Proceed to next entity.

## Review Checklist

- [ ] Interface defined for every entity service
- [ ] All business rules implemented in service (not repository, not route)
- [ ] Services use repository interfaces (not Prisma directly)
- [ ] Typed errors thrown on not-found / validation failure
- [ ] Service factory exports all services as singletons
- [ ] Business rules documented

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Manifest all entities first, then implement one entity per iteration with a checkpoint between each.

## Outputs

- [ ] `src/services/interfaces/[entity]-service.interface.ts` (per entity)
- [ ] `src/services/[entity].service.ts` (per entity)
- [ ] `src/lib/service-factory.ts`
- [ ] `/docs/architecture/business-rules.md`

## Related SOPs

- **SOP-101:** Schema Design
- **SOP-201:** Repository Pattern
- **SOP-202:** API Design
