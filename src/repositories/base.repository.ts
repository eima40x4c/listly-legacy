/**
 * Base Repository Class
 *
 * Abstract base class providing common repository functionality.
 * All concrete repositories extend this class for consistent transaction support.
 *
 * @module repositories/base.repository
 */

import type { Prisma, PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/db';

import type { IBaseRepository } from './interfaces/base-repository.interface';

/**
 * Abstract base repository with transaction support
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected db: PrismaClient | Prisma.TransactionClient;

  /**
   * Initialize repository with database client
   */
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    this.db = client || prisma;
  }

  /**
   * Create a new instance with a transaction client
   * Used for multi-repository operations in a transaction
   */
  withTransaction(tx: Prisma.TransactionClient): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.assign(clone, this);
    clone.db = tx;
    return clone;
  }
}
