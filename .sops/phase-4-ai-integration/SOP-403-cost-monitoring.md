---
sop: "SOP-403"
title: "AI Cost Monitoring"
phase: 4
iterative: false
prerequisites:
  - sop: "SOP-401"
    output: "src/lib/ai/"
outputs:
  - "src/lib/ai/usage.ts"
  - "src/lib/ai/limits.ts"
  - "src/lib/ai/alerts.ts"
  - "/docs/ai/cost-monitoring.md"
related: ["SOP-400", "SOP-401", "SOP-602"]
---

# SOP-403: AI Cost Monitoring

## Purpose

Prevent unexpected AI API cost overruns with usage tracking, budget limits, rate limiting, and cost optimization.

## Scope

- **Covers:** Usage tracking, Prisma model, budget limits, rate limiting, alerts, optimization
- **Excludes:** Self-hosted model infrastructure costs

## Prerequisites

- [ ] SOP-401 completed — AI client in use
- [ ] Budget limits established

## Procedure

### 1. Add `AiUsage` Prisma Model

```prisma
model AiUsage {
  id               String   @id @default(cuid())
  userId           String?  @map("user_id")
  operation        String
  model            String
  promptTokens     Int      @map("prompt_tokens")
  completionTokens Int      @map("completion_tokens")
  cost             Decimal  @db.Decimal(10, 6)
  latencyMs        Int      @map("latency_ms")
  createdAt        DateTime @default(now()) @map("created_at")
  user             User?    @relation(fields: [userId], references: [id])
  @@index([userId])
  @@index([createdAt])
  @@index([operation])
  @@map("ai_usage")
}
```

### 2. Create Usage Tracking (`src/lib/ai/usage.ts`)

- `recordUsage(record)` — `prisma.aiUsage.create()`
- `getDailyUsage(date?)` — aggregate `cost`, `promptTokens`, `completionTokens`, `_count` for current day
- `getMonthlyUsage()` — `groupBy('operation')` since start of month, returns `{ totalCost, breakdown }`

### 3. Create Tracked AI Client Wrapper

`trackedCompletion(options)` — wraps `generateCompletion`: records start time, calls completion, computes cost via `calculateCost(promptTokens, completionTokens, model)`, calls `recordUsage()`. Use this in all production AI calls.

### 4. Implement Budget Limits (`src/lib/ai/limits.ts`)

Read `AI_DAILY_LIMIT` and `AI_MONTHLY_LIMIT` from env. `checkBudget()` returns `{ allowed, dailyUsed, dailyRemaining, monthlyUsed, monthlyRemaining, warnings[] }`. Issue warning string at 80% of limit; set `allowed = false` when exceeded. `requireBudget()` throws on `allowed = false`.

### 5. Add Rate Limiting

Use `@upstash/ratelimit` with Redis (or your existing Redis instance). Per-user: `slidingWindow(10, '1 m')` keyed by `ai:${userId}`. Return `{ allowed, remaining, reset }` header-friendly shape. Add IP-fallback for unauthenticated requests.

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

### 6. Set Up Alerts (`src/lib/ai/alerts.ts`)

`sendAlert(message, severity)` — posts to `SLACK_WEBHOOK_URL` with emoji prefix (🚨 critical / ⚠️ warning). `checkAndAlert()` — calls `checkBudget()` and fires alert for any warning strings. Schedule via cron or call from a background job.

### 7. Create Admin API Endpoint (`src/app/api/admin/ai-usage/route.ts`)

Require admin role. Return: daily stats, monthly stats with breakdown, budget remaining, recent 100 usage records.

### 8. Cost Optimization

| Strategy                 | How                                                          |
| ------------------------ | ------------------------------------------------------------ |
| Model tiering            | Use GPT-3.5/Haiku for simple tasks; GPT-4/Sonnet for complex |
| Cache frequent responses | Store in Redis with TTL keyed by prompt hash                 |
| Optimize prompt length   | Strip unnecessary whitespace; keep system prompts concise    |
| Batch processing         | Group similar requests; send together in one API call        |

### 9. Configure Environment Variables

Add to `.env` and `.env.example`:

- `AI_DAILY_LIMIT` (e.g., `50`)
- `AI_MONTHLY_LIMIT` (e.g., `1000`)
- `SLACK_WEBHOOK_URL`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

### 10. Document in `/docs/ai/cost-monitoring.md`

Include: dashboard URL, metrics table, budget limits table (limit / value / action when exceeded), optimization checklist, troubleshooting guide for cost spikes.

## Review Checklist

- [ ] `AiUsage` Prisma model migrated
- [ ] Usage recording on all AI calls
- [ ] Budget limits enforced (daily + monthly)
- [ ] Rate limiting per user + IP
- [ ] Alerts on budget threshold
- [ ] Admin API endpoint for dashboard
- [ ] Cost optimization applied
- [ ] Documentation created

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `prisma/schema.prisma` and `src/lib/ai/client.ts`. Add the `AiUsage` model, create all monitoring infrastructure, then wrap the existing completion function.

## Outputs

- [ ] Updated `prisma/schema.prisma`
- [ ] `src/lib/ai/usage.ts`
- [ ] `src/lib/ai/limits.ts`
- [ ] `src/lib/ai/alerts.ts`
- [ ] `src/lib/ai/tracked-client.ts`
- [ ] `src/app/api/admin/ai-usage/route.ts`
- [ ] `/docs/ai/cost-monitoring.md`

## Related SOPs

- **SOP-400:** AI Feasibility (budget planning)
- **SOP-401:** LLM Integration
- **SOP-602:** Monitoring
