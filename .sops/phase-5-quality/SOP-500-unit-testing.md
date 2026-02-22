---
sop: "SOP-500"
title: "Unit Testing"
phase: 5
iterative: false
prerequisites:
  - sop: "SOP-003"
  - sop: "SOP-006"
outputs:
  - "vitest.config.ts"
  - "tests/setup.ts"
  - "**/*.test.ts"
related: ["SOP-501", "SOP-502", "SOP-503"]
---

# SOP-500: Unit Testing

## Purpose

Establish unit testing standards for functions, hooks, and components to prevent regressions and document expected behavior.

## Scope

- **Covers:** Vitest setup, component/hook/utility testing, mocking patterns, coverage thresholds
- **Excludes:** Integration testing (SOP-501), E2E testing (SOP-502)

## Prerequisites

- [ ] SOP-003 (Project Structure) — test folders planned
- [ ] SOP-006 (Code Style) — naming conventions defined

## Procedure

### 1. Install Dependencies

```bash
pnpm add -D vitest @vitest/coverage-v8
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D msw
```

### 2. Configure Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
      ],
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
    },
  },
});
```

### 3. Create Test Setup (`tests/setup.ts`)

- Import `@testing-library/jest-dom/vitest`
- Call `cleanup()` in `afterEach`
- Set up MSW: `beforeAll(server.listen)` / `afterEach(server.resetHandlers)` / `afterAll(server.close)`
- Mock `window.matchMedia` and `ResizeObserver` with `vi.fn()`

### 4. Add Test Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 5. File Organization

Co-locate test files: `Button.tsx` → `Button.test.tsx` in same folder. Global mocks/fixtures go in `tests/mocks/` and `tests/fixtures/`.

### 6. Testing Patterns

**Pure functions (utilities):** Test normal values, edge cases (empty string, zero, negative), and boundary values. Every branch in the function should have at least one test.

**React components:** Use `render` + `screen` queries. Use `userEvent.setup()` for interactions. Assert on accessible roles/labels, not CSS classes. Example cases: renders correctly, handles click, is disabled when prop is set, variant applies correct class.

**Custom hooks:** Use `renderHook` + `act`. Test initial state, each action function, and state after multiple operations.

**Async code:** Mock `fetch` with `vi.fn().mockResolvedValue(...)`. Test success path, error response (non-ok status), and network error (rejected promise). Use `await expect(fn()).rejects.toThrow(...)` pattern.

**Mocking patterns:**

- Modules: `vi.mock('@/lib/db', () => ({ prisma: { user: { findUnique: vi.fn() } } }))`
- Timers: `vi.useFakeTimers()` + `vi.advanceTimersByTime(ms)` + `vi.useRealTimers()`
- Spies: `vi.spyOn(console, 'log')`

### 7. Test Structure (AAA Pattern)

```typescript
describe("ComponentOrFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when [condition]", () => {
    it("should [expected behavior]", () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe("edge cases", () => {
    /* empty, null, max */
  });
  describe("error handling", () => {
    /* throws on invalid */
  });
});
```

## Coverage Guidelines

| Code Type                  | Target                |
| -------------------------- | --------------------- |
| Utilities / business logic | 80%+                  |
| Hooks                      | 80%+                  |
| Components                 | 70%+                  |
| API routes                 | Via integration tests |
| Config files / types       | Skip                  |

## Review Checklist

- [ ] Vitest configured with coverage thresholds
- [ ] Test setup file with MSW and browser API mocks
- [ ] Test scripts in `package.json`
- [ ] Utility functions tested (including edge cases)
- [ ] Key components tested
- [ ] Hooks tested
- [ ] Tests follow AAA pattern

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `src/` for existing code structure. Create tests for all exported utilities, key components, and custom hooks.

## Outputs

- [ ] `vitest.config.ts`
- [ ] `tests/setup.ts`
- [ ] `tests/mocks/handlers.ts` + `tests/mocks/server.ts`
- [ ] `**/*.test.ts` co-located with source
- [ ] Updated `package.json`

## Related SOPs

- **SOP-501:** Integration Testing
- **SOP-502:** E2E Testing
- **SOP-006:** Code Style (naming conventions)
