---
sop: "SOP-204"
title: "Authorization"
phase: 2
iterative: false
prerequisites:
  - sop: "SOP-203"
    output: "src/middleware/auth.ts"
  - sop: "SOP-000"
    output: "/docs/requirements.md"
outputs:
  - "src/middleware/authorize.ts"
  - "src/lib/permissions.ts"
  - "/docs/architecture/permissions.md"
related: ["SOP-203", "SOP-202", "SOP-200"]
---

# SOP-204: Authorization

## Purpose

Implement access control so authenticated users can only perform actions they are permitted to.

## Scope

- **Covers:** RBAC / ABAC strategy, permission definitions, authorization middleware, route-level guards
- **Excludes:** Authentication (SOP-203)

## Prerequisites

- [ ] SOP-203 completed — auth middleware attaches user to request context
- [ ] SOP-000 completed — roles and permissions requirements known

## Procedure

### 1. Define Access Control Strategy

**RBAC (Role-Based):** User has a role (e.g., `ADMIN`, `USER`); role grants permission to resources. Simple to implement; use when roles are few and stable.

**ABAC (Attribute-Based):** Permissions derive from user attributes + resource attributes (e.g., "owner can edit their own record"). More flexible; needed when row-level access control is required.

Most projects need both: RBAC for admin/user gating, ABAC for ownership checks.

### 2. Define All Roles and Permissions

Create `src/lib/permissions.ts`:

- Define all roles as a const enum or union type
- Map roles to allowed operations per resource
- Define ownership check functions (e.g., `isOwner(user, resource)`)

### 3. Implement Authorization Middleware

`src/middleware/authorize.ts` must:

1. Accept required role(s) or a custom permission check function as parameter
2. Read the user from request context (attached by auth middleware)
3. Verify user has the required role / passes the permission check
4. Return `403 Forbidden` if authorization fails

### 4. Apply Authorization Guards to Routes

For each protected route, apply both: auth middleware (SOP-203) + authorization middleware with the appropriate role/permission. Document in `/docs/api/endpoints.md` which role is required for each endpoint.

### 5. Implement Row-Level Ownership Checks in Services

In service methods that mutate resources, verify the requesting user owns the resource (or is an admin) before proceeding. Throw `ForbiddenError` if not authorized.

### 6. Document Permissions Matrix

Create `/docs/architecture/permissions.md` with: roles table (role/description/capabilities), permissions matrix (resource × operation × allowed roles), ownership rules.

## Review Checklist

- [ ] Roles defined and documented
- [ ] Permission check functions implemented
- [ ] Authorization middleware created
- [ ] All mutation endpoints have authorization guards
- [ ] Ownership checks in relevant service methods
- [ ] `403` returned for insufficient permissions
- [ ] Permissions matrix documented

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` for role definitions and context cache for entity list.

## Outputs

- [ ] `src/middleware/authorize.ts`
- [ ] `src/lib/permissions.ts`
- [ ] `/docs/architecture/permissions.md`

## Related SOPs

- **SOP-203:** Authentication
- **SOP-202:** API Design
- **SOP-200:** Service Layer
