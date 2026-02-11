# SOP-200: Service Layer & Business Logic

## Purpose

Implement the core business logic and features of the application. The service layer contains the actual "what the app does" — translating user stories into executable code that orchestrates data access, business rules, and domain operations.

---

## Scope

- **Applies to:** All projects with business logic beyond simple CRUD
- **Covers:** Service classes, use case implementation, business rules, domain logic
- **Does not cover:** Data access patterns (SOP-201), API exposure (SOP-202)

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) — User stories defined
- [ ] SOP-005 (Design Patterns) — Service/repository patterns selected
- [ ] SOP-101 (Schema Design) — Data model defined

---

## Procedure

### 1. Map User Stories to Services

Create `/docs/backend/services.md`:

```markdown
# Service Layer Design

## Service Mapping

| User Story                | Service         | Method     | Description                                      |
| ------------------------- | --------------- | ---------- | ------------------------------------------------ |
| US-001: User can register | AuthService     | register() | Create account, hash password, send verification |
| US-002: User can login    | AuthService     | login()    | Validate credentials, issue token                |
| US-XXX: [User story]      | [Entity]Service | [action]() | [Description of business logic]                  |

## Service Inventory

| Service         | Responsibility                     | Dependencies                            |
| --------------- | ---------------------------------- | --------------------------------------- |
| AuthService     | User authentication & registration | UserRepository, EmailService            |
| UserService     | User profile management            | UserRepository                          |
| [Entity]Service | [Entity] operations                | [Entity]Repository, [Related]Repository |
```

### 2. Define Service Interfaces

Create service interfaces that define the contract:

```typescript
// src/services/interfaces/[entity]-service.interface.ts
import type { [Entity], [RelatedEntity], User } from '@prisma/client';

export interface Create[Entity]Input {
  name: string;
  ownerId: string;
  // Add fields based on your schema
}

export interface Update[Entity]Input {
  name?: string;
  status?: string;
  // Partial fields for updates
}

export interface I[Entity]Service {
  // CRUD operations
  create(input: Create[Entity]Input): Promise<[Entity]>;
  getById(id: string, userId: string): Promise<[Entity] | null>;
  getByUser(userId: string): Promise<[Entity][]>;
  update(id: string, userId: string, data: Update[Entity]Input): Promise<[Entity]>;
  delete(id: string, userId: string): Promise<void>;

  // Related entity operations (if applicable)
  addRelated(entityId: string, data: CreateRelatedInput): Promise<[RelatedEntity]>;
  removeRelated(entityId: string, relatedId: string): Promise<void>;

  // Sharing/collaboration (if applicable)
  share(entityId: string, ownerId: string, targetEmail: string): Promise<void>;

  // Domain-specific operations
  duplicate(id: string, userId: string, newName: string): Promise<[Entity]>;
  archive(id: string, userId: string): Promise<[Entity]>;
}
```

### 3. Implement Service Classes

Create services that implement business logic:

```typescript
// src/services/[entity].service.ts
import type { [Entity], [RelatedEntity] } from '@prisma/client';
import type { I[Entity]Service, Create[Entity]Input } from './interfaces/[entity]-service.interface';
import { [Entity]Repository } from '@/repositories/[entity].repository';
import { [Related]Repository } from '@/repositories/[related].repository';
import { NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors';

const MAX_ENTITIES_PER_USER = 100; // Configure based on your domain
const MAX_COLLABORATORS = 10;

export class [Entity]Service implements I[Entity]Service {
  constructor(
    private entityRepo: [Entity]Repository,
    private relatedRepo: [Related]Repository,
  ) {}

  async create(input: Create[Entity]Input): Promise<[Entity]> {
    // Business rule: Enforce limits
    const existingCount = await this.entityRepo.countByOwner(input.ownerId);
    if (existingCount >= MAX_ENTITIES_PER_USER) {
      throw new ValidationError(`Maximum limit reached (${MAX_ENTITIES_PER_USER})`);
    }

    // Create with default settings
    return this.entityRepo.create({
      name: input.name,
      ownerId: input.ownerId,
      status: 'active',
    });
  }

  async getById(id: string, userId: string): Promise<[Entity] | null> {
    const entity = await this.entityRepo.findById(id);

    if (!entity) {
      throw new NotFoundError('[Entity] not found');
    }

    // Business rule: User must have access
    const hasAccess = await this.checkAccess(id, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this resource');
    }

    return entity;
  }

  async addRelated(entityId: string, input: CreateRelatedInput): Promise<[RelatedEntity]> {
    const entity = await this.entityRepo.findById(entityId);
    if (!entity) {
      throw new NotFoundError('[Entity] not found');
    }

    // Business rule: Check for duplicates
    const existing = await this.relatedRepo.findByNameInEntity(entityId, input.name);

    if (existing) {
      // Handle based on your domain logic: merge, reject, or update
      throw new ValidationError('Related entity already exists');
    }

    // Create new related entity
    return this.relatedRepo.create({
      ...input,
      entityId,
      position: await this.getNextPosition(entityId),
    });
  }

  async share(entityId: string, ownerId: string, email: string): Promise<void> {
    const entity = await this.entityRepo.findById(entityId);

    if (!entity) {
      throw new NotFoundError('[Entity] not found');
    }

    if (entity.ownerId !== ownerId) {
      throw new ForbiddenError('Only the owner can share this resource');
    }

    // Business rule: Limit collaborators
    const collaboratorCount = await this.entityRepo.countCollaborators(entityId);
    if (collaboratorCount >= MAX_COLLABORATORS) {
      throw new ValidationError(`Maximum collaborators reached (${MAX_COLLABORATORS})`);
    }

    // Generate invite and notify
    const inviteCode = await this.generateInviteCode(entityId);
    await this.notificationService.sendInvite(email, entity.name, inviteCode);
  }

  // Private helper methods
  private async checkAccess(entityId: string, userId: string): Promise<boolean> {
    return this.entityRepo.hasAccess(entityId, userId);
  }

  private async getNextPosition(entityId: string): Promise<number> {
    const maxPosition = await this.relatedRepo.getMaxPosition(entityId);
    return (maxPosition || 0) + 1;
  }

  private async generateInviteCode(entityId: string): Promise<string> {
    const code = crypto.randomUUID();
    await this.entityRepo.createInvite(entityId, code);
    return code;
  }
}
```

### 4. Service Factory & Dependency Injection

Create a factory for instantiating services with dependencies:

```typescript
// src/services/index.ts
import { [Entity]Service } from './[entity].service';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { [Entity]Repository } from '@/repositories/[entity].repository';
import { UserRepository } from '@/repositories/user.repository';

// Simple factory pattern
// For larger apps, consider a DI container like tsyringe or inversify

let entityService: [Entity]Service | null = null;
let userService: UserService | null = null;
let authService: AuthService | null = null;

export function get[Entity]Service(): [Entity]Service {
  if (!entityService) {
    entityService = new [Entity]Service(
      new [Entity]Repository(),
      new [Related]Repository(),
    );
  }
  return entityService;
}

export function getUserService(): UserService {
  if (!userService) {
    userService = new UserService(new UserRepository());
  }
  return userService;
}

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService(new UserRepository());
  }
  return authService;
}

// For testing - reset all services
export function resetServices(): void {
  entityService = null;
  userService = null;
  authService = null;
}
```

### 5. Document Business Rules

Create `/docs/backend/business-rules.md`:

```markdown
# Business Rules

## [Entity] Rules

| Rule ID | Rule                                      | Enforcement              |
| ------- | ----------------------------------------- | ------------------------ |
| ENT-001 | User can have maximum N active [entities] | [Entity]Service.create() |
| ENT-002 | Maximum N collaborators per [entity]      | [Entity]Service.share()  |
| ENT-003 | Only owner can delete                     | [Entity]Service.delete() |
| ENT-004 | Collaborators have read/write, not delete | Authorization middleware |

## [Related Entity] Rules

| Rule ID | Rule                          | Enforcement                  |
| ------- | ----------------------------- | ---------------------------- |
| REL-001 | Must belong to valid [entity] | [Entity]Service.addRelated() |
| REL-002 | Duplicate handling defined    | [Entity]Service.addRelated() |

## User Rules

| Rule ID  | Rule                               | Enforcement               |
| -------- | ---------------------------------- | ------------------------- |
| USER-001 | Email must be verified for sharing | AuthService.verifyEmail() |
| USER-002 | Password minimum 8 characters      | Validation schema         |
```

### 6. Traceability Matrix

Create `/docs/backend/traceability.md`:

```markdown
# Requirements Traceability

| User Story | Service Method             | Repository Method       | API Endpoint             | Test             |
| ---------- | -------------------------- | ----------------------- | ------------------------ | ---------------- |
| US-001     | AuthService.register()     | UserRepo.create()       | POST /api/auth/register  | auth.test.ts     |
| US-002     | AuthService.login()        | UserRepo.findByEmail()  | POST /api/auth/login     | auth.test.ts     |
| US-XXX     | [Entity]Service.[method]() | [Entity]Repo.[method]() | [METHOD] /api/[entities] | [entity].test.ts |
```

---

## Review Checklist

- [ ] All user stories mapped to service methods
- [ ] Service interfaces defined with clear contracts
- [ ] Service classes implement business logic (not just CRUD)
- [ ] Business rules documented and enforced
- [ ] Dependencies injected (not hardcoded)
- [ ] Traceability matrix links requirements → code
- [ ] Error handling uses domain-specific errors

---

## AI Agent Prompt Template

```markdown
Execute SOP-200 (Service Layer):

Read:

- `/docs/requirements.md` for user stories
- `/docs/database/schema.md` for data model
- `/docs/architecture/design-patterns.md` for service patterns

**Tasks:**

1. Map each user story to service method(s)
2. Create service interfaces in `src/services/interfaces/`
3. Implement service classes in `src/services/`
4. Document business rules in `/docs/backend/business-rules.md`
5. Create traceability matrix in `/docs/backend/traceability.md`

**Key principles:**

- Services contain business logic, not just data access
- Every user story must trace to at least one service method
- Business rules must be documented and code-referenced
- Replace [Entity] placeholders with your actual domain entities
```

---

## Outputs

- [ ] `/docs/backend/services.md` — Service layer design
- [ ] `/docs/backend/business-rules.md` — Business rules documentation
- [ ] `/docs/backend/traceability.md` — Requirements traceability
- [ ] `src/services/interfaces/` — Service interface files
- [ ] `src/services/` — Service implementation files
- [ ] `src/services/index.ts` — Service factory

---

## Related SOPs

- **SOP-000:** Requirements (user stories to implement)
- **SOP-005:** Design Patterns (service/repository selection)
- **SOP-101:** Schema Design (data model)
- **SOP-201:** Repository Pattern (data access layer)
- **SOP-202:** API Design (exposing services as endpoints)
