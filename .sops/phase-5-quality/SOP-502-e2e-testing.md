# SOP-502: End-to-End Testing

## Purpose

Validate complete user workflows from start to finish, ensuring all components work together correctly in a real browser environment. E2E tests catch integration issues that unit and integration tests miss, verifying the application works as users experience it.

---

## Scope

- **Applies to:** All user-facing features with critical workflows
- **Covers:** Browser automation, user flow testing, visual regression, accessibility testing
- **Does not cover:** Unit tests (SOP-500), API integration tests (SOP-501)

---

## Prerequisites

- [ ] SOP-500 (Unit Testing) — Component tests written
- [ ] SOP-501 (Integration Testing) — API integration tested
- [ ] SOP-305 (Page Implementation) — Pages implemented
- [ ] Application deployable to test environment

---

## Procedure

### 1. E2E Test Strategy

Create `/docs/testing/e2e-strategy.md`:

```markdown
# E2E Test Strategy

## Coverage Goals

| Priority | Coverage Target     | Example                       |
| -------- | ------------------- | ----------------------------- |
| Critical | 100% of happy paths | Login, core features          |
| High     | Key error scenarios | Invalid input, network errors |
| Medium   | Edge cases          | Empty states, permissions     |
| Low      | Visual regressions  | Layout, styling               |

## Test Pyramid Balance

- Unit tests: 70% (fast, isolated)
- Integration tests: 20% (API, database)
- E2E tests: 10% (critical flows only)

## What to E2E Test

✅ DO test:

- User authentication flows
- Critical business workflows
- Cross-page interactions
- Real API responses
- Accessibility compliance

❌ DON'T test:

- Every possible user action
- Styling details (use visual regression)
- Error messages (unit test these)
- API edge cases (integration tests)

## Test Environments

| Environment | Purpose        | Data                    |
| ----------- | -------------- | ----------------------- |
| Local       | Development    | Seeded test data        |
| CI          | Pull requests  | Fresh database each run |
| Staging     | Pre-production | Production-like data    |
```

### 2. Playwright Setup

Install and configure Playwright:

```bash
npm init playwright@latest
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 3. Page Object Model

Create reusable page objects:

```typescript
// e2e/pages/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnPage(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  // Common elements
  get toast(): Locator {
    return this.page.locator('[role="status"]');
  }

  async expectToast(message: string | RegExp) {
    await expect(this.toast).toContainText(message);
  }
}
```

```typescript
// e2e/pages/[entity].page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class [Entity]Page extends BasePage {
  readonly primaryInput: Locator;
  readonly submitButton: Locator;
  readonly contentList: Locator;
  readonly shareButton: Locator;

  constructor(page: Page) {
    super(page);
    this.primaryInput = page.getByPlaceholder('Add item...');
    this.submitButton = page.getByRole('button', { name: 'Add' });
    this.contentList = page.getByTestId('content-list');
    this.shareButton = page.getByRole('button', { name: 'Share' });
  }

  async goto(entityId: string) {
    await this.page.goto(`/[entities]/${entityId}`);
    await this.waitForPageLoad();
  }

  async addItem(name: string) {
    await this.primaryInput.fill(name);
    await this.submitButton.click();
    await this.waitForItemToAppear(name);
  }

  async waitForItemToAppear(name: string) {
    await expect(
      this.page.getByRole('listitem').filter({ hasText: name })
    ).toBeVisible();
  }

  async selectItem(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    await item.getByRole('checkbox').check();
  }

  async deleteItem(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    await item.getByRole('button', { name: 'Delete' }).click();
  }

  async getItemCount(): Promise<number> {
    return await this.page.getByRole('listitem').count();
  }

  async expectItemSelected(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    await expect(item.getByRole('checkbox')).toBeChecked();
  }
}
```

```typescript
// e2e/pages/auth.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.registerButton = page.getByRole('button', { name: 'Create Account' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/dashboard|\/[entities]/);
  }
}
```

### 4. Test Fixtures

Create reusable test setup:

```typescript
// e2e/fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { [Entity]Page } from '../pages/[entity].page';
import { createTestUser, createTest[Entity], cleanupTestData } from './test-data';

// Extend base test with our fixtures
export const test = base.extend<{
  authPage: AuthPage;
  entityPage: [Entity]Page;
  testUser: { email: string; password: string; id: string };
  testEntity: { id: string; name: string };
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  entityPage: async ({ page }, use) => {
    await use(new [Entity]Page(page));
  },

  testUser: async ({}, use) => {
    // Create test user before test
    const user = await createTestUser();
    await use(user);
    // Cleanup after test
    await cleanupTestData(user.id);
  },

  testEntity: async ({ testUser }, use) => {
    // Create test entity for authenticated user
    const entity = await createTest[Entity](testUser.id);
    await use(entity);
  },
});

export { expect };
```

```typescript
// e2e/fixtures/test-data.ts
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

export async function createTestUser() {
  const email = `test-${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hash(password, 10),
      emailVerified: new Date(),
    },
  });

  return { email, password, id: user.id };
}

export async function createTest[Entity](userId: string) {
  const entity = await prisma.[entity].create({
    data: {
      name: `Test [Entity] ${Date.now()}`,
      ownerId: userId,
    },
  });

  return { id: entity.id, name: entity.name };
}

export async function cleanupTestData(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}
```

### 5. Write E2E Tests

Test critical user flows:

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '../fixtures';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({
    authPage,
    testUser,
  }) => {
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await authPage.expectLoggedIn();
  });

  test('user sees error with invalid credentials', async ({ authPage }) => {
    await authPage.goto();
    await authPage.login('wrong@email.com', 'wrongpassword');
    await authPage.expectLoginError(/invalid credentials/i);
  });

  test('user can log out', async ({ authPage, page, testUser }) => {
    // Login first
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await authPage.expectLoggedIn();

    // Logout
    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('menuitem', { name: 'Sign Out' }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
```

```typescript
// e2e/tests/[entity]-management.spec.ts
import { test, expect } from '../fixtures';

test.describe('[Entity] Management', () => {
  test.beforeEach(async ({ authPage, testUser }) => {
    // Login before each test
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await authPage.expectLoggedIn();
  });

  test('user can add an item', async ({ entityPage, testEntity }) => {
    await entityPage.goto(testEntity.id);

    await entityPage.addItem('Test Item');

    await entityPage.waitForItemToAppear('Test Item');
  });

  test('user can select and deselect an item', async ({
    entityPage,
    testEntity,
  }) => {
    await entityPage.goto(testEntity.id);
    await entityPage.addItem('Sample Item');

    // Select item
    await entityPage.selectItem('Sample Item');
    await entityPage.expectItemSelected('Sample Item');
  });

  test('user can delete an item', async ({ entityPage, testEntity }) => {
    await entityPage.goto(testEntity.id);
    await entityPage.addItem('Item to Delete');

    const initialCount = await entityPage.getItemCount();

    await entityPage.deleteItem('Item to Delete');

    // Item should be removed
    await expect(entityPage.page.getByText('Item to Delete')).not.toBeVisible();
    expect(await entityPage.getItemCount()).toBe(initialCount - 1);
  });
});
```

```typescript
// e2e/tests/sharing.spec.ts
import { test, expect } from '../fixtures';

test.describe('Sharing', () => {
  test('user can share via email', async ({
    entityPage,
    testEntity,
    authPage,
    testUser,
    page,
  }) => {
    // Login and go to entity
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    // Open share modal
    await entityPage.shareButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Enter email and send
    await page.getByLabel('Email').fill('collaborator@example.com');
    await page.getByRole('button', { name: 'Send Invite' }).click();

    // Should show success
    await entityPage.expectToast(/invite sent/i);
  });

  test('user can copy share link', async ({
    entityPage,
    testEntity,
    authPage,
    testUser,
    page,
    context,
  }) => {
    // Grant clipboard permission
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    // Open share modal and copy link
    await entityPage.shareButton.click();
    await page.getByRole('button', { name: 'Copy Share Link' }).click();

    // Verify clipboard
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toMatch(/\/invite\//);
  });
});
```

### 6. Accessibility Testing

Include accessibility checks:

```typescript
// e2e/tests/accessibility.spec.ts
import { test, expect } from '../fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('login page should have no accessibility violations', async ({
    page,
  }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('[entity] page should have no accessibility violations', async ({
    authPage,
    entityPage,
    testUser,
    testEntity,
    page,
  }) => {
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('all interactive elements are keyboard accessible', async ({
    entityPage,
    testEntity,
    authPage,
    testUser,
    page,
  }) => {
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    // Tab through all interactive elements
    await page.keyboard.press('Tab'); // Should focus input
    await expect(entityPage.primaryInput).toBeFocused();

    await page.keyboard.press('Tab'); // Should focus submit button
    await expect(entityPage.submitButton).toBeFocused();
  });
});
```

### 7. Visual Regression Testing

Capture and compare screenshots:

```typescript
// e2e/tests/visual.spec.ts
import { test, expect } from '../fixtures';

test.describe('Visual Regression', () => {
  test('[entity] page matches snapshot', async ({
    entityPage,
    testEntity,
    authPage,
    testUser,
  }) => {
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    // Add some items for a realistic view
    await entityPage.addItem('Sample Item 1');
    await entityPage.addItem('Sample Item 2');

    // Compare with baseline
    await expect(entityPage.page).toHaveScreenshot('[entity]-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('empty state matches snapshot', async ({
    entityPage,
    testEntity,
    authPage,
    testUser,
  }) => {
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    await entityPage.goto(testEntity.id);

    await expect(entityPage.page).toHaveScreenshot('empty-state.png');
  });
});
```

### 8. CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Seed test data
        run: npx prisma db seed
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run E2E tests
        run: npx playwright test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          PLAYWRIGHT_BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## File Structure

```
e2e/
├── fixtures/
│   ├── index.ts           # Test fixtures
│   └── test-data.ts       # Test data helpers
├── pages/
│   ├── base.page.ts       # Base page object
│   ├── auth.page.ts       # Auth page object
│   └── [entity].page.ts   # Entity page object
├── tests/
│   ├── auth.spec.ts       # Auth flow tests
│   ├── [entity]-management.spec.ts
│   ├── sharing.spec.ts
│   ├── accessibility.spec.ts
│   └── visual.spec.ts     # Visual regression
└── playwright.config.ts
```

---

## Review Checklist

- [ ] E2E test strategy documented
- [ ] Playwright configured for all target browsers
- [ ] Page objects created for main pages
- [ ] Fixtures provide test data setup/cleanup
- [ ] Critical user flows tested
- [ ] Accessibility tests included
- [ ] Visual regression baselines captured
- [ ] CI/CD pipeline configured
- [ ] Tests run in isolation (no shared state)

---

## AI Agent Prompt Template

```markdown
Execute SOP-502 (E2E Testing):

Read:

- `/docs/frontend/pages/` for page structure
- `/docs/testing/e2e-strategy.md` for coverage goals
- `app/` for route structure

**Tasks:**

1. Create E2E test strategy document
2. Configure Playwright
3. Create page objects for main pages
4. Write test fixtures for data setup
5. Write E2E tests for critical flows
6. Add accessibility tests
7. Set up visual regression
8. Configure CI/CD pipeline

**Key principles:**

- Test user journeys, not implementation
- Use page objects for maintainability
- Test on multiple browsers/devices
- Include accessibility checks
- Replace [Entity] placeholders with your actual domain entities
```

---

## Outputs

- [ ] `/docs/testing/e2e-strategy.md` — Test strategy
- [ ] `playwright.config.ts` — Playwright config
- [ ] `e2e/pages/` — Page object files
- [ ] `e2e/fixtures/` — Test fixtures
- [ ] `e2e/tests/` — Test spec files
- [ ] `.github/workflows/e2e.yml` — CI pipeline

---

## Related SOPs

- **SOP-500:** Unit Testing (component tests)
- **SOP-501:** Integration Testing (API tests)
- **SOP-305:** Page Implementation (pages to test)
- **SOP-600:** CI/CD (deployment pipeline)
