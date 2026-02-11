/**
 * Transaction Wrapper
 *
 * Provides transaction support for multi-repository operations.
 * Ensures atomicity across multiple database operations.
 *
 * @module repositories/transaction
 */

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';

import { CategoryRepository } from './category.repository';
import { CollaborationRepository } from './collaboration.repository';
import { ItemRepository } from './item.repository';
import { ListRepository } from './list.repository';
import { StoreRepository } from './store.repository';
import { UserRepository } from './user.repository';

/**
 * Transaction context with all repositories configured for transaction
 */
export interface TransactionContext {
  listRepo: ListRepository;
  itemRepo: ItemRepository;
  userRepo: UserRepository;
  categoryRepo: CategoryRepository;
  storeRepo: StoreRepository;
  collaborationRepo: CollaborationRepository;
}

/**
 * Execute a function within a database transaction
 *
 * All repository operations within the callback will be part of the same transaction.
 * If any operation fails, all changes will be rolled back.
 *
 * @param fn - Function to execute within transaction
 * @returns The result of the callback function
 *
 * @example
 * ```typescript
 * await withTransaction(async ({ listRepo, itemRepo }) => {
 *   const list = await listRepo.create({ name: 'Groceries', ownerId: userId });
 *   await itemRepo.create({ name: 'Milk', listId: list.id, addedById: userId });
 *   return list;
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (_txContext: TransactionContext) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const txContext: TransactionContext = {
      listRepo: new ListRepository(tx as Prisma.TransactionClient),
      itemRepo: new ItemRepository(tx as Prisma.TransactionClient),
      userRepo: new UserRepository(tx as Prisma.TransactionClient),
      categoryRepo: new CategoryRepository(tx as Prisma.TransactionClient),
      storeRepo: new StoreRepository(tx as Prisma.TransactionClient),
      collaborationRepo: new CollaborationRepository(
        tx as Prisma.TransactionClient
      ),
    };
    return fn(txContext);
  });
}
