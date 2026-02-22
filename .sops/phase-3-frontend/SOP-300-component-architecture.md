---
sop: "SOP-300"
title: "Component Architecture"
phase: 3
iterative: false
prerequisites:
  - sop: "SOP-003"
    output: "/docs/architecture/project-structure.md"
  - sop: "SOP-005"
    output: "/docs/architecture/design-patterns.md"
outputs:
  - "src/components/ui/"
  - "src/components/layout/"
  - "src/components/features/"
  - "/docs/components/README.md"
related: ["SOP-003", "SOP-301", "SOP-304"]
---

# SOP-300: Component Architecture

## Purpose

Establish a consistent, scalable component structure that promotes reusability and clear separation of concerns.

## Scope

- **Covers:** Component folder organization, design principles, barrel exports, server/client splits
- **Excludes:** Styling (SOP-301), form logic (SOP-304)

## Prerequisites

- [ ] SOP-003 completed — project folder structure exists
- [ ] SOP-005 completed — component patterns decided

## Procedure

### 1. Create Component Folder Structure

```
src/components/
├── ui/           # Base building blocks (Button, Input, Card, Modal)
├── layout/       # Page structure (Header, Footer, Sidebar, Container)
├── forms/        # Form inputs and fields (FormField, Select, Checkbox)
└── features/     # Feature-grouped components (products/, cart/, auth/)
    └── [feature]/
        └── [ComponentName]/
            ├── [ComponentName].tsx
            ├── [ComponentName].test.tsx
            └── index.ts            ← barrel export
```

### 2. Component Design Principles

- **Single responsibility:** Each component does one thing. Split display from data-fetching.
- **Composition over props:** Prefer compound patterns (`<Card.Body>`, `<Card.Footer>`) over 5+ prop drilling.
- **Explicit prop interfaces:** Always define and export a `[ComponentName]Props` interface. Extend HTML element types (`ButtonHTMLAttributes`, `InputHTMLAttributes`) where relevant.
- **`forwardRef`:** Use on all base UI components to support ref forwarding.
- **`displayName`:** Set on all `forwardRef` components for DevTools readability.

### 3. Server vs Client Components (Next.js App Router)

- Default to **Server Components** for static display and data fetching
- Add `'use client'` directive only when: using hooks, handling events, using browser APIs, needing interactive state
- Split interactive islands out of Server Components into small Client Components

### 4. Create Base UI Components

Required base components to implement: `Button` (with `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon` props), `Input`, `Card` (with compound subcomponents: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`), `Modal`.

### 5. Create Layout Components

Required: `Header`, `Footer`, `Sidebar` (if applicable), `Container` (responsive max-width wrapper: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`).

### 6. Set Up Barrel Exports

Create `src/components/ui/index.ts` exporting all UI components and their prop types. Create similar barrel files per feature folder.

### 7. Document in `/docs/components/README.md`

Include: component category table, how to create a new component (4-step process), naming conventions, server/client guidance.

## Review Checklist

- [ ] Component folder structure matches spec
- [ ] UI components use `forwardRef` and explicit props interfaces
- [ ] Components follow single responsibility
- [ ] Compound component pattern used for complex UI
- [ ] Barrel exports configured
- [ ] Server/client components separated correctly
- [ ] Component documentation exists

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/tech-stack.md` for framework (React/Next.js). Use context cache for entities/features to determine which feature components to scaffold.

## Outputs

- [ ] `src/components/ui/` — Base UI components
- [ ] `src/components/layout/` — Layout components
- [ ] `src/components/features/` — Feature skeleton folders
- [ ] `/docs/components/README.md`

## Related SOPs

- **SOP-003:** Project Structure
- **SOP-301:** Styling Standards
- **SOP-304:** Form Handling
