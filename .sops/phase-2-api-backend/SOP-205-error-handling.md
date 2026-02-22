---
sop: "SOP-205"
title: "Error Handling"
phase: 2
iterative: false
prerequisites:
  - sop: "SOP-202"
    output: "/docs/api/openapi.yaml"
outputs:
  - "src/lib/errors.ts"
  - "src/middleware/error-handler.ts"
related: ["SOP-202", "SOP-206", "SOP-200"]
---

# SOP-205: Error Handling

## Purpose

Establish a consistent, structured error handling strategy so all API errors return predictable responses useful to clients.

## Scope

- **Covers:** Error types, HTTP status codes, centralized error middleware, error response format
- **Excludes:** Logging/monitoring (SOP-602), input validation (SOP-206)

## Prerequisites

- [ ] SOP-202 completed — API response shape established

## Procedure

### 1. Define Standard Error Response Format

```typescript
interface ApiError {
  error: {
    code: string; // Machine-readable: "NOT_FOUND", "VALIDATION_ERROR"
    message: string; // Human-readable
    details?: unknown; // Additional context (validation field errors, etc.)
  };
}
```

### 2. Create Error Classes

`src/lib/errors.ts` — extend a base `AppError` with:

| Class               | HTTP Status | Code               |
| ------------------- | ----------- | ------------------ |
| `NotFoundError`     | 404         | `NOT_FOUND`        |
| `ValidationError`   | 400         | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401         | `UNAUTHORIZED`     |
| `ForbiddenError`    | 403         | `FORBIDDEN`        |
| `ConflictError`     | 409         | `CONFLICT`         |
| `InternalError`     | 500         | `INTERNAL_ERROR`   |

Each class: `constructor(message: string, details?: unknown)`, stores `statusCode`, `code`, `isOperational`.

### 3. Implement Centralized Error Handler Middleware

`src/middleware/error-handler.ts` must:

1. Catch all errors thrown in routes/middleware
2. If `AppError` (operational): serialize to `ApiError` format, return the error's `statusCode`
3. If unknown (programming error): log the error, return generic `500` — **never expose stack traces in production**
4. In all cases: set `Content-Type: application/json`

### 4. Register Error Handler

Register the error handler middleware **last** in the express/Next.js app setup. In Next.js API routes, wrap handlers in a `withErrorHandler` HOF.

### 5. Use Errors Consistently in Services and Routes

- Throw `NotFoundError` when a required entity doesn't exist
- Throw `ForbiddenError` for authorization failures
- Throw `ValidationError` for business-rule violations (not schema violations — those are SOP-206)
- Throw `ConflictError` for duplicate resource creation

## Review Checklist

- [ ] Standard error response format defined
- [ ] All `AppError` subclasses created
- [ ] Error handler middleware catches all errors
- [ ] Programming errors do not expose internal details in production
- [ ] Services and routes throw typed errors consistently
- [ ] `4xx` vs `5xx` distinction correct throughout

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. No prerequisite files need to be re-read — implement based on the agreed error format in the context cache.

## Outputs

- [ ] `src/lib/errors.ts`
- [ ] `src/middleware/error-handler.ts`

## Related SOPs

- **SOP-202:** API Design
- **SOP-206:** Validation
- **SOP-200:** Service Layer
