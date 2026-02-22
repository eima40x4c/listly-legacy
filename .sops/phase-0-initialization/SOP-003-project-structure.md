---
sop: "SOP-003"
title: "Project Structure"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
  - sop: "SOP-002"
    output: "README.md"
outputs:
  - "Folder structure (created on disk)"
  - "/docs/architecture/project-structure.md"
related: ["SOP-001", "SOP-002", "SOP-004", "SOP-005"]
---

# SOP-003: Project Structure

## Purpose

Define a consistent, scalable folder structure that organizes code logically, separates concerns, and follows framework conventions.

## Scope

- **Covers:** Folder organization, file naming, module boundaries, path aliases
- **Excludes:** File contents (see implementation SOPs)

## Prerequisites

- [ ] SOP-001 completed — `/docs/tech-stack.md` exists
- [ ] SOP-002 completed — repository initialized

## Procedure

### 1. Select Structure for Tech Stack

Read `/docs/tech-stack.md` to determine framework, then create the matching structure. Adapt the `mkdir` command in Step 4 to your chosen framework (the example below is for Next.js App Router).

### 2. Apply File Naming Conventions

| Type             | Convention            | Example                       |
| ---------------- | --------------------- | ----------------------------- |
| React Components | PascalCase            | `UserCard.tsx`                |
| Utilities/Hooks  | camelCase             | `useAuth.ts`, `formatDate.ts` |
| Routes/Folders   | kebab-case            | `user-profile/page.tsx`       |
| Config files     | kebab-case            | `tailwind.config.ts`          |
| Tests            | Source name + `.test` | `UserCard.test.tsx`           |

### 3. Apply Module Organization Principles

- **Colocation:** Keep component, test, and stories files in the same folder; export via `index.ts`
- **Separation of concerns:** `components/` (UI), `services/` (business logic), `hooks/` (state), `types/` (definitions), `lib/` (utilities)

### 4. Create Folder Structure on Disk

```bash
# Next.js example
mkdir -p src/{app,components/{ui,forms,layout,features},lib,hooks,types,services,config}
mkdir -p docs prisma/migrations public/{images,fonts} tests/{unit,integration}
```

### 5. Configure Path Aliases (`tsconfig.json`)

Add `"paths": { "@/*": ["./src/*"] }` under `compilerOptions`. Verify IDE picks up the aliases.

### 6. Add Barrel Files (`index.ts`)

Create `index.ts` in `src/components/ui/` and other shared directories for clean imports.

### 7. Document Structure

Create `/docs/architecture/project-structure.md` with: directory map table (path → purpose), naming conventions summary, import alias reference.

## Review Checklist

- [ ] Folder structure follows framework conventions
- [ ] All major directories created
- [ ] File naming conventions documented
- [ ] Path aliases configured
- [ ] Barrel files created
- [ ] `/docs/architecture/project-structure.md` created

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/tech-stack.md` to select the correct structure template.

## Outputs

- [ ] Complete folder structure on disk
- [ ] Path aliases in `tsconfig.json`
- [ ] `/docs/architecture/project-structure.md`

## Related SOPs

- **SOP-001:** Tech Stack Selection
- **SOP-002:** Repository Setup
- **SOP-004:** Environment Setup
- **SOP-005:** Design Patterns
