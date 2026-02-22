---
sop: "SOP-503"
title: "Code Review"
phase: 5
iterative: false
prerequisites:
  - sop: "SOP-002"
  - sop: "SOP-006"
outputs:
  - ".github/PULL_REQUEST_TEMPLATE.md"
  - ".github/CODEOWNERS"
  - ".github/workflows/pr-checks.yml"
  - "CONTRIBUTING.md"
related: ["SOP-002", "SOP-006", "SOP-601"]
---

# SOP-503: Code Review

## Purpose

Establish code review standards to catch bugs early, share knowledge, and maintain consistent quality.

## Scope

- **Covers:** PR standards, review checklist, reviewer/author guidelines, CI configuration
- **Excludes:** Automated linting/CI setup (SOP-601), pair programming

## Prerequisites

- [ ] SOP-002 (Repository Setup) — branching strategy defined
- [ ] SOP-006 (Code Style) — standards established

## Procedure

### 1. Create PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)

> Replaces the minimal version from SOP-002 with a comprehensive template.

Sections:

- **Description**: what and why
- **Type of Change**: checkboxes (bug fix, feature, breaking change, docs, config, refactor)
- **Related Issues**: `Fixes #123`
- **Changes Made**: bullet list
- **Screenshots**: if UI changes
- **Testing**: unit/integration/manual/staging checkboxes
- **Self-review Checklist**: style, no console.logs, no lint warnings, docs updated

### 2. Configure Branch Protection & CI

Branch protection on `main`: require 1 approving review, dismiss stale reviews, require status checks (build, test, lint), no direct pushes.

Create `.github/workflows/pr-checks.yml` with jobs: `pnpm lint`, `pnpm type-check`, `pnpm test:run`, `pnpm build` — triggered on PRs to `main` and `develop`.

### 3. Configure CODEOWNERS (`.github/CODEOWNERS`)

```
*                   @team-leads
/src/lib/auth/      @security-team
/prisma/            @database-team
/.github/           @devops-team
```

### 4. Review Checklist (for Reviewers)

**Functionality:** Does it work? Edge cases handled? Error handling appropriate?

**Code Quality:** Readable, single responsibility, no duplication, clear names, comments explain "why" not "what".

**Security:** No hardcoded secrets, input validated/sanitized, injection prevented, XSS avoided, auth checks in place.

**Performance:** No N+1 queries, indexes considered, no memory leaks, large operations paginated.

**Testing:** Adequate coverage, meaningful tests (not just coverage), edge cases tested, no flaky tests.

**Architecture:** Follows patterns, no unnecessary deps, backward compatible, API changes documented.

### 5. Comment Prefix Convention

| Prefix        | Meaning                             |
| ------------- | ----------------------------------- |
| `nit:`        | Optional style suggestion           |
| `suggestion:` | Recommended, non-blocking           |
| `question:`   | Seeking clarification, non-blocking |
| `issue:`      | Must be fixed before merge          |
| `blocker:`    | Critical, cannot merge              |

### 6. Review Time Guidelines

| PR Size                | Expected Turnaround |
| ---------------------- | ------------------- |
| Tiny (<50 lines)       | Same day            |
| Small (<100 lines)     | Within 1 day        |
| Medium (100–300 lines) | Within 2 days       |
| Large (300+ lines)     | Request split       |

### 7. Document in `CONTRIBUTING.md`

Include: setup instructions reference, code style, commit message format (conventional commits), PR process, issue reporting, code of conduct reference.

## Review Checklist

- [ ] PR template created
- [ ] Branch protection configured
- [ ] CODEOWNERS defined
- [ ] PR checks CI workflow created
- [ ] Review guidelines in `CONTRIBUTING.md`

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `.github/` for existing config. Create all PR infrastructure files.

## Outputs

- [ ] `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] `.github/CODEOWNERS`
- [ ] `.github/workflows/pr-checks.yml`
- [ ] `CONTRIBUTING.md`

## Related SOPs

- **SOP-002:** Repository Setup
- **SOP-006:** Code Style Standards
- **SOP-601:** CI/CD Pipelines
