---
sop: "SOP-602"
title: "Monitoring & Alerting"
phase: 6
iterative: false
prerequisites:
  - sop: "SOP-600"
  - sop: "SOP-601"
outputs:
  - "sentry.*.config.ts"
  - "src/lib/monitoring/"
  - "src/app/api/health/route.ts"
  - "docs/monitoring/"
related: ["SOP-600", "SOP-601", "SOP-603"]
---

# SOP-602: Monitoring & Alerting

## Purpose

Detect issues early, understand system behavior, and respond quickly. Covers error tracking, logging, health checks, performance metrics, and alerts.

## Scope

- **Covers:** Sentry, structured logging, health check, custom metrics, uptime, alert configuration
- **Excludes:** Business analytics, user behavior tracking

## Prerequisites

- [ ] SOP-600 environments configured
- [ ] SOP-601 deployment pipeline ready

## Monitoring Stack

| Layer          | Purpose                     | Default Tool              |
| -------------- | --------------------------- | ------------------------- |
| Error Tracking | Catch and aggregate errors  | Sentry                    |
| Performance    | Response time, tracing      | Vercel Analytics + Sentry |
| Logging        | Centralized structured logs | Axiom / Logtail           |
| Uptime         | Availability checks         | Better Uptime / Checkly   |
| Custom Metrics | Business counters/gauges    | Structured logging → sink |
| Alerting       | Notification routing        | Slack, PagerDuty          |

## Procedure

### 1. Set Up Sentry Error Tracking

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure `sentry.client.config.ts`:

- `dsn: process.env.NEXT_PUBLIC_SENTRY_DSN`
- `tracesSampleRate: 0.1`
- `replaysSessionSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0`
- `beforeSend`: return `null` in `development` (no local noise)
- `ignoreErrors`: `ResizeObserver loop limit exceeded`, `Network request failed`, `/^Loading chunk .* failed/`

`sentry.server.config.ts` and `sentry.edge.config.ts`: DSN from `SENTRY_DSN` (non-public), `tracesSampleRate: 0.1`.

### 2. Create Error Utilities (`src/lib/monitoring/errors.ts`)

`captureError(error, context?)` — uses `Sentry.withScope` to attach `userId`, `action` tag, and `metadata` before calling `captureException`. `captureMessage(text, level)` wraps `Sentry.captureMessage`. `withErrorCapture<T>(fn, context?)` — try/await fn, catch → captureError + rethrow.

### 3. Structured Logger (`src/lib/monitoring/logger.ts`)

`Logger` class with `service` and `environment` constructor params. Methods: `debug`, `info`, `warn`, `error`. In production → `console[level](JSON.stringify(entry))`. In development → readable format with timestamp prefix. `debug` is a no-op in production. `error` method adds `error.message` and `error.stack` to entry. Export `logger = new Logger('app')`.

### 4. Request Logging Middleware (`src/middleware.ts`)

In the API middleware, generate `crypto.randomUUID()` as request ID. Add `x-request-id` response header. Log structured JSON: `{ type: 'request', requestId, method, path, timestamp }`. Matcher: `/api/:path*`.

### 5. Performance Monitoring (`src/lib/monitoring/performance.ts`)

`measureAsync<T>(name, fn)` — wraps with `Sentry.startSpan({ name, op: 'function' })`. Inside, track `performance.now()`. If duration > 1000ms, log a `slow_operation` warning with name and duration.

### 6. Health Check (`src/app/api/health/route.ts`)

Return typed payload `{ status: 'healthy'|'degraded'|'unhealthy', checks: { database, redis? }, latency: { database }, version, timestamp }`. Attempt `prisma.$queryRaw\`SELECT 1\`` with timing; set check boolean accordingly. Status → 200 if healthy, 503 if any check failed.

### 7. Custom Metrics (`src/lib/monitoring/metrics.ts`)

`MetricsCollector` class. Methods: `increment(name, tags?)`, `gauge(name, value, tags?)`, `timing(name, durationMs, tags?)`. Buffer metrics in memory; flush every 60 seconds (server-side only). Flush sends structured JSON log: `{ type: 'metrics', metrics[], timestamp }`. Export `metrics` singleton.

### 8. Configure Uptime Monitoring

Create `/api/health/ping` → simple `{ pong: true }` with status 200. Configure external uptime monitor (Better Uptime, Checkly, etc.) to ping this endpoint every 1 minute. Alert channels: Slack + Email.

### 9. Document Alert Rules (`docs/monitoring/alerts.md`)

Define: alert channels (Slack, email, PagerDuty). Rules table:

| Metric         | Condition           | Severity | Action             |
| -------------- | ------------------- | -------- | ------------------ |
| Error rate     | >5% over 5 min      | Critical | Page on-call       |
| p95 Latency    | >3s over 5 min      | Warning  | Slack              |
| Health check   | 3x consecutive fail | Critical | Page + status page |
| DB connections | >80% pool           | Warning  | Slack              |

Link to runbooks from each alert rule.

### 10. Add Env Variables

```bash
SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
AXIOM_TOKEN=   # optional log sink
```

## Monitoring Maturity Levels

| Level    | Capabilities                                  |
| -------- | --------------------------------------------- |
| Basic    | Error tracking + uptime                       |
| Standard | + Structured logs, health check, basic alerts |
| Advanced | + APM, custom metrics, dashboards             |

## Review Checklist

- [ ] Sentry configured on client, server, and edge
- [ ] No dev errors sent to Sentry
- [ ] Structured logger used in service layer
- [ ] Request ID header on all API responses
- [ ] Health check returns correct status codes
- [ ] Performance tracing on slow operations
- [ ] Uptime monitor pinging `/api/health/ping`
- [ ] Alert rules documented with runbook links

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `src/lib/` for existing utilities. Install Sentry via wizard, then create monitoring utilities and wire health check.

## Outputs

- [ ] `sentry.client.config.ts`
- [ ] `sentry.server.config.ts`
- [ ] `sentry.edge.config.ts`
- [ ] `src/lib/monitoring/errors.ts`
- [ ] `src/lib/monitoring/logger.ts`
- [ ] `src/lib/monitoring/performance.ts`
- [ ] `src/lib/monitoring/metrics.ts`
- [ ] `src/app/api/health/route.ts`
- [ ] `src/app/api/health/ping/route.ts`
- [ ] `docs/monitoring/alerts.md`

## Related SOPs

- **SOP-600:** Environment Config
- **SOP-601:** CI/CD Pipelines
- **SOP-603:** Maintenance & Incident Response
