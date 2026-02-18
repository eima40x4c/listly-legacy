# Progressive Web App (PWA) Implementation

Listly is configured as a fully installable Progressive Web App (PWA) using `@serwist/next`. This enables users to install the app on their mobile devices, work offline, and enjoy a native-like experience.

## Features

- **Installable:** Meets all PWA criteria (manifest, service worker, icons).
- **Offline Support:** Caches critical assets and pages for offline access.
- **Offline Fallback:** Custom offline page when navigating without connection.
- **Mobile UX:** Bottom navigation, proper viewport settings, and touch target sizing.
- **App Icons:** Adaptive icons for Android and iOS.

## Configuration

### Service Worker (`src/sw.ts`)

Uses Serwist to handle caching strategies.

- **Precache:** Static assets generated at build time.
- **Runtime Caching:** Default strategies for API, images, and other resources.

### Manifest (`public/manifest.json`)

Defines app metadata:

- Name: Listly - Smart Shopping Companion
- Theme Color: #000000 (Dark mode ready)
- Display: Standalone
- Categories: productivity, shopping

## Testing PWA

1. **Build the app:** `pnpm build`
2. **Start production server:** `pnpm start`
3. **Open in Browser:** Go to `http://localhost:3000`
4. **Inspect:** Open DevTools > Application > Service Workers / Manifest
5. **Install:** Click the install icon in the address bar (Chrome) or "Add to Home Screen" (iOS/Android).

## Troubleshooting

- **Service Worker not registering:** Ensure you are running in `production` mode or have `disable: false` in `next.config.mjs` (default disabled in dev).
- **Icons not showing:** Verify `public/icons` contains valid PNGs.
- **Offline page not appearing:** Check network throttling in DevTools and ensure `src/app/offline/page.tsx` is valid.
