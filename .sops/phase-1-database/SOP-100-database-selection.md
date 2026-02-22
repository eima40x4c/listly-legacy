---
sop: "SOP-100"
title: "Database Selection"
phase: 1
iterative: false
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
outputs:
  - "/docs/database/database-decision.md"
related: ["SOP-000", "SOP-001", "SOP-101"]
---

# SOP-100: Database Selection

## Purpose

Select the most appropriate database technology based on project requirements, data characteristics, and team expertise.

## Scope

- **Covers:** Database type, hosting platform, ORM/driver selection
- **Excludes:** Schema design (SOP-101), query optimization

## Prerequisites

- [ ] SOP-000 completed — data requirements identified in `/docs/requirements.md`
- [ ] SOP-001 completed — tech stack direction known

## Procedure

### 1. Analyze Data Requirements

From `/docs/requirements.md`, determine:

| Question                              | Impact                                      |
| ------------------------------------- | ------------------------------------------- |
| Structured or flexible data?          | Structured → SQL; Flexible → NoSQL          |
| Complex relationships / JOINs needed? | Yes → SQL                                   |
| ACID transactions required?           | Yes → SQL                                   |
| Real-time subscriptions?              | Yes → Supabase or Firebase                  |
| Volume and write patterns?            | High-write → consider partitioning strategy |

### 2. Select Database Type

| Type          | Options                   | Use When                                       |
| ------------- | ------------------------- | ---------------------------------------------- |
| **SQL**       | PostgreSQL, MySQL, SQLite | Relational data, transactions, complex queries |
| **Document**  | MongoDB, Firestore        | Flexible schema, hierarchical data             |
| **Key-Value** | Redis, DynamoDB           | Caching, sessions                              |

**Default recommendation for web apps:** PostgreSQL (via Supabase or Neon free tiers).

### 3. Select ORM / Query Builder

| Stack                | Recommended | Alternative      |
| -------------------- | ----------- | ---------------- |
| Node.js / TypeScript | Prisma      | Drizzle, TypeORM |
| Python               | SQLAlchemy  | Tortoise ORM     |
| Go                   | GORM        | sqlx             |

### 4. Select Hosting

| Provider      | Free Tier          | Notes                                       |
| ------------- | ------------------ | ------------------------------------------- |
| Supabase      | 500 MB, 2 projects | Full PostgreSQL + Auth + Storage + Realtime |
| Neon          | 0.5 GB             | Serverless PostgreSQL                       |
| Railway       | $5/month credit    | PostgreSQL, MySQL, Redis                    |
| MongoDB Atlas | 512 MB             | MongoDB                                     |

### 5. Document Decision in `/docs/database/database-decision.md`

Include: Selected database + hosting + ORM, requirements analysis (what data requirements drove the choice), rationale (why this database), alternatives considered and why rejected.

## Review Checklist

- [ ] Data requirements analyzed
- [ ] Database type chosen with rationale
- [ ] Hosting solution selected
- [ ] ORM/driver selected
- [ ] Cost estimate for scaling understood
- [ ] Decision documented in `/docs/database/database-decision.md`

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` and `/docs/tech-stack.md` before making recommendations.

## Outputs

- [ ] `/docs/database/database-decision.md`

## Related SOPs

- **SOP-000:** Requirements Gathering
- **SOP-001:** Tech Stack Selection
- **SOP-101:** Schema Design
