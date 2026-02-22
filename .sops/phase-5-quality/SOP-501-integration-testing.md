---
sop: "SOP-501"
title: "Integration Testing"
phase: 5
iterative: false
prerequisites:
  - sop: "SOP-500"
  - sop: "SOP-101"
  - sop: "SOP-202"
outputs:
  - ".env.test"
  - "tests/helpers/db.ts"
  - "tests/factories/"
  - "tests/integration/"
related: ["SOP-500", "SOP-502", "SOP-202", "SOP-203"]
---

# SOP-501: Integration Testing

## Purpose

Verify that different parts of the system work together correctly by testing real API routes, database operations, and authentication flows.

## Scope

- **Covers:** Test DB setup, factories, API route tests, auth tests, transaction tests
- **Excludes:** Unit tests (SOP-500), E2E/browser tests (SOP-502)

## Prerequisites

- [ ] SOP-500 testing framework configured
- [ ] SOP-101 schema defined
- [ ] SOP-202 API routes implemented

## Procedure

### 1. Add Dependencies

```bash
pnpm add -D dotenv-cli
```

### 2. Configure Test Environment (`.env.test`)

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_test"
NEXTAUTH_SECRET="test-secret-for-integration-tests"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Create Database Helpers (`tests/helpers/db.ts`)

- Export `prisma` client instance
- `setupTestDatabase()` — `execSync('pnpm prisma db push --force-reset', { env: { ...process.env, DATABASE_URL } })`
- `clearDatabase()` — query `pg_tables` for `schemaname='public'`, `TRUNCATE ... CASCADE` each (skip `_prisma_migrations`)
- `disconnectDatabase()` — `prisma.$disconnect()`

### 4. Create Test Factories (`tests/factories/[model].factory.ts`)

For each Prisma model, create a factory function: `create[Model](options = {})` that:

- Fills required fields with `faker` values as defaults
- Merges with provided `options`
- Calls `prisma.[model].create()`

Export all factories from `tests/factories/index.ts`.

### 5. Create Integration Test Setup (`tests/integration/setup.ts`)

```typescript
beforeAll(async () => {
  await setupTestDatabase();
});
afterEach(async () => {
  await clearDatabase();
});
afterAll(async () => {
  await disconnectDatabase();
});
```

### 6. Test API Routes

Import Next.js route handlers directly (`GET`, `POST`, etc.) from `src/app/api/.../route.ts`. Construct `NextRequest` objects manually. Test for each HTTP method:

- Empty state (no data)
- Normal success with data in DB
- Pagination (`?page=1&limit=10`)
- Validation errors (400 with `VALIDATION_ERROR` code)
- Conflict errors (409 for duplicate unique fields)
- 404 for non-existent resources

After mutations, verify result in DB directly via `prisma`.

### 7. Test Authentication Flow

Test the login route: valid credentials → 200 + token; wrong password → 401; nonexistent user → 401. Both should return the same 401 to prevent user enumeration.

### 8. Test Protected Routes

Construct requests with and without `Authorization: Bearer` header. No token → 401. Invalid token → 401. Valid token (generated via `generateToken(user)`) → 200 with correct user data.

### 9. Test Database Transactions

For any multi-step operations (e.g., fund transfers), test: success path verifies both sides updated. Failure path (e.g., insufficient funds) verifies rollback — state unchanged after rejected promise.

### 10. Add Integration Test Scripts

```json
{
  "scripts": {
    "test:integration": "dotenv -e .env.test -- vitest run tests/integration",
    "test:integration:watch": "dotenv -e .env.test -- vitest tests/integration"
  }
}
```

## Review Checklist

- [ ] `.env.test` configured with test database URL
- [ ] DB helper functions created
- [ ] Factories for all models
- [ ] Integration test setup file (beforeAll/afterEach/afterAll)
- [ ] CRUD API tests for each resource
- [ ] Authentication tests (login success + failure)
- [ ] Protected route tests (no token, invalid token, valid token)
- [ ] Transaction rollback tests
- [ ] Tests clean DB after each test

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `prisma/schema.prisma` for models and `src/app/api/` for routes. Create factories for all models, then write tests covering all routes.

## Outputs

- [ ] `.env.test`
- [ ] `tests/helpers/db.ts`
- [ ] `tests/factories/[model].factory.ts` (one per model)
- [ ] `tests/factories/index.ts`
- [ ] `tests/integration/setup.ts`
- [ ] `tests/integration/api/[resource].test.ts`
- [ ] Updated `package.json`

## Related SOPs

- **SOP-500:** Unit Testing
- **SOP-502:** E2E Testing
- **SOP-202:** API Design
- **SOP-203:** Authentication
