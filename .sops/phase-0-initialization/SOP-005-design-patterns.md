---
sop: "SOP-005"
title: "Design Patterns"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
outputs:
  - "/docs/architecture/design-patterns.md"
related: ["SOP-001", "SOP-003", "SOP-006"]
---

# SOP-005: Design Patterns

## Purpose

Select and document appropriate architectural and code-level design patterns. Good pattern selection creates consistency and improves maintainability.

## Scope

- **Covers:** Architectural patterns, code organization patterns, common implementation patterns
- **Excludes:** Framework-specific patterns (covered in respective SOPs)

## Prerequisites

- [ ] SOP-000 completed — requirements understood
- [ ] SOP-001 completed — tech stack selected

## Procedure

### 1. Select Architectural Pattern

| Pattern              | Best For                    | Complexity | Team Size |
| -------------------- | --------------------------- | ---------- | --------- |
| **Monolith**         | MVPs, simple domains        | Low        | 1–5       |
| **Modular Monolith** | Growing apps, clear domains | Medium     | 3–10      |
| **Microservices**    | Large scale, multiple teams | High       | 10+       |
| **Serverless**       | Event-driven, variable load | Medium     | Any       |

**Default recommendation:** Start with Monolith or Modular Monolith. Read `/docs/requirements.md` to confirm the choice fits team size, timeline, and domain complexity.

### 2. Select Application Layer Pattern

Choose one:

- **MVC** — Traditional web apps, REST APIs
- **Clean Architecture** — Complex business logic, long-lived apps (entities → use cases → interface adapters → frameworks)
- **Feature-Based (recommended for Next.js)** — Group all code for a feature (components, hooks, API, types) under `src/features/<feature>/`

### 3. Define Code-Level Patterns

For each decision area, select a pattern and note where it applies:

| Area                | Pattern Options                                          | Decision |
| ------------------- | -------------------------------------------------------- | -------- |
| Data access         | Repository (class or function-based)                     |          |
| Business logic      | Service class / use case functions                       |          |
| Object creation     | Factory / Builder                                        |          |
| Algorithm variation | Strategy                                                 |          |
| React state         | Context / Zustand / React Query                          |          |
| React components    | Container/Presenter / Compound Components / Custom Hooks |          |

Document reasoning in `/docs/architecture/design-patterns.md`.

### 4. Document Pattern Decisions

Create `/docs/architecture/design-patterns.md` with: selected architectural pattern + rationale, code pattern table (pattern/where used/purpose), React pattern table, file organization diagram, any project-specific constraints that drove the choices.

## Review Checklist

- [ ] Architectural pattern selected and documented
- [ ] Application layer pattern chosen
- [ ] Data access pattern defined
- [ ] Business logic organization planned
- [ ] React/component patterns documented
- [ ] Pattern decisions recorded in docs
- [ ] Team aligned on patterns

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` and `/docs/tech-stack.md` before selecting patterns.

## Outputs

- [ ] `/docs/architecture/design-patterns.md`

## Related SOPs

- **SOP-001:** Tech Stack Selection
- **SOP-003:** Project Structure
- **SOP-006:** Code Style Standards
