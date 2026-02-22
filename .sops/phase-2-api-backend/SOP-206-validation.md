---
sop: "SOP-206"
title: "Validation"
phase: 2
iterative: true
prerequisites:
  - sop: "SOP-202"
    output: "/docs/api/openapi.yaml"
  - sop: "SOP-205"
    output: "src/lib/errors.ts"
outputs:
  - "src/validators/*.schema.ts"
  - "src/middleware/validate.ts"
related: ["SOP-202", "SOP-205", "SOP-200"]
---

# SOP-206: Validation

## Purpose

Validate and sanitize all incoming API input before it reaches service or repository layers, ensuring data integrity and preventing injection attacks.

## Scope

- **Covers:** Schema validation (Zod), validation middleware, file upload validation
- **Excludes:** Business rule validation (belongs in services — SOP-200)

## Prerequisites

- [ ] SOP-202 completed — request schemas defined
- [ ] SOP-205 completed — `ValidationError` class available

## Procedure

**Iterative — repeat for each API endpoint group.**

### 1. Install Zod

```bash
pnpm add zod
```

### 2. Create Validation Schemas (per resource)

File: `src/validators/[entity].schema.ts`

Create schemas for: `Create[Entity]Schema`, `Update[Entity]Schema` (all fields optional with `.partial()`), `[Entity]FilterSchema` (query params), `[Entity]IdSchema` (path param).

Validation rules:

- Strings: `.min(1)` (no empty strings), `.max(N)` for field limits, `.email()` / `.url()` / `.uuid()` where applicable
- Numbers: `.int()`, `.positive()`, `.min(0)` as appropriate
- Required vs optional: match what the OpenAPI spec defines

### 3. Create Validation Middleware

`src/middleware/validate.ts` — accept a Zod schema, parse the appropriate part of the request (body/query/params), and:

- On success: attach parsed (typed) value to the request and call `next()`
- On failure: throw `ValidationError` with `issues[].message` as details

### 4. Apply Validation Middleware to Routes

For each route: chain `validate(body, Create[Entity]Schema)` or `validate(query, [Entity]FilterSchema)` before the route handler. The handler receives already-validated, typed data.

### 5. Checkpoint After Each Resource

Verify: all endpoints for the resource have validation, error messages are useful, no unvalidated request data reaches services.

## Review Checklist

- [ ] Zod installed
- [ ] Schemas defined for every request type (body, query, params)
- [ ] Validation middleware created and applied to all routes
- [ ] `ValidationError` thrown with field-level details on failure
- [ ] No raw request data reaches service layer without validation

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `/docs/api/openapi.yaml` for the request schemas to validate. Implement one endpoint group per iteration.

## Outputs

- [ ] `src/validators/[entity].schema.ts` (per entity)
- [ ] `src/middleware/validate.ts`

## Related SOPs

- **SOP-202:** API Design
- **SOP-205:** Error Handling
- **SOP-200:** Service Layer
