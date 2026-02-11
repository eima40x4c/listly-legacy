# SOP-202: API Design

## Purpose

Design RESTful APIs that are consistent, intuitive, and well-documented. Good API design improves developer experience, reduces integration errors, and creates a maintainable contract between frontend and backend.

---

## Scope

- **Applies to:** All projects with API endpoints
- **Covers:** REST conventions, endpoint design, OpenAPI documentation
- **Does not cover:** Authentication (SOP-203), Error handling (SOP-205)

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) completed
- [ ] SOP-101 (Schema Design) completed
- [ ] Data entities defined

---

## Procedure

### 1. Resource Identification

Map database entities to API resources:

| Entity   | Resource   | Base Path         |
| -------- | ---------- | ----------------- |
| User     | users      | `/api/users`      |
| Product  | products   | `/api/products`   |
| Order    | orders     | `/api/orders`     |
| Category | categories | `/api/categories` |

### 2. HTTP Method Conventions

| Method   | Purpose       | Path             | Example                |
| -------- | ------------- | ---------------- | ---------------------- |
| `GET`    | Read (list)   | `/resources`     | Get all products       |
| `GET`    | Read (single) | `/resources/:id` | Get product by ID      |
| `POST`   | Create        | `/resources`     | Create new product     |
| `PUT`    | Replace       | `/resources/:id` | Replace entire product |
| `PATCH`  | Update        | `/resources/:id` | Update product fields  |
| `DELETE` | Remove        | `/resources/:id` | Delete product         |

### 3. URL Path Conventions

**Do:**

- Use nouns for resources: `/products`, `/users`
- Use plural names: `/products` not `/product`
- Use kebab-case: `/order-items` not `/orderItems`
- Nest logically: `/users/:id/orders`

**Don't:**

- Use verbs in paths: ~~`/getProducts`~~
- Mix singular/plural: ~~`/product/:id/items`~~
- Go too deep: ~~`/users/:id/orders/:id/items/:id/reviews`~~

### 4. Query Parameter Conventions

| Purpose               | Parameter       | Example                               |
| --------------------- | --------------- | ------------------------------------- |
| **Pagination**        | `page`, `limit` | `?page=2&limit=20`                    |
| **Sorting**           | `sort`, `order` | `?sort=createdAt&order=desc`          |
| **Filtering**         | Field name      | `?status=active&category=electronics` |
| **Searching**         | `q` or `search` | `?q=wireless+headphones`              |
| **Field selection**   | `fields`        | `?fields=id,name,price`               |
| **Include relations** | `include`       | `?include=category,reviews`           |

### 5. Response Format Standards

**Success Response:**

```json
{
  "data": {
    /* resource or array */
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Single Resource:**

```json
{
  "data": {
    "id": "abc123",
    "name": "Product Name",
    "price": 29.99,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Collection:**

```json
{
  "data": [
    { "id": "abc123", "name": "Product 1" },
    { "id": "def456", "name": "Product 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### 6. Status Code Usage

| Code  | Meaning       | Use Case                       |
| ----- | ------------- | ------------------------------ |
| `200` | OK            | Successful GET, PUT, PATCH     |
| `201` | Created       | Successful POST                |
| `204` | No Content    | Successful DELETE              |
| `400` | Bad Request   | Validation error               |
| `401` | Unauthorized  | Missing/invalid auth           |
| `403` | Forbidden     | Insufficient permissions       |
| `404` | Not Found     | Resource doesn't exist         |
| `409` | Conflict      | Duplicate/constraint violation |
| `422` | Unprocessable | Business logic error           |
| `500` | Server Error  | Unexpected error               |

### 7. Design API Endpoints

Create `/docs/api/endpoints.md`:

```markdown
# API Endpoints

## Authentication

| Method | Path               | Description      | Auth |
| ------ | ------------------ | ---------------- | ---- |
| POST   | /api/auth/register | Create account   | No   |
| POST   | /api/auth/login    | Login            | No   |
| POST   | /api/auth/logout   | Logout           | Yes  |
| GET    | /api/auth/me       | Get current user | Yes  |

## Users

| Method | Path           | Description | Auth | Role       |
| ------ | -------------- | ----------- | ---- | ---------- |
| GET    | /api/users     | List users  | Yes  | Admin      |
| GET    | /api/users/:id | Get user    | Yes  | Self/Admin |
| PATCH  | /api/users/:id | Update user | Yes  | Self/Admin |
| DELETE | /api/users/:id | Delete user | Yes  | Admin      |

## Products

| Method | Path              | Description    | Auth  |
| ------ | ----------------- | -------------- | ----- |
| GET    | /api/products     | List products  | No    |
| GET    | /api/products/:id | Get product    | No    |
| POST   | /api/products     | Create product | Admin |
| PATCH  | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc, desc (default: desc)
- `category` - Filter by category slug
- `q` - Search query

## Orders

| Method | Path            | Description         | Auth  |
| ------ | --------------- | ------------------- | ----- |
| GET    | /api/orders     | List user's orders  | Yes   |
| GET    | /api/orders/:id | Get order details   | Yes   |
| POST   | /api/orders     | Create order        | Yes   |
| PATCH  | /api/orders/:id | Update order status | Admin |
```

### 8. Create OpenAPI Specification

> **📄 Template:** Copy [`.sops/templates/api-design-template.yaml`](../templates/api-design-template.yaml) to `/docs/api/openapi.yaml` and customize for your project.

The template includes:

- Server configuration (dev/prod)
- Common security schemes (JWT Bearer)
- Reusable response components (errors, pagination)
- Example endpoint patterns

**Basic structure overview:**

```yaml
openapi: 3.0.3
info:
  title: Project API
  version: 1.0.0

servers:
  - url: http://localhost:3000/api
    description: Development

paths:
  /resources:
    get:
      summary: List resources
      responses:
        '200':
          description: Success
    post:
      summary: Create resource
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateResource'
      responses:
        '201':
          description: Created

components:
  schemas:
    # Define your schemas here
  responses:
    # Reusable error responses
```

> See the full template for complete examples with authentication, pagination, and error handling.

### 9. API Versioning Strategy

**Recommended: URL Path Versioning**

```
/api/v1/products
/api/v2/products
```

For most projects, start without versioning and add when needed:

```
/api/products  → /api/v1/products (when v2 is introduced)
```

---

## Review Checklist

- [ ] All resources identified and mapped
- [ ] Endpoints follow REST conventions
- [ ] URL paths use correct naming
- [ ] HTTP methods used appropriately
- [ ] Response format standardized
- [ ] Status codes documented
- [ ] OpenAPI specification created
- [ ] Pagination strategy defined

---

## AI Agent Prompt Template

```
Design the REST API for this project.

Read:
- `/docs/requirements.md` for features
- `/docs/database/schema.md` for data model
- `.sops/templates/api-design-template.yaml` as OpenAPI starting point

Execute SOP-202 (API Design):
1. Identify resources from the data model
2. Design endpoints for each resource
3. Define request/response formats
4. Create OpenAPI specification (copy template to /docs/api/openapi.yaml)
5. Document in /docs/api/endpoints.md and /docs/api/openapi.yaml
```

---

## Outputs

- [ ] `/docs/api/endpoints.md` — Endpoint documentation
- [ ] `/docs/api/openapi.yaml` — OpenAPI specification

---

## Related SOPs

- **SOP-101:** Schema Design (data model → resources)
- \*\*SOP-203: Authentication (securing endpoints)
- **SOP-204:** Authorization (access control)
- \*\*SOP-205: Error Handling (error responses)
- \*\*SOP-206: Validation (input validation)
