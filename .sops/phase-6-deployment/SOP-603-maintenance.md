---
sop: "SOP-603"
title: "Maintenance & Incident Response"
phase: 6
iterative: false
prerequisites:
  - sop: "SOP-602"
  - sop: "SOP-601"
outputs:
  - ".github/dependabot.yml"
  - "docs/incidents/template.md"
  - "docs/runbooks/"
  - "docs/maintenance/"
related: ["SOP-601", "SOP-602", "SOP-600"]
---

# SOP-603: Maintenance & Incident Response

## Purpose

Establish processes for ongoing maintenance, dependency updates, incident handling, and backup/restore to keep the application secure and available.

## Scope

- **Covers:** Maintenance schedule, dependency updates, security patches, backups, incident response, rollback, post-mortems, runbooks
- **Excludes:** Feature development, refactoring

## Prerequisites

- [ ] SOP-602 monitoring and alerts configured
- [ ] SOP-601 deployment pipeline ready
- [ ] Application in production

## Maintenance Schedule

| Task               | Frequency         | Who           |
| ------------------ | ----------------- | ------------- |
| Dependency updates | Weekly            | Dev team      |
| Security patches   | Immediate         | Dev team      |
| DB backups         | Daily (automated) | CI/DevOps     |
| Performance review | Monthly           | Tech lead     |
| Security audit     | Quarterly         | Security team |
| DR test            | Quarterly         | DevOps        |

## Procedure

### 1. Configure Dependabot (`.github/dependabot.yml`)

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "09:00"
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        patterns: ["*"]
        exclude-patterns: ["@types/*", "eslint*", "prettier*"]
      development-dependencies:
        patterns: ["@types/*", "eslint*", "prettier*"]
    labels: [dependencies, automated]
```

### 2. Dependency Update Process

Weekly: review Dependabot PRs. Patch versions → merge after CI passes. Minor versions → run full test suite locally before merging. Major versions → update one at a time, read changelog, test manually.

```bash
pnpm audit                             # Check for vulnerabilities
npx npm-check-updates --target minor   # See what's available
```

### 3. Security Patch Protocol

| Severity | Response     | Steps                                                                  |
| -------- | ------------ | ---------------------------------------------------------------------- |
| Critical | <4h          | Isolate (disable feature if needed) → patch → test → fast-track deploy |
| High     | <24h         | Patch → test → deploy in next release slot                             |
| Medium   | <1 week      | Schedule in current sprint                                             |
| Low      | Next release | Add to backlog                                                         |

### 4. Database Backup (`scripts/backup-database.ts`)

- `pg_dump $DATABASE_URL > /tmp/backup-YYYY-MM-DD.sql`
- Upload to S3: `PutObjectCommand` to `BACKUP_BUCKET/database/backup-*.sql`

Schedule via `.github/workflows/backup.yml` with `cron: '0 2 * * *'`. Retention: keep 30 days; encrypted at rest.

### 5. Incident Response Steps

1. **Detection** — alert fires / user report / team notices
2. **Triage (5 min)** — confirm real, assess P1–P4, assign incident commander
3. **Communication (10 min)** — create `#incident-YYYY-MM-DD` channel, post status, update status page for P1/P2
4. **Investigation** — gather logs + metrics, identify affected systems, root cause
5. **Mitigation** — apply fix or rollback, verify resolution, monitor
6. **Resolution** — confirm fixed, update status page, close channel
7. **Post-Mortem (within 48h)** — document timeline, root cause, action items

### 6. Incident Severity Matrix

| Priority | Description                   | Response | Target Resolution |
| -------- | ----------------------------- | -------- | ----------------- |
| P1       | Total outage, data loss       | 15 min   | 4 hours           |
| P2       | Major feature/security broken | 30 min   | 8 hours           |
| P3       | Minor feature broken          | 4 hours  | 24 hours          |
| P4       | Cosmetic/minor bugs           | Next day | Next sprint       |

### 7. Rollback Procedure

**Vercel:** Dashboard → Deployments → find last good deployment → "..." → "Promote to Production".

**Manual:**

```bash
git log --oneline -10                  # Find good commit
git checkout -b hotfix/rollback
git reset --hard <commit-sha>
git push origin hotfix/rollback        # Deploy hotfix branch
```

**Database:**

```bash
pg_restore -d $DATABASE_URL backup-YYYY-MM-DD.sql    # From backup
pnpm prisma migrate resolve --rolled-back <migration-name>  # Revert migration
```

### 8. Post-Mortem Template (`docs/incidents/template.md`)

Sections:

- **Summary**: date, duration, severity, user impact
- **Timeline**: table of UTC time + event rows
- **Root Cause**: detailed explanation
- **Contributing Factors**: bullet list
- **Resolution**: what fixed it
- **Impact**: users affected, errors, revenue
- **Lessons Learned**: what went well / what to improve
- **Action Items**: `| Action | Owner | Due Date | Status |`

File naming: `docs/incidents/YYYY-MM-DD-brief-title.md`

### 9. Runbook Template (`docs/runbooks/[alert-name].md`)

For each configured alert rule:

- **Trigger**: exact condition
- **Impact**: user-facing effect
- **Quick Diagnosis**: 3–5 bash commands to check
- **Common Causes**: table of symptom + fix
- **Escalation**: steps if >30 min unresolved

### 10. Weekly Maintenance Checklist (`docs/maintenance/weekly-checklist.md`)

- **Monday**: review Dependabot PRs, check security advisories, review last week's error trends
- **Wednesday**: review slow query logs, verify disk usage, confirm backups running
- **Friday**: review metrics dashboard, update status page if needed
- **Monthly**: full dep audit, update runbooks, performance benchmark, cost review
- **Quarterly**: security audit, DR test, documentation review

## Review Checklist

- [ ] Dependabot configured
- [ ] Backup script and scheduled workflow created
- [ ] Incident severity matrix documented
- [ ] Rollback procedure documented
- [ ] Post-mortem template in `docs/incidents/`
- [ ] Runbooks for top 3 likely alerts
- [ ] Weekly/monthly maintenance checklist created

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read existing deployment setup and `docs/monitoring/alerts.md`. Create Dependabot config, backup workflow, and all documentation templates.

## Outputs

- [ ] `.github/dependabot.yml`
- [ ] `.github/workflows/backup.yml`
- [ ] `scripts/backup-database.ts`
- [ ] `docs/incidents/template.md`
- [ ] `docs/runbooks/*.md` (one per alert rule)
- [ ] `docs/maintenance/weekly-checklist.md`

## Related SOPs

- **SOP-601:** CI/CD Pipelines
- **SOP-602:** Monitoring
- **SOP-600:** Environment Config
