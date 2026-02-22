---
sop: "SOP-306"
title: "Progressive Web App"
phase: 3
iterative: false
optional: true
prerequisites:
  - sop: "SOP-003"
    output: "/docs/architecture/project-structure.md"
  - sop: "SOP-300"
    output: "src/components/"
  - sop: "SOP-301"
    output: "tailwind.config.ts"
outputs:
  - "public/manifest.json"
  - "src/sw.ts"
  - "src/hooks/use-pwa-install.ts"
related: ["SOP-300", "SOP-301", "SOP-303", "SOP-602"]
---

# SOP-306: Progressive Web App (PWA) Setup

## Purpose

Configure the Next.js application as an installable PWA with offline support, mobile-optimized UX, and optional native device APIs.

> **Optional SOP.** Skip if the project does not require mobile/PWA functionality.

## Scope

- **Covers:** Service worker, web manifest, offline caching, install prompt, mobile UI patterns, camera/geolocation/share APIs, push notifications
- **Excludes:** React Native / Capacitor native builds

## Prerequisites

- [ ] SOP-003 completed — project structure in place
- [ ] SOP-300 completed — component system ready
- [ ] SOP-301 completed — responsive styling foundation

## Procedure

### 1. Install PWA Library

```bash
pnpm add @serwist/next serwist
```

### 2. Configure `next.config.ts`

Wrap config with `withSerwistInit({ swSrc: 'src/sw.ts', swDest: 'public/sw.js', disable: process.env.NODE_ENV === 'development' })`.

### 3. Create Service Worker (`src/sw.ts`)

Use `@serwist/next/worker` `defaultCache` + `self.__SW_MANIFEST` for precaching. Set `skipWaiting: true`, `clientsClaim: true`, `navigationPreload: true`.

### 4. Define Runtime Caching Strategies

| Resource                         | Strategy                        | Cache Name   | Max Age |
| -------------------------------- | ------------------------------- | ------------ | ------- |
| API calls (`/api/*`)             | NetworkFirst                    | api-cache    | 1 hour  |
| Images (`.png`, `.jpg`, `.webp`) | CacheFirst                      | image-cache  | 30 days |
| Static assets (`.js`, `.css`)    | StaleWhileRevalidate            | static-cache | —       |
| Navigation requests              | NetworkFirst + offline fallback | pages-cache  | —       |

### 5. Create Web App Manifest (`public/manifest.json`)

Required fields: `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, `orientation`, `icons` (192×192 maskable + 512×512). Optional: `screenshots`, `shortcuts`, `categories`.

### 6. Add Manifest + Apple Meta to Root Layout

Export `viewport` (with `themeColor`, `viewportFit: "cover"`, `userScalable: false`) and `metadata` (with `manifest`, `appleWebApp`) from `app/layout.tsx`.

### 7. Create Install Prompt Hook (`src/hooks/use-pwa-install.ts`)

Listen for `beforeinstallprompt` event; store it in state. Export `{ isInstallable, isInstalled, install() }`. Check `display-mode: standalone` to detect already-installed state.

### 8. Create Offline Fallback Page (`src/app/offline/page.tsx`)

Simple page: offline icon + "You're offline" heading + retry button (`window.location.reload()`).

### 9. Implement Mobile UI Patterns (as needed)

- **Bottom Navigation** — `fixed bottom-0` nav bar, `min-w-[64px] min-h-[48px]` touch targets, active state via `usePathname()`
- **Pull-to-Refresh** — track `touchstart`/`touchend`, trigger refetch on ≥100px pull from top
- **Swipe Actions** — translate content on touch move, reveal action buttons behind, confirm action on ≥threshold swipe

### 10. Implement Native Device APIs (as needed)

- **Geolocation** — `useGeolocation` hook wrapping `navigator.geolocation.getCurrentPosition`
- **Camera** — `useCamera` hook: `getUserMedia({ video: { facingMode } })`, `capturePhoto()` via canvas, `stopCamera()` on unmount
- **Web Share** — `shareContent()` wrapping `navigator.share` with clipboard fallback
- **Push Notifications** — `requestNotificationPermission()` + `subscribeToPush()` sending VAPID subscription to `/api/push/subscribe`

### 11. Verify with Lighthouse

Run Lighthouse PWA audit in Chrome. Target: PWA score ≥ 90, LCP < 2.5s, FCP < 1.8s.

## Review Checklist

**Manifest & Installation**

- [ ] `manifest.json` complete
- [ ] App icons: 192×192 maskable + 512×512
- [ ] Apple touch icons
- [ ] Install prompt handled

**Service Worker**

- [ ] SW registered and precaching
- [ ] Runtime caching strategies defined
- [ ] Offline fallback page exists

**Mobile UX**

- [ ] Touch targets ≥ 48×48px
- [ ] Safe area insets (`pb-safe`, `pt-safe`)
- [ ] No horizontal scroll
- [ ] Bottom navigation for primary actions

**Performance**

- [ ] Bundle analyzed (`ANALYZE=true pnpm build`)
- [ ] Images use WebP + lazy loading
- [ ] Lighthouse PWA score ≥ 90

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Clarify which native APIs are needed (geolocation, camera, share, push) and whether offline support is required before implementing. Use context cache for app name and color tokens.

## Outputs

- [ ] `next.config.ts` (updated with Serwist)
- [ ] `src/sw.ts`
- [ ] `public/manifest.json`
- [ ] `src/app/offline/page.tsx`
- [ ] `src/hooks/use-pwa-install.ts`
- [ ] Mobile UI components (BottomNav, SwipeableRow, etc.)
- [ ] Native API hooks (as needed)

## Related SOPs

- **SOP-300:** Component Architecture
- **SOP-301:** Styling Standards
- **SOP-303:** API Integration
- **SOP-602:** Monitoring
