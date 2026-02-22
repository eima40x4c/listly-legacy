---
sop: "SOP-502"
title: "End-to-End Testing"
phase: 5
iterative: false
prerequisites:
  - sop: "SOP-500"
  - sop: "SOP-501"
  - sop: "SOP-305"
outputs:
  - "playwright.config.ts"
  - "e2e/"
  - ".github/workflows/e2e.yml"
related: ["SOP-500", "SOP-501", "SOP-305"]
---

# SOP-502: End-to-End Testing

## Purpose

Validate critical user workflows in a real browser environment using Playwright.

## Scope

- **Covers:** Playwright setup, Page Object Model, fixtures, user flow tests, accessibility, visual regression, CI
- **Excludes:** Unit tests (SOP-500), API integration tests (SOP-501)

## Prerequisites

- [ ] SOP-500 and SOP-501 complete
- [ ] SOP-305 pages implemented

## E2E Test Strategy

| Priority | Coverage Target                        |
| -------- | -------------------------------------- |
| Critical | 100% happy paths (login, core feature) |
| High     | Key error scenarios                    |
| Medium   | Edge cases, empty states               |
| Low      | Visual regressions                     |

**Test pyramid:** Unit 70% / Integration 20% / E2E 10%.

**Test only:** Auth flows, critical business workflows, cross-page interactions, accessibility. **Don't test:** every action, all error messages (unit test these), API edge cases (integration tests).

## Procedure

### 1. Install Playwright

```bash
npm init playwright@latest
pnpm add -D @axe-core/playwright  # for accessibility tests
```

### 2. Configure Playwright (`playwright.config.ts`)

Key settings:

- `testDir: './e2e'`, `fullyParallel: true`
- `retries: process.env.CI ? 2 : 0`
- `baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'`
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- Projects: Desktop Chrome, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- `webServer`: `npm run build && npm run start`, reuse existing if not CI

### 3. Create Page Object Model

**`e2e/pages/base.page.ts`** — Abstract `BasePage(page)` with: `waitForPageLoad()`, `expectToBeOnPage(path)`, `toast` locator, `expectToast(text)`.

**`e2e/pages/auth.page.ts`** — `AuthPage` with locators for email/password/submit/error. Methods: `goto()`, `login(email, password)`, `expectLoginError(text)`, `expectLoggedIn()`.

**`e2e/pages/[feature].page.ts`** — Per-feature page objects with typed locators and action methods (add item, delete item, etc.).

### 4. Create Test Fixtures (`e2e/fixtures/`)

**`test-data.ts`** — `createTestUser()` creates user via Prisma, returns `{ email, password, id }`. `create[Feature](userId)` creates entities. `cleanupTestData(userId)` deletes user + cascade. Use `Date.now()` in email to ensure uniqueness.

**`index.ts`** — `test.extend<{ authPage, featurePage, testUser, testFeature }>` passing page objects and fixture data. Fixture lifecycle: create before test, cleanup after.

### 5. Write E2E Tests

**Auth (`e2e/tests/auth.spec.ts`):**

- Login with valid credentials → redirects to app
- Login with invalid credentials → shows error
- Logout → redirects to `/login`

**Feature management (`e2e/tests/[feature].spec.ts`):**

- `beforeEach`: login
- Add item → appears in list
- Select/deselect item → checkbox state reflects
- Delete item → item removed, count decremented

**Sharing flow (`e2e/tests/sharing.spec.ts`):**

- Open share modal → dialog visible
- Enter email + send invite → success toast
- Copy share link → clipboard contains `/invite/` URL (grant clipboard permission via `context.grantPermissions()`)

**Accessibility (`e2e/tests/accessibility.spec.ts`):**

- Run `axe-core` with `['wcag2a', 'wcag2aa']` tags on key pages
- `expect(results.violations).toEqual([])`
- Keyboard nav: Tab through interactive elements, assert `toBeFocused()`

**Visual regression (`e2e/tests/visual.spec.ts`):**

- `await expect(page).toHaveScreenshot('name.png', { maxDiffPixelRatio: 0.01 })`
- Capture both filled-state and empty-state

### 6. CI/CD Integration (`.github/workflows/e2e.yml`)

- Trigger on push to `main`, `develop` and PRs
- Service: `postgres:15` with health check
- Steps: checkout, Node 20, install, `playwright install --with-deps`, `prisma migrate deploy`, seed, run tests
- Upload `playwright-report/` as artifact (retention 7 days)

## File Structure

```
e2e/
├── fixtures/
│   ├── index.ts
│   └── test-data.ts
├── pages/
│   ├── base.page.ts
│   ├── auth.page.ts
│   └── [feature].page.ts
└── tests/
    ├── auth.spec.ts
    ├── [feature]-management.spec.ts
    ├── accessibility.spec.ts
    └── visual.spec.ts
playwright.config.ts
```

## Review Checklist

- [ ] E2E strategy documented
- [ ] Playwright configured for all target browsers
- [ ] Page objects for main pages
- [ ] Fixtures with proper create/cleanup lifecycle
- [ ] Critical auth flows tested
- [ ] Feature CRUD flows tested
- [ ] Accessibility tests on key pages
- [ ] Visual regression baselines captured
- [ ] CI workflow configured

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `app/` for routes and `src/components/` for UX. Create page objects first, then fixtures, then tests one flow at a time.

## Outputs

- [ ] `playwright.config.ts`
- [ ] `e2e/fixtures/index.ts` + `e2e/fixtures/test-data.ts`
- [ ] `e2e/pages/*.page.ts`
- [ ] `e2e/tests/*.spec.ts`
- [ ] `.github/workflows/e2e.yml`

## Related SOPs

- **SOP-500:** Unit Testing
- **SOP-501:** Integration Testing
- **SOP-305:** Page Implementation
