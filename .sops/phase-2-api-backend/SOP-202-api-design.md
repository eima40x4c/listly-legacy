---
sop: "SOP-202"
title: "API Design"
phase: 2
iterative: true
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
  - sop: "SOP-200"
    output: "src/services/"
outputs:
  - "/docs/api/openapi.yaml"
  - "/docs/api/endpoints.md"
related: ["SOP-200", "SOP-203", "SOP-204", "SOP-205", "SOP-206"]
---

# SOP-202: API Design

## Purpose

Design a consistent, RESTful API surface with documented contracts before implementation begins.

## Scope

- **Covers:** Endpoint definitions, request/response schemas, versioning, OpenAPI spec
- **Excludes:** Authentication (SOP-203), Authorization (SOP-204), Error format (SOP-205)

## Prerequisites

- [ ] SOP-000 completed — user stories and data needs known
- [ ] SOP-200 (or draft) — services defined (endpoints map to service operations)

## Procedure

### 1. Define API Conventions

Establish once and document in `/docs/api/endpoints.md`:

| Convention        | Standard                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| Base path         | `/api/v1`                                                               |
| Resource naming   | Plural nouns: `/users`, `/products`                                     |
| HTTP verbs        | `GET` list/detail, `POST` create, `PUT/PATCH` update, `DELETE` delete   |
| Response envelope | `{ data, error, meta }`                                                 |
| Pagination        | `?page=1&limit=20` query params; meta includes `total`, `page`, `limit` |
| Filtering         | Query params: `?status=active&categoryId=xxx`                           |
| Sorting           | `?sortBy=createdAt&order=desc`                                          |

### 2. Manifest All Endpoints

For each entity requiring an API, list: all CRUD endpoints + any domain-specific actions (e.g., `POST /orders/:id/cancel`). Map each to the service method it calls.

### 3. Define Request/Response Schemas per Endpoint

For each endpoint, document:

- URL pattern and HTTP method
- Path params, query params
- Request body schema (JSON)
- Success response shape (status code + body)
- Error responses (reference SOP-205 error codes)

### 4. Write OpenAPI Specification

→ template: `.sops/templates/api-design-template.yaml` (existing)

Output file: `/docs/api/openapi.yaml`

Document every endpoint with: `summary`, `parameters`, `requestBody`, `responses` (including 400/401/403/404/500).

### 5. Create `/docs/api/endpoints.md`

Human-readable endpoint index: group by resource, table per resource (method/path/description/auth required/roles).

### 6. Checkpoint After Each Resource

Verify: all CRUD + domain operations covered, schemas complete, OpenAPI valid (`npx @redocly/cli lint /docs/api/openapi.yaml`).

## Review Checklist

- [ ] All resources from requirements have endpoints
- [ ] URL conventions consistent (plural nouns, versioned)
- [ ] HTTP verbs used correctly
- [ ] Request/response schemas defined for all endpoints
- [ ] Error responses specified
- [ ] Pagination defined for list endpoints
- [ ] `/docs/api/openapi.yaml` created
- [ ] `/docs/api/endpoints.md` created

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Design one resource group per iteration. Read `/docs/requirements.md` for user stories driving the API surface.

## Outputs

- [ ] `/docs/api/openapi.yaml`
- [ ] `/docs/api/endpoints.md`

## Related SOPs

- **SOP-200:** Service Layer
- **SOP-203:** Authentication
- **SOP-204:** Authorization
- **SOP-205:** Error Handling
- **SOP-206:** Validation
