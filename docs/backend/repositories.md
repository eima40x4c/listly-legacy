# Repository Layer

**Created:** 2026-02-11 (SOP-201: Repository Pattern)

## Overview

The repository layer provides a clean abstraction between business logic (services) and data storage (Prisma/PostgreSQL). Repositories encapsulate all data access logic, making services database-agnostic and enabling easy testing with mock repositories.

**Benefits:**

- **Separation of Concerns:** Services focus on business logic, repositories handle data access
- **Testability:** Easy to mock repositories for unit testing services
- **Maintainability:** Database queries centralized in one place
- **Flexibility:** Easy to swap data sources without changing business logic
- **Transaction Support:** Clean transaction handling across multiple repositories

---

## Architecture

```
┌─────────────────┐
│   API Routes    │  HTTP layer (thin controllers)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │  Business logic & orchestration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repositories   │  Data access layer (this document)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma/DB      │  Database & ORM
└─────────────────┘
```

---

## Repository Inventory

| Repository                  | Entity           | Description                           |
| --------------------------- | ---------------- | ------------------------------------- |
| **ListRepository**          | ShoppingList     | Shopping list CRUD and access control |
| **ItemRepository**          | ListItem         | List item CRUD and bulk operations    |
| **UserRepository**          | User             | User management and preferences       |
| **CategoryRepository**      | Category         | Category management and customization |
| **StoreRepository**         | Store            | Store CRUD and location queries       |
| **CollaborationRepository** | ListCollaborator | List sharing and collaboration        |

---

## Repository Structure

### Base Repository

All repositories extend `BaseRepository` which provides:

- Database client management
- Transaction support via `withTransaction()`

```typescript
import { BaseRepository } from '@/repositories/base.repository';

export class MyRepository extends BaseRepository<MyEntity> {
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  // Repository methods...
}
```

### Repository Interface

Each repository has a corresponding interface defining its contract:

```typescript
// src/repositories/interfaces/list-repository.interface.ts
export interface IListRepository extends IBaseRepository<ShoppingList> {
  create(data: Prisma.ShoppingListCreateInput): Promise<ShoppingList>;
  findById(id: string): Promise<ShoppingList | null>;
  update(
    id: string,
    data: Prisma.ShoppingListUpdateInput
  ): Promise<ShoppingList>;
  delete(id: string): Promise<void>;
  // ... other methods
}
```

---

## Usage Patterns

### Basic CRUD

```typescript
import { ListRepository } from '@/repositories';

const listRepo = new ListRepository();

// Create
const list = await listRepo.create({
  name: 'Groceries',
  owner: { connect: { id: userId } },
  status: 'ACTIVE',
});

// Read
const found = await listRepo.findById(list.id);

// Update
const updated = await listRepo.update(list.id, { name: 'Updated Name' });

// Delete
await listRepo.delete(list.id);
```

### Query Options

Repositories support pagination and sorting:

```typescript
const lists = await listRepo.findByOwner(userId, {
  skip: 0,
  take: 20,
  orderBy: 'updatedAt',
  order: 'desc',
});
```

### Access Control

Built-in access control methods:

```typescript
// Check if user has access (owner or collaborator)
const hasAccess = await listRepo.hasAccess(listId, userId);

// Check if user is owner
const isOwner = await listRepo.isOwner(listId, userId);
```

### Aggregations

Repositories provide common aggregation methods:

```typescript
// Count items
const itemCount = await itemRepo.countByList(listId);

// Count checked items
const checkedCount = await itemRepo.countCheckedByList(listId);

// Get estimated total
const total = await itemRepo.getEstimatedTotalByList(listId);
```

---

## Transaction Support

Use `withTransaction()` for multi-repository operations that must be atomic:

```typescript
import { withTransaction } from '@/repositories';

async function duplicateList(listId: string, newName: string, userId: string) {
  return withTransaction(async ({ listRepo, itemRepo }) => {
    // Create new list
    const newList = await listRepo.create({
      name: newName,
      owner: { connect: { id: userId } },
      status: 'ACTIVE',
    });

    // Copy items
    const items = await itemRepo.findByList(listId);
    for (const item of items) {
      await itemRepo.create({
        name: item.name,
        quantity: item.quantity,
        list: { connect: { id: newList.id } },
        addedBy: { connect: { id: userId } },
      });
    }

    return newList;
  });
}
```

**Key Points:**

- All operations in the callback are part of one transaction
- If any operation fails, all changes are rolled back
- Transaction context provides all repositories configured for the transaction

---

## Service Integration

Services use repositories instead of direct Prisma calls:

```typescript
// ❌ OLD: Direct Prisma calls in service
export class ListService {
  async create(userId: string, input: ICreateListInput) {
    return prisma.shoppingList.create({
      data: {
        name: input.name,
        ownerId: userId,
      },
    });
  }
}

// ✅ NEW: Repository pattern
export class ListService {
  private listRepo: ListRepository;

  constructor() {
    this.listRepo = new ListRepository();
  }

  async create(userId: string, input: ICreateListInput) {
    return this.listRepo.create({
      name: input.name,
      owner: { connect: { id: userId } },
    });
  }
}
```

---

## Testing with Repositories

Repositories make unit testing services easy:

```typescript
import { vi } from 'vitest';
import type { IListRepository } from '@/repositories';

describe('ListService', () => {
  it('should create a list', async () => {
    // Mock repository
    const mockListRepo: IListRepository = {
      create: vi.fn().mockResolvedValue({ id: '123', name: 'Test' }),
      countByOwner: vi.fn().mockResolvedValue(0),
      // ... other methods
    };

    // Inject mock into service
    const service = new ListService();
    service['listRepo'] = mockListRepo;

    // Test
    const result = await service.create('user123', { name: 'Test' });

    expect(mockListRepo.create).toHaveBeenCalled();
    expect(result.name).toBe('Test');
  });
});
```

---

## Repository Method Naming Conventions

| Pattern           | Example                     | Description                |
| ----------------- | --------------------------- | -------------------------- |
| `create()`        | `create(data)`              | Create single entity       |
| `findById()`      | `findById(id)`              | Find by ID                 |
| `findByIdWith...` | `findByIdWithDetails(id)`   | Find with relations        |
| `findBy...`       | `findByOwner(ownerId)`      | Find by criteria           |
| `findAll()`       | `findAll(options)`          | Find all with pagination   |
| `update()`        | `update(id, data)`          | Update single entity       |
| `delete()`        | `delete(id)`                | Delete single entity       |
| `countBy...`      | `countByList(listId)`       | Count entities by criteria |
| `is...`           | `isOwner(listId, userId)`   | Boolean check              |
| `has...`          | `hasAccess(listId, userId)` | Boolean check              |
| `bulkUpdate()`    | `bulkUpdate(ids, data)`     | Update multiple entities   |
| `bulkDelete()`    | `bulkDelete(ids)`           | Delete multiple entities   |

---

## Query Optimization

### Avoid N+1 Queries

Use `include` in repositories to fetch related data:

```typescript
async findByIdWithDetails(id: string): Promise<ListWithItems | null> {
  return this.db.shoppingList.findUnique({
    where: { id },
    include: {
      items: true,
      collaborators: {
        include: {
          user: true,
        },
      },
    },
  });
}
```

### Batch Operations

Use batch methods when operating on multiple entities:

```typescript
// ❌ BAD: Multiple queries
for (const id of itemIds) {
  await itemRepo.delete(id);
}

// ✅ GOOD: Single batch query
await itemRepo.bulkDelete(itemIds);
```

---

## Migration Status

### Completed

All services have been successfully refactored to use the Repository Pattern:

- ✅ **ListService** — Uses ListRepository, ItemRepository, CollaborationRepository
- ✅ **ItemService** — Uses ItemRepository, CategoryRepository, ListRepository
- ✅ **CategoryService** — Uses CategoryRepository (fully migrated)
- ✅ **StoreService** — Uses StoreRepository
- ✅ **UserService** — Uses UserRepository (fully migrated)
- ✅ **CollaborationService** — Uses CollaborationRepository, ListRepository, UserRepository

### Repository Methods Added

- ✅ **CategoryRepository.search()** — Search categories by name with configurable limit
- ✅ **UserRepository.searchByEmail()** — Search users by email with active user filtering

All direct Prisma calls have been eliminated from services.

### Testing Status

Comprehensive unit tests created for all repositories:

- ✅ **ListRepository** — 8 test suites covering create, find, update, delete, access control
- ✅ **ItemRepository** — 14 test suites covering CRUD, bulk operations, position updates
- ✅ **UserRepository** — 11 test suites including new searchByEmail tests
- ✅ **CategoryRepository** — 9 test suites including new search tests
- ✅ **StoreRepository** — 6 test suites covering store management and search
- ✅ **CollaborationRepository** — 10 test suites covering collaboration management

All tests use mocked Prisma clients for isolated unit testing with vitest.

Test coverage includes:

- ✅ CRUD operations with various input scenarios
- ✅ Edge cases (empty results, not found, access denied)
- ✅ Custom limits and pagination parameters
- ✅ Active user filtering in search operations
- ✅ Case-insensitive search functionality

### Remaining Work

1. ~~Add `search()` method to CategoryRepository~~ ✅ DONE
2. ~~Add `searchByEmail()` method to UserRepository~~ ✅ DONE
3. Add integration tests for service layer
4. Add E2E tests for API endpoints

---

## Related Documentation

- [Service Layer](./services.md) — Business logic that uses repositories
- [Database Schema](../database/schema.md) — Data model
- [Design Patterns](../architecture/patterns.md) — Repository pattern explanation
- [API Endpoints](../api/endpoints.md) — HTTP layer that calls services

---

## Future Enhancements

1. **Generic Query Builder** — Advanced filtering and sorting
2. **Caching Layer** — Redis integration for frequently accessed data
3. **Soft Delete Support** — Add `deletedAt` timestamps
4. **Audit Logging** — Track all data changes
5. **Read Replicas** — Direct read queries to replicas for better performance
