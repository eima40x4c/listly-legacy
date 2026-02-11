/**
 * Base Repository Interface
 *
 * Common interface for all repositories with standard CRUD operations.
 *
 * @module repositories/interfaces/base-repository.interface
 */

import type { Prisma } from '@prisma/client';

/**
 * Query options for pagination and sorting
 */
export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Base repository interface with common operations
 */
export interface IBaseRepository<T> {
  /**
   * Enable transaction support
   */
  withTransaction(tx: Prisma.TransactionClient): this;
}
