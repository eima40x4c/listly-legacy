# SOP-201: Repository Pattern & Data Access

## Purpose

Create a clean abstraction layer between business logic (services) and data storage (database). The repository pattern encapsulates all data access logic, making services database-agnostic and enabling easy testing with mock repositories.

---

## Scope

- **Applies to:** All projects using databases (especially Prisma)
- **Covers:** Repository classes, data access patterns, query encapsulation
- **Does not cover:** Business logic (SOP-200), schema design (SOP-101)

---

## Prerequisites

- [ ] SOP-101 (Schema Design) — Prisma schema defined
- [ ] SOP-102 (Migrations) — Database migrated
- [ ] SOP-005 (Design Patterns) — Repository pattern selected

---

## Procedure

### 1. Define Repository Interfaces

Create interfaces that define data access contracts:

```typescript
// src/repositories/interfaces/[entity]-repository.interface.ts
import type { [Entity], Prisma } from '@prisma/client';

export interface I[Entity]Repository {
  // CRUD operations
  create(data: Prisma.[Entity]CreateInput): Promise<[Entity]>;
  findById(id: string): Promise<[Entity] | null>;
  findByIdWithRelated(id: string): Promise<[Entity]WithRelated | null>;
  update(id: string, data: Prisma.[Entity]UpdateInput): Promise<[Entity]>;
  delete(id: string): Promise<void>;

  // Query operations
  findByOwner(ownerId: string, options?: QueryOptions): Promise<[Entity][]>;
  findSharedWithUser(userId: string): Promise<[Entity][]>;
  countByOwner(ownerId: string): Promise<number>;

  // Access control
  hasAccess(entityId: string, userId: string): Promise<boolean>;
  countCollaborators(entityId: string): Promise<number>;

  // Sharing (if applicable)
  createInvite(entityId: string, code: string): Promise<void>;
  findByInviteCode(code: string): Promise<[Entity] | null>;
  addCollaborator(entityId: string, userId: string): Promise<void>;
}

// Type for entity with related data
export type [Entity]WithRelated = [Entity] & {
  relatedItems: [RelatedEntity][];
};

// Query options for pagination/filtering
export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  order?: 'asc' | 'desc';
  status?: 'active' | 'archived';
}
```

### 2. Implement Base Repository

Create a base class with common functionality:

```typescript
// src/repositories/base.repository.ts
import { prisma } from '@/lib/prisma';
import type { PrismaClient, Prisma } from '@prisma/client';

export abstract class BaseRepository<T> {
  protected db: PrismaClient;
  protected abstract model: keyof PrismaClient;

  constructor(client?: PrismaClient) {
    this.db = client || prisma;
  }

  // Override in subclass for transaction support
  withTransaction(tx: Prisma.TransactionClient): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.assign(clone, this);
    clone.db = tx;
    return clone;
  }
}
```

### 3. Implement Concrete Repositories

Create repository implementations:

```typescript
// src/repositories/[entity].repository.ts
import { prisma } from '@/lib/prisma';
import type { [Entity], Prisma, PrismaClient } from '@prisma/client';
import type {
  I[Entity]Repository,
  [Entity]WithRelated,
  QueryOptions
} from './interfaces/[entity]-repository.interface';
import { BaseRepository } from './base.repository';

export class [Entity]Repository extends BaseRepository<[Entity]> implements I[Entity]Repository {
  protected model = '[entity]' as const;

  constructor(client?: PrismaClient) {
    super(client);
  }

  async create(data: Prisma.[Entity]CreateInput): Promise<[Entity]> {
    return this.db.[entity].create({ data });
  }

  async findById(id: string): Promise<[Entity] | null> {
    return this.db.[entity].findUnique({
      where: { id },
    });
  }

  async findByIdWithRelated(id: string): Promise<[Entity]WithRelated | null> {
    return this.db.[entity].findUnique({
      where: { id },
      include: {
        relatedItems: {
          orderBy: [
            { position: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });
  }

  async update(id: string, data: Prisma.[Entity]UpdateInput): Promise<[Entity]> {
    return this.db.[entity].update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.[entity].delete({
      where: { id },
    });
  }

  async findByOwner(ownerId: string, options: QueryOptions = {}): Promise<[Entity][]> {
    const {
      skip = 0,
      take = 50,
      orderBy = 'updatedAt',
      order = 'desc',
      status,
    } = options;

    return this.db.[entity].findMany({
      where: {
        ownerId,
        ...(status && { status }),
      },
      skip,
      take,
      orderBy: { [orderBy]: order },
    });
  }

  async findSharedWithUser(userId: string): Promise<[Entity][]> {
    return this.db.[entity].findMany({
      where: {
        collaborators: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async countByOwner(ownerId: string): Promise<number> {
    return this.db.[entity].count({
      where: { ownerId, status: 'active' },
    });
  }

  async hasAccess(entityId: string, userId: string): Promise<boolean> {
    const entity = await this.db.[entity].findFirst({
      where: {
        id: entityId,
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
    });
    return entity !== null;
  }

  async countCollaborators(entityId: string): Promise<number> {
    return this.db.[entity]Collaborator.count({
      where: { entityId },
    });
  }

  async createInvite(entityId: string, code: string): Promise<void> {
    await this.db.[entity]Invite.create({
      data: {
        entityId,
        code,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async findByInviteCode(code: string): Promise<[Entity] | null> {
    const invite = await this.db.[entity]Invite.findFirst({
      where: {
        code,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { [entity]: true },
    });
    return invite?.[entity] ?? null;
  }

  async addCollaborator(entityId: string, userId: string): Promise<void> {
    await this.db.[entity]Collaborator.create({
      data: { entityId, userId },
    });
  }
}
```

### 4. Handle Transactions

Create transaction wrapper for multi-repository operations:

```typescript
// src/repositories/transaction.ts
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { [Entity]Repository } from './[entity].repository';
import { [Related]Repository } from './[related].repository';
import { UserRepository } from './user.repository';

export interface TransactionContext {
  entityRepo: [Entity]Repository;
  relatedRepo: [Related]Repository;
  userRepo: UserRepository;
}

export async function withTransaction<T>(
  fn: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const ctx: TransactionContext = {
      entityRepo: new [Entity]Repository(tx as any),
      relatedRepo: new [Related]Repository(tx as any),
      userRepo: new UserRepository(tx as any),
    };
    return fn(ctx);
  });
}

// Usage in service:
// import { withTransaction } from '@/repositories/transaction';
//
// async duplicateWithRelated(entityId: string, newName: string) {
//   return withTransaction(async ({ entityRepo, relatedRepo }) => {
//     const original = await entityRepo.findByIdWithRelated(entityId);
//     const newEntity = await entityRepo.create({ name: newName, ... });
//     for (const item of original.relatedItems) {
//       await relatedRepo.create({ ...item, entityId: newEntity.id });
//     }
//     return newEntity;
//   });
// }
```

### 5. Repository Index & Factory

Create central export:

```typescript
// src/repositories/index.ts
export * from './[entity].repository';
export * from './[related].repository';
export * from './user.repository';
export * from './transaction';

// Types
export type * from './interfaces/[entity]-repository.interface';
export type * from './interfaces/[related]-repository.interface';
export type * from './interfaces/user-repository.interface';
```

### 6. Document Repository Structure

Create `/docs/backend/repositories.md`:

````markdown
# Repository Layer

## Overview

Repositories abstract database access, providing:

- Clean separation between services and data storage
- Easy testing with mock repositories
- Centralized query logic
- Transaction support

## Repository Inventory

| Repository          | Table(s)                                           | Description               |
| ------------------- | -------------------------------------------------- | ------------------------- |
| [Entity]Repository  | [entity], [entity]\_invite, [entity]\_collaborator | Entity CRUD and sharing   |
| [Related]Repository | [related]                                          | Related entity operations |
| UserRepository      | user                                               | User data access          |

## Query Patterns

### Pagination

All `findMany` methods support `QueryOptions`:

- `skip`: Number of records to skip
- `take`: Number of records to return (default: 50)
- `orderBy`: Field to sort by
- `order`: 'asc' or 'desc'

### Transactions

Use `withTransaction()` for multi-repository operations:

```typescript
await withTransaction(async ({ entityRepo, relatedRepo }) => {
  // Both operations in same transaction
  await entityRepo.create(...);
  await relatedRepo.create(...);
});
```

## Testing

Mock repositories for unit tests:

```typescript
const mockEntityRepo: I[Entity]Repository = {
  create: vi.fn(),
  findById: vi.fn(),
  // ...
};
```
````

---

## Review Checklist

- [ ] Repository interfaces defined with clear contracts
- [ ] Base repository with common functionality
- [ ] Concrete repositories implement interfaces
- [ ] Transaction support for multi-table operations
- [ ] Query options (pagination, sorting, filtering) consistent
- [ ] Repositories don't contain business logic
- [ ] All Prisma queries encapsulated in repositories

---

## AI Agent Prompt Template

```markdown
Execute SOP-201 (Repository Pattern):

Read:

- `prisma/schema.prisma` for data model
- `/docs/backend/services.md` for service data needs

**Tasks:**

1. Create repository interfaces in `src/repositories/interfaces/`
2. Create base repository in `src/repositories/base.repository.ts`
3. Implement concrete repositories in `src/repositories/`
4. Create transaction wrapper in `src/repositories/transaction.ts`
5. Document in `/docs/backend/repositories.md`

**Key principles:**

- Repositories only handle data access (no business logic)
- Use interfaces for testability
- Encapsulate all Prisma queries
- Support transactions for multi-table operations
- Replace [Entity] placeholders with your actual domain entities
```

---

## Outputs

- [ ] `src/repositories/interfaces/` — Repository interfaces
- [ ] `src/repositories/base.repository.ts` — Base repository class
- [ ] `src/repositories/*.repository.ts` — Concrete implementations
- [ ] `src/repositories/transaction.ts` — Transaction wrapper
- [ ] `src/repositories/index.ts` — Central export
- [ ] `/docs/backend/repositories.md` — Documentation

---

## Related SOPs

- **SOP-101:** Schema Design (Prisma schema)
- **SOP-200:** Service Layer (uses repositories)
- **SOP-202:** API Design (endpoints use services → repositories)
- **SOP-500:** Unit Testing (mock repositories)
