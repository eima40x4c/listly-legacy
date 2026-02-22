---
sop: "SOP-002"
title: "Repository Setup"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
outputs:
  - ".gitignore"
  - "README.md"
  - "CONTRIBUTING.md"
  - ".github/PULL_REQUEST_TEMPLATE.md"
related: ["SOP-001", "SOP-003", "SOP-006"]
---

# SOP-002: Repository Setup

## Purpose

Establish a consistent, well-organized Git repository with proper conventions, branch protection, and documentation from day one.

## Scope

- **Covers:** Git initialization, branching strategy, commit conventions, essential docs
- **Excludes:** CI/CD pipelines (SOP-601), project structure (SOP-003)

## Prerequisites

- [ ] SOP-001 completed — `/docs/tech-stack.md` exists
- [ ] Git installed locally
- [ ] Repository hosting account (GitHub/GitLab/Bitbucket)

## Procedure

### 1. Initialize Repository

```bash
git init && git branch -M main
```

### 2. Create `.gitignore`

Based on tech stack from `/docs/tech-stack.md`:

→ template: `.sops/templates/code/gitignore-node.template` (Node.js/TypeScript)
→ template: `.sops/templates/code/gitignore-python.template` (Python)

### 3. Define Branching Strategy

**Recommended (GitHub Flow):** `main` (production-ready) + short-lived `feature/xxx`, `fix/xxx`, `chore/xxx` branches.

**Alternative (Git Flow):** `main` + `develop` + `feature/xxx`, `release/x.x.x`, `hotfix/xxx` — use only for complex multi-release projects.

Document choice in `CONTRIBUTING.md`.

### 4. Set Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 5. Create `README.md`

→ template: `.sops/templates/code/readme.md.template` — fill in project name, tech stack, and setup instructions.

### 6. Create `CONTRIBUTING.md`

→ template: `.sops/templates/code/contributing.md.template` — fill in project-specific setup and branching strategy.

### 7. Create `.github/PULL_REQUEST_TEMPLATE.md`

Minimal initial version — add description, type-of-change checkboxes, and a self-review checklist. SOP-503 will replace this with a comprehensive version in Phase 5.

### 8. Configure Branch Protection (on remote)

After pushing, protect `main`: require PR reviews, require status checks (when CI exists), restrict direct pushes.

### 9. Initial Commit

```bash
git add . && git commit -m "chore: initial project setup"
git remote add origin {repo-url} && git push -u origin main
```

## Review Checklist

- [ ] Repository initialized with `main` branch
- [ ] `.gitignore` configured for tech stack
- [ ] Branching strategy documented
- [ ] Commit message convention defined
- [ ] `README.md` created
- [ ] `CONTRIBUTING.md` created
- [ ] PR template created
- [ ] Remote repository created and pushed
- [ ] Branch protection rules configured

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/tech-stack.md` to select the correct `.gitignore` template.

## Outputs

- [ ] `.gitignore`
- [ ] `README.md`
- [ ] `CONTRIBUTING.md`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Repository pushed to remote with branch protection

## Related SOPs

- **SOP-001:** Tech Stack Selection
- **SOP-003:** Project Structure
- **SOP-006:** Code Style Standards
