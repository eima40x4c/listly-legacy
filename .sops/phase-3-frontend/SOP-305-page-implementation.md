---
sop: "SOP-305"
title: "Page Implementation"
phase: 3
iterative: true
prerequisites:
  - sop: "SOP-302"
    output: "/docs/frontend/visual-design.md"
  - sop: "SOP-300"
    output: "src/components/"
  - sop: "SOP-303"
    output: "src/hooks/api/"
  - sop: "SOP-304"
    output: "src/components/ui/Form/"
outputs:
  - "app/[route]/page.tsx"
  - "app/[route]/[page]-content.tsx"
  - "app/[route]/loading.tsx"
  - "app/[route]/error.tsx"
  - "app/[route]/not-found.tsx"
related: ["SOP-302", "SOP-300", "SOP-303", "SOP-304"]
---

# SOP-305: Page Implementation

## Purpose

Implement complete pages that compose components, integrate with APIs, and deliver the approved wireframe UX.

## Scope

- **Covers:** Page server/client split, data fetching, state management, navigation, loading/error states
- **Excludes:** Reusable components (SOP-300), API client (SOP-303), forms (SOP-304)

## Prerequisites

- [ ] SOP-302 completed — wireframes and visual design approved
- [ ] SOP-300 completed — required components built
- [ ] SOP-303 completed — API query hooks available
- [ ] SOP-304 completed — form components ready (if page has forms)

## Procedure

**Iterative — one page per iteration.**

### 1. Build Page Manifest

> ⚠️ **CHECKPOINT:** Create and present `/docs/frontend/page-manifest.md` before implementing any pages. Await human approval.

Manifest table: `# | Page | Route | API Endpoints | Key Components | Priority | Status`

### 2. Implement Shared Infrastructure (once, before first page iteration)

- Root `app/layout.tsx` — theme, fonts, providers, global metadata
- Navigation component (sidebar / header / bottom nav)
- Shared hooks (`useAuth`, `useTheme`, etc.)
- Error boundaries and `not-found` patterns

### 3. For Each Page (one at a time)

**A. Create Page Planning Document** (`/docs/frontend/pages/[page].md`)

Include: route, purpose, wireframe reference, data requirements table (data/source/loading-state/error-state), state management table (state/type/scope/persistence), user interactions table (action/API call/optimistic update), components used.

**B. Implement Server Component** (`app/[route]/page.tsx`)

- Generate metadata (`generateMetadata` with entity name/description)
- Validate entity existence (404 via `notFound()` on API error)
- Wrap client component in `<Suspense fallback={<[Page]Skeleton />}>`
- Pass `initialData` from server fetch to client component (avoids client waterfall)

**C. Implement Client Component** (`app/[route]/[page]-content.tsx`)

- `'use client'` directive
- Use TanStack Query hooks for server state (initialized with `initialData`)
- Use `useState`/`useCallback` for local UI state (expanded sections, selections)
- Use `useMemo` for derived state (grouping, filtering, sorting)
- Render error boundary if query failed, loading skeleton if still fetching
- Structure: `<div className="flex flex-col min-h-screen"><Header /><main><...content></main><Navigation /></div>`

**D. Implement Loading Skeleton** (`app/[route]/loading.tsx` or `-skeleton.tsx`)

Match the final page layout with `<Skeleton>` placeholders so there is no layout shift.

**E. Implement Error Page** (`app/[route]/error.tsx`)

- `'use client'`; log error to console (later: Sentry). Display message + `reset` button + back button.

**F. Implement Not Found Page** (`app/[route]/not-found.tsx`)

User-friendly message + link back to list page.

**G. Checkpoint**

Present completed page: files created, API endpoints wired, deviations from wireframe if any. Await approval before proceeding to next page.

### 4. Coverage Verification

After all pages: create coverage report table (page/route/status/files/API wired). Run `pnpm build` and verify it passes. Verify cross-page navigation end-to-end.

## Review Checklist

- [ ] Page manifest approved before implementation
- [ ] Server component handles server-side fetch + 404
- [ ] Client component handles interactivity
- [ ] Loading skeleton matches final layout
- [ ] Error boundary at route level
- [ ] Not found page for invalid routes
- [ ] Metadata generated for SEO
- [ ] Build passes (`pnpm build`)
- [ ] Cross-page navigation works

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `/docs/frontend/visual-design.md` and wireframes from SOP-302. First create page manifest and await approval. Then implement shared infrastructure. Then one page per iteration with checkpoint.

## Outputs

> `[route]` and `[page]` below are **Next.js path segments**, not entity placeholders. Replace with actual routes from the page manifest (e.g., `app/(dashboard)/page.tsx`, `app/lists/[id]/list-content.tsx`).

- [ ] `/docs/frontend/page-manifest.md`
- [ ] `app/[route]/page.tsx` (per page)
- [ ] `app/[route]/[page]-content.tsx` (per page)
- [ ] `app/[route]/loading.tsx` or skeleton (per page)
- [ ] `app/[route]/error.tsx` (per page)
- [ ] `app/[route]/not-found.tsx` (per page)
- [ ] `app/[route]/layout.tsx` (per group, if applicable)

## Related SOPs

- **SOP-302:** UI/UX Design (wireframes and approved design)
- **SOP-300:** Component Architecture
- **SOP-303:** API Integration
- **SOP-304:** Form Handling
