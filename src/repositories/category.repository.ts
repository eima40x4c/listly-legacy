/**
 * Category Repository Implementation
 *
 * Data access layer for category operations.
 * Encapsulates all Prisma queries for categories.
 *
 * @module repositories/category.repository
 */

import type {
  Category,
  Prisma,
  PrismaClient,
  StoreCategory,
} from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  CategoryWithCount,
  CategoryWithStore,
  ICategoryRepository,
} from './interfaces';

export class CategoryRepository
  extends BaseRepository<Category>
  implements ICategoryRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new category
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return (this.db as PrismaClient).category.create({ data });
  }

  /**
   * Find a category by ID
   */
  async findById(id: string): Promise<Category | null> {
    return (this.db as PrismaClient).category.findUnique({
      where: { id },
    });
  }

  /**
   * Find a category by slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return (this.db as PrismaClient).category.findUnique({
      where: { slug },
    });
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    return (this.db as PrismaClient).category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).category.delete({
      where: { id },
    });
  }

  /**
   * Find all default categories
   */
  async findDefaults(): Promise<Category[]> {
    return (this.db as PrismaClient).category.findMany({
      where: { isDefault: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Find categories for a store with customization
   */
  async findByStore(storeId: string): Promise<CategoryWithStore[]> {
    const categories = await (this.db as PrismaClient).category.findMany({
      where: { isDefault: true },
      include: {
        storeCategories: {
          where: { storeId },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((category) => ({
      ...category,
      storeCategory: category.storeCategories[0]
        ? {
            id: category.storeCategories[0].id,
            aisleNumber: category.storeCategories[0].aisleNumber,
            customName: category.storeCategories[0].customName,
            sortOrder: category.storeCategories[0].sortOrder,
          }
        : undefined,
    }));
  }

  /**
   * Find categories with usage count
   */
  async findWithUsageCount(): Promise<CategoryWithCount[]> {
    const categories = await (this.db as PrismaClient).category.findMany({
      include: {
        _count: {
          select: { listItems: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((category) => ({
      ...category,
      itemCount: category._count.listItems,
    }));
  }

  /**
   * Search categories by name
   */
  async search(query: string, limit = 10): Promise<Category[]> {
    return (this.db as PrismaClient).category.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  /**
   * Create or update store category customization
   */
  async upsertStoreCategory(
    storeId: string,
    categoryId: string,
    data: Prisma.StoreCategoryCreateInput
  ): Promise<StoreCategory> {
    return (this.db as PrismaClient).storeCategory.upsert({
      where: {
        storeId_categoryId: {
          storeId,
          categoryId,
        },
      },
      update: data,
      create: {
        ...data,
        store: { connect: { id: storeId } },
        category: { connect: { id: categoryId } },
      },
    });
  }

  /**
   * Delete store category customization
   */
  async deleteStoreCategory(
    storeId: string,
    categoryId: string
  ): Promise<void> {
    await (this.db as PrismaClient).storeCategory.delete({
      where: {
        storeId_categoryId: {
          storeId,
          categoryId,
        },
      },
    });
  }
}
