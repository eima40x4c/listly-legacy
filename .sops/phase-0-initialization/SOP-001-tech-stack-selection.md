---
sop: "SOP-001"
title: "Tech Stack Selection"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
outputs:
  - "/docs/tech-stack.md"
related: ["SOP-000", "SOP-002", "SOP-003", "SOP-006"]
---

# SOP-001: Tech Stack Selection

## Purpose

Provide a structured decision process for selecting technologies, frameworks, and tools. Ensures choices are justified, documented, and aligned with requirements and team capabilities.

## Scope

- **Covers:** Languages, frameworks, databases, hosting, third-party services
- **Excludes:** Detailed implementation (see phase-specific SOPs)

## Prerequisites

- [ ] SOP-000 completed — `/docs/requirements.md` exists
- [ ] Team skills inventory known

## Procedure

### 1. Extract Technology-Relevant Factors from Requirements

Read `/docs/requirements.md` and note: performance needs, scale expectations, security requirements, timeline, budget, team expertise.

### 2. Identify Technology Categories

For each category, list candidates: Frontend Framework, Backend Framework, Database, ORM/Query Builder, Authentication, Hosting, File Storage, Email Service, Monitoring.

Common options per category: React/Vue/Next.js, Node/Express/FastAPI/Go, PostgreSQL/MySQL/MongoDB, Prisma/TypeORM/Drizzle, NextAuth/Supabase Auth/Clerk, Vercel/Railway/AWS, S3/Supabase Storage, Resend/SendGrid, Sentry/LogRocket.

### 3. Score Options with Decision Matrix

For each major category, build a weighted scoring table (criteria × options, score 1–5). Criteria to weight: team experience, ecosystem, performance, learning curve, hiring pool, cost.

### 4. Consider Stack Synergies

Prefer proven combined stacks (e.g., Next.js + Prisma + PostgreSQL + Vercel) over mixing unknown combinations. Document why the chosen combination works together.

### 5. Validate Against Constraints

Cross-check selections: Are all services within budget? Can team deliver on time? Can stack handle projected growth? Does it meet compliance requirements?

### 6. Create `/docs/tech-stack.md`

Include: Technology overview table (layer/technology/version), decision rationale per major choice (chosen because / alternatives considered), dependencies & integrations table (service/purpose/cost tier), risks & mitigations, future considerations.

### 7. List Initial Dependencies

Outline expected `package.json` dependencies based on decisions (no need to install yet — that happens in SOP-004).

## Review Checklist

- [ ] All major technology categories addressed
- [ ] Decision matrix used for significant choices
- [ ] Rationale documented for each decision
- [ ] Stack synergies considered
- [ ] Constraints validated
- [ ] Costs estimated and within budget
- [ ] `/docs/tech-stack.md` created
- [ ] Team reviewed and approved selections

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` before starting.

## Outputs

- [ ] `/docs/tech-stack.md`

## Related SOPs

- **SOP-000:** Requirements Gathering
- **SOP-002:** Repository Setup
- **SOP-003:** Project Structure
- **SOP-006:** Code Style Standards
