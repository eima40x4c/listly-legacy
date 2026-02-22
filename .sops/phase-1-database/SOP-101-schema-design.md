---
sop: "SOP-101"
title: "Schema Design"
phase: 1
iterative: false
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
  - sop: "SOP-100"
    output: "/docs/database/database-decision.md"
outputs:
  - "prisma/schema.prisma"
  - "/docs/database/schema.md"
related: ["SOP-100", "SOP-102", "SOP-202"]
---

# SOP-101: Schema Design

## Purpose

Design a well-structured, normalized database schema that efficiently represents the data model, enforces integrity, and supports application queries.

## Scope

- **Covers:** Table design, relationships, constraints, indexes, Prisma schema
- **Excludes:** Query optimization, database administration

## Prerequisites

- [ ] SOP-000 completed — entities identified from `/docs/requirements.md`
- [ ] SOP-100 completed — database and ORM chosen

## Procedure

### 1. Identify Core Entities

From `/docs/requirements.md`, extract nouns the app manages and users interact with. Map relationships: "User **places** Order", "Order **contains** Products".

### 2. Define Entity Attributes

For each entity, list: id (primary key), all data fields with types, foreign key references, `created_at` / `updated_at` timestamps.

### 3. Map Relationship Types

| Relationship                | Implementation              |
| --------------------------- | --------------------------- |
| One-to-Many                 | FK on child table           |
| Many-to-Many (basic)        | Implicit join (`@relation`) |
| Many-to-Many + extra fields | Explicit join table model   |
| Self-referential (tree)     | Optional self-reference FK  |

### 4. Create ER Diagram (Mermaid)

Generate a Mermaid `erDiagram` block showing all entities, their key fields, and relationship lines. Include in `/docs/database/schema.md`.

### 5. Apply Normalization Rules

- **1NF:** No repeating groups; each cell = one value
- **2NF:** All non-key columns depend on the full primary key
- **3NF:** No transitive dependencies between non-key columns

Common violations: storing a comma-separated list (→ separate table), storing a derived value (→ compute at query time).

### 6. Write Prisma Schema

→ template: `.sops/templates/code/prisma-schema.template.prisma`

Standards:

- `@id @default(cuid())` on every model
- `created_at` / `updated_at` via `@map` for snake_case DB columns
- `@@map("plural_snake_case")` on every model
- `onDelete: Cascade` on child FKs where orphaned records are invalid
- Explicit enum types for status/role fields

### 7. Add Strategic Indexes

Add `@@index()` on every FK column, all ORDER BY columns, and filtered WHERE columns (e.g., `isActive`, `status`).

### 8. Run Migration

```bash
pnpm db:migrate
# or: prisma migrate dev --name init
```

### 9. Document in `/docs/database/schema.md`

Include: ER diagram (Mermaid), tables section with column table per model (name/type/constraints/description), indexes table (table/index name/columns/purpose).

## Review Checklist

- [ ] All entities from requirements identified
- [ ] ER diagram created
- [ ] Schema normalized to 3NF
- [ ] Primary keys on all tables
- [ ] Foreign keys with appropriate cascade rules
- [ ] Unique constraints where needed
- [ ] Indexes on FK and query columns
- [ ] `prisma/schema.prisma` created and migrations applied
- [ ] `/docs/database/schema.md` complete

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` and `/docs/database/database-decision.md` before designing.

## Outputs

- [ ] `prisma/schema.prisma`
- [ ] `/docs/database/schema.md` (with ER diagram)

## Related SOPs

- **SOP-100:** Database Selection
- **SOP-102:** Seed Data
- **SOP-202:** API Design
