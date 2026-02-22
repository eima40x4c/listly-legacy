---
sop: "SOP-303"
title: "API Integration"
phase: 3
iterative: true
prerequisites:
  - sop: "SOP-202"
    output: "/docs/api/endpoints.md"
  - sop: "SOP-300"
    output: "src/components/"
outputs:
  - "src/lib/api/client.ts"
  - "src/lib/query-client.ts"
  - "src/components/providers/QueryProvider.tsx"
  - "src/hooks/api/*.ts"
related: ["SOP-202", "SOP-300", "SOP-205"]
---

# SOP-303: API Integration

## Purpose

Establish consistent, performant patterns for fetching, caching, and mutating server data from frontend components.

## Scope

- **Covers:** Data fetching strategy, TanStack Query setup, API client, query hooks, loading/error states
- **Excludes:** API design (SOP-202), auth flow (SOP-203)

## Prerequisites

- [ ] SOP-202 completed — API endpoints defined in `/docs/api/endpoints.md`
- [ ] SOP-300 completed — component structure in place
- [ ] Backend API running

## Procedure

### 1. Choose Data Fetching Strategy

| Strategy                        | Best For                                              |
| ------------------------------- | ----------------------------------------------------- |
| **Server Components + `fetch`** | Initial page load, SSR, static data                   |
| **TanStack Query**              | Client-side mutations, cache invalidation, refetching |
| **SWR**                         | Simple caching, lower complexity needs                |

**Recommended:** Server Components for initial load + TanStack Query for client mutations.

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Create Query Client (`src/lib/query-client.ts`)

Configure: `staleTime: 60_000`, `gcTime: 300_000`, `retry: 1`, `refetchOnWindowFocus: false`. Export `getQueryClient()` that returns a singleton on the browser (never share across SSR requests).

### 3. Create Query Provider (`src/components/providers/QueryProvider.tsx`)

Wrap with `QueryClientProvider`. Add `ReactQueryDevtools` (dev only). Register in root `layout.tsx`.

### 4. Create API Client (`src/lib/api/client.ts`)

Typed `api` object with `get<T>`, `post<T>`, `patch<T>`, `delete<T>` methods. Each:

- Constructs URL from `NEXT_PUBLIC_API_URL` + endpoint
- Sends `Content-Type: application/json`
- Calls a shared `handleResponse<T>` that throws a typed `ApiClientError(status, errorBody)` on non-2xx

### 5. Create Query Hooks per Resource (iterative)

File: `src/hooks/api/use[Entity]s.ts`

For each API resource:

1. Define a query key factory: `[entity]Keys.all`, `[entity]Keys.list(filters)`, `[entity]Keys.detail(id)`
2. `use[Entity]s(filters?)` — `useQuery` for list
3. `use[Entity](id)` — `useQuery` for single
4. `useCreate[Entity]()` — `useMutation`, invalidates list on success
5. `useUpdate[Entity]()` — `useMutation`, invalidates detail + list on success
6. `useDelete[Entity]()` — `useMutation`, invalidates list on success

For optimistic updates on critical mutations: use `onMutate` → snapshot → update cache; `onError` → rollback; `onSettled` → invalidate.

### 6. Create Server-Side Fetch Helpers (Next.js)

`src/lib/api/server.ts` — cached async functions using React `cache()`. Include `next: { revalidate: N }` or `next: { tags: [...] }` for ISR.

### 7. Create Loading and Error UI Components

- `src/components/ui/Skeleton.tsx` — animated `bg-muted` placeholder for loading states
- `src/components/ui/ErrorMessage.tsx` — displays error with optional retry button; reads `ApiClientError.data.message` when available

### 8. Use in Components

Loading pattern: `if (isLoading) return <[Entity]Skeleton />; if (error) return <ErrorMessage error={error} />;`

## Review Checklist

- [ ] Query client configured with sensible defaults
- [ ] Query provider in root layout
- [ ] API client handles errors consistently
- [ ] Query hooks created for all resources
- [ ] Query key factory pattern used
- [ ] Loading states (Skeleton) implemented
- [ ] Error states implemented
- [ ] Optimistic updates on critical mutations
- [ ] Cache invalidated on mutations
- [ ] Server-side fetching for SSR pages

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `/docs/api/endpoints.md` to understand the API surface before creating hooks. Create one resource's hooks per iteration.

## Outputs

- [ ] `src/lib/api/client.ts`
- [ ] `src/lib/query-client.ts`
- [ ] `src/components/providers/QueryProvider.tsx`
- [ ] `src/hooks/api/use[entity]s.ts` (per resource)
- [ ] `src/components/ui/Skeleton.tsx`
- [ ] `src/components/ui/ErrorMessage.tsx`
- [ ] `src/lib/api/server.ts` (if using Next.js SSR)

## Related SOPs

- **SOP-202:** API Design
- **SOP-300:** Component Architecture
- **SOP-205:** Error Handling
